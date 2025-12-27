/*
  IMMUTABLE AUDIT VAULT SETUP
  ---------------------------
  Creates a tamper-proof ledger for certified tasks.
  1. Table: task_audit_ledger (Append-Only)
  2. Function: archive_certified_task (Snapshots all data)
*/

-- 1. Create the Ledger Table
create table if not exists public.task_audit_ledger (
    audit_id uuid default gen_random_uuid() primary key,
    task_id uuid not null references public.tasks(id),
    project_name text,
    task_title text not null,
    employee_id uuid,
    reviewer_id uuid,
    certified_at timestamptz default now(),
    
    -- Data Snapshots (JSONB for flexibility)
    proofs_snapshot jsonb,       -- List of files, IDs, upload times
    scores_snapshot jsonb,       -- { completion: 100, confidence: 95, ... }
    risk_snapshot jsonb,         -- { risk_flag: false, details: ... }
    review_snapshot jsonb,       -- { comment: "Good job", approver: "Manager Name" }
    
    -- Integrity
    ledger_hash text,            -- Simple hash to ensure data hasn't changed (mock)
    
    unique(task_id)              -- Only one final audit record per task
);

-- 2. Enable RLS
alter table public.task_audit_ledger enable row level security;

-- 3. Strict Policies (Append-Only)
-- Allow View
create policy "Enable read access for authenticated users" 
on public.task_audit_ledger for select 
using (auth.role() = 'authenticated');

-- Allow Insert (Normally restricted to server-side, but allowed here for the RPC/App logic)
create policy "Enable insert for authenticated users" 
on public.task_audit_ledger for insert 
with check (auth.role() = 'authenticated');

-- EXPLICITLY NO UPDATE OR DELETE POLICIES CREATED
-- This effectively makes the table immutable via the API.

-- 4. Archive Function (The "Seal")
create or replace function archive_certified_task(
    p_task_id uuid,
    p_reviewer_id uuid
)
returns json as $$
declare
    v_task record;
    v_progress record;
    v_latest_review record;
    v_proofs jsonb;
    v_scores jsonb;
    v_risks jsonb;
    v_review_data jsonb;
    v_hash text;
    v_audit_id uuid;
begin
    -- A. Fetch Task Details
    select * into v_task from public.tasks where id = p_task_id;
    if not found then raise exception 'Task not found'; end if;

    -- B. Fetch Intelligence Scores
    select * into v_progress from public.task_progress where task_id = p_task_id;
    
    v_scores := json_build_object(
        'completion_percent', coalesce(v_progress.completion_percent, 0),
        'confidence_score', coalesce(v_progress.confidence_score, 0),
        'authenticity_score', coalesce(v_progress.authenticity_score, 0)
    );
    
    v_risks := json_build_object(
        'risk_flag', coalesce(v_progress.risk_flag, false)
    );

    -- C. Fetch Proofs (Aggregation)
    -- We need to find the submission first
    select json_agg(json_build_object(
        'file_url', te.file_url,
        'uploaded_at', te.uploaded_at,
        'proof_score', te.proof_score
    )) into v_proofs
    from public.task_evidence te
    join public.task_submissions ts on ts.id = te.submission_id
    where ts.task_id = p_task_id;

    -- D. Fetch Latest Review
    select * into v_latest_review 
    from public.task_reviews 
    where task_id = p_task_id 
    order by reviewed_at desc limit 1;
    
    v_review_data := json_build_object(
        'comment', v_latest_review.comment,
        'approved_at', v_latest_review.reviewed_at
    );

    -- E. Generate "Seal" (Mock Hash of ID + Time)
    v_hash := md5(p_task_id::text || now()::text || 'TalentOps-Certified');

    -- F. Insert into Ledger
    insert into public.task_audit_ledger (
        task_id,
        project_name, 
        task_title,
        employee_id,
        reviewer_id,
        proofs_snapshot,
        scores_snapshot,
        risk_snapshot,
        review_snapshot,
        ledger_hash
    ) values (
        p_task_id,
        'TalentOps Project', -- Placeholder or join with projects table if exists
        v_task.title,
        v_task.assigned_to,
        p_reviewer_id,
        coalesce(v_proofs, '[]'::jsonb),
        v_scores,
        v_risks,
        v_review_data,
        v_hash
    ) returning audit_id into v_audit_id;

    return json_build_object('success', true, 'audit_id', v_audit_id);
end;
$$ language plpgsql;
