/*
  SAFE SCHEMA UPDATE
  ------------------
  This script is purely ADDITIVE. It will NOT delete or drop any existing data or tables.
  It checks if something exists before trying to create it to avoid errors.
*/

-- 1. Safely add columns to 'tasks' only if they don't exist
do $$
begin
    -- Add team_id if missing
    if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'team_id') then
        alter table public.tasks add column team_id uuid;
    end if;
end $$;

-- 2. Create new tables strictly if they don't exist (Preserves existing data)
create table if not exists public.task_blueprint (
  task_id uuid references public.tasks(id) on delete cascade primary key,
  expected_deliverables text,
  expected_screenshots int default 0,
  min_files int default 0,
  estimated_hours numeric,
  weight_rule text,
  auto_approval_allowed boolean default false,
  delay_penalty_percent numeric default 0,
  business_impact_type text,
  created_at timestamptz default now()
);

create table if not exists public.task_submissions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade,
  employee_id uuid references auth.users(id),
  description text,
  submission_time timestamptz default now()
);

create table if not exists public.task_evidence (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.task_submissions(id) on delete cascade,
  file_url text not null,
  file_type text,
  proof_score numeric default 0,
  uploaded_at timestamptz default now()
);

create table if not exists public.task_progress (
  task_id uuid references public.tasks(id) on delete cascade primary key,
  completion_percent numeric default 0,
  confidence_score numeric default 0,
  authenticity_score numeric default 0,
  risk_flag boolean default false,
  last_updated timestamptz default now()
);

create table if not exists public.task_reviews (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  comment text,
  approved boolean,
  reviewed_at timestamptz default now()
);

-- 3. Enable RLS on new tables (Idempotent)
alter table public.task_blueprint enable row level security;
alter table public.task_submissions enable row level security;
alter table public.task_evidence enable row level security;
alter table public.task_progress enable row level security;
alter table public.task_reviews enable row level security;

-- 4. Safely Create Policies (Checks existence first to avoid errors)
do $$
begin
    -- Policy for task_blueprint
    if not exists (select 1 from pg_policies where tablename = 'task_blueprint' and policyname = 'Enable access for authenticated users') then
        create policy "Enable access for authenticated users" on public.task_blueprint for all using (auth.role() = 'authenticated');
    end if;

    -- Policy for task_submissions
    if not exists (select 1 from pg_policies where tablename = 'task_submissions' and policyname = 'Enable access for authenticated users') then
        create policy "Enable access for authenticated users" on public.task_submissions for all using (auth.role() = 'authenticated');
    end if;

    -- Policy for task_evidence
    if not exists (select 1 from pg_policies where tablename = 'task_evidence' and policyname = 'Enable access for authenticated users') then
        create policy "Enable access for authenticated users" on public.task_evidence for all using (auth.role() = 'authenticated');
    end if;

    -- Policy for task_progress
    if not exists (select 1 from pg_policies where tablename = 'task_progress' and policyname = 'Enable access for authenticated users') then
        create policy "Enable access for authenticated users" on public.task_progress for all using (auth.role() = 'authenticated');
    end if;

    -- Policy for task_reviews
    if not exists (select 1 from pg_policies where tablename = 'task_reviews' and policyname = 'Enable access for authenticated users') then
        create policy "Enable access for authenticated users" on public.task_reviews for all using (auth.role() = 'authenticated');
    end if;
end $$;


-- 5. Calculation Function (Replace is safe, logic update only)
create or replace function calculate_task_scores(task_u_id uuid)
returns void as $$
declare
  t_submission_id uuid;
  t_valid_files int;
  t_required_files int;
  t_proof_score numeric;
  t_completion numeric;
  t_confidence numeric;
begin
  -- Get latest submission
  select id into t_submission_id from public.task_submissions where task_id = task_u_id order by submission_time desc limit 1;
  
  -- Get requirements
  select min_files into t_required_files from public.task_blueprint where task_id = task_u_id;
  
  -- Count files
  select count(*) into t_valid_files from public.task_evidence where submission_id = t_submission_id;
  
  -- Mock Score Logic
  t_proof_score := 85; 
  
  -- Calculate Confidence
  if t_required_files > 0 then
    t_confidence := (t_valid_files::numeric / t_required_files::numeric) * 100;
  else
    t_confidence := 100;
  end if;
  
  if t_confidence > 100 then t_confidence := 100; end if;
  
  -- Calculate Completion
  t_completion := (t_proof_score + t_confidence) / 2;
  
  -- Update Progress
  insert into public.task_progress (task_id, completion_percent, confidence_score, authenticity_score, risk_flag, last_updated)
  values (task_u_id, t_completion, t_confidence, 90, false, now())
  on conflict (task_id) do update set
    completion_percent = excluded.completion_percent,
    confidence_score = excluded.confidence_score,
    last_updated = now();
    
end;
$$ language plpgsql;
