/*
  TASK AUTO CALCULATION ENGINE - SAFE MODE
  ----------------------------------------
  This script creates the logic to automatically calculate scores.
  It uses 'CREATE OR REPLACE' to safely update logic without deleting tables.
  Triggers are managed safely to ensure no data loss.
*/

-- 1. Improved Calculation Logic Function
-- This function contains the "Brain" of the scoring. It updates existing records, never deletes them.
create or replace function calculate_task_scores_trigger()
returns trigger as $$
declare
    t_task_id uuid;
    t_submission_id uuid;
    
    -- Blueprint Rules
    r_min_files int;
    r_delay_penalty numeric;
    r_weight_rule text;
    
    -- Evidence Data
    d_file_count int;
    d_desc_length int;
    
    -- Task Data
    d_due_date timestamptz;
    
    -- Calculated Metrics
    calc_confidence numeric;
    calc_proof numeric;
    calc_completion numeric;
    calc_risk boolean;
    is_late boolean;
begin
    -- Determine Task ID based on the trigger source table
    if TG_TABLE_NAME = 'task_submissions' then
        t_task_id := NEW.task_id;
        t_submission_id := NEW.id;
    elsif TG_TABLE_NAME = 'task_evidence' then
        select task_id into t_task_id from public.task_submissions where id = NEW.submission_id;
        t_submission_id := NEW.submission_id;
    end if;

    -- 1. Get Blueprint Rules
    select min_files, delay_penalty_percent, weight_rule 
    into r_min_files, r_delay_penalty, r_weight_rule
    from public.task_blueprint 
    where task_id = t_task_id;
    
    -- Handle case where no blueprint exists (legacy tasks)
    if r_min_files is null then r_min_files := 1; end if;
    if r_delay_penalty is null then r_delay_penalty := 0; end if;

    -- 2. Get Task Deadline
    select due_date into d_due_date from public.tasks where id = t_task_id;

    -- 3. Analyze Evidence (Count files & check description)
    select count(*) into d_file_count from public.task_evidence where submission_id = t_submission_id;
    
    select coalesce(length(description), 0) into d_desc_length 
    from public.task_submissions 
    where id = t_submission_id;

    -- 4. PERFORM CALCULATIONS
    
    -- A. Confidence Score (Files vs Requirement)
    if r_min_files > 0 then
        calc_confidence := (d_file_count::numeric / r_min_files::numeric) * 100;
        if calc_confidence > 100 then calc_confidence := 100; end if;
    else
        calc_confidence := 100; -- No files required
    end if;

    -- B. Risk Flag (Late Submission or Low Confidence)
    is_late := (now() > d_due_date);
    calc_risk := is_late OR (calc_confidence < 50);

    -- C. Completion Percent
    -- Formula: (Confidence + Description_Weight) - Penalty
    calc_proof := 0;
    if d_desc_length > 20 then calc_proof := 100; else calc_proof := 20; end if;
    
    calc_completion := (calc_confidence * 0.7) + (calc_proof * 0.3);
    
    if is_late then
        calc_completion := calc_completion - r_delay_penalty;
    end if;
    
    if calc_completion < 0 then calc_completion := 0; end if;

    -- 5. Insert/Update Task Progress
    insert into public.task_progress (task_id, completion_percent, confidence_score, authenticity_score, risk_flag, last_updated)
    values (t_task_id, calc_completion, calc_confidence, 85, calc_risk, now())
    on conflict (task_id) do update set
        completion_percent = excluded.completion_percent,
        confidence_score = excluded.confidence_score,
        risk_flag = excluded.risk_flag,
        last_updated = now();

    return NEW;
end;
$$ language plpgsql;

-- 2. Safely Create Triggers
-- We use DO blocks to avoid simple "Destructive" warnings in UI, while ensuring triggers are correctly set.

do $$
begin
    -- Trigger A: On Submission Created
    if not exists (select 1 from pg_trigger where tgname = 'on_submission_created') then
        create trigger on_submission_created
        after insert on public.task_submissions
        for each row execute function calculate_task_scores_trigger();
    end if;

    -- Trigger B: On File Uploaded
    if not exists (select 1 from pg_trigger where tgname = 'on_evidence_added') then
        create trigger on_evidence_added
        after insert on public.task_evidence
        for each row execute function calculate_task_scores_trigger();
    end if;

    -- Trigger C: On File Removed
    if not exists (select 1 from pg_trigger where tgname = 'on_evidence_removed') then
        create trigger on_evidence_removed
        after delete on public.task_evidence
        for each row execute function calculate_task_scores_trigger();
    end if;
end $$;
