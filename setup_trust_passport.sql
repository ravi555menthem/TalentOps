/*
  TRUST PASSPORT SYSTEM
  ---------------------
  Calculates Employee Trust Score based on:
  - Certified Tasks %
  - Avg Confidence Score
  - Risk Flags
  - Delay History
  - Rejection Rate
*/

create or replace function get_employee_trust_profile(emp_id uuid)
returns json as $$
declare
  total_tasks int;
  certified_tasks int;
  avg_confidence numeric;
  risk_flags int;
  overdue_tasks int;
  rejected_tasks int;
  rejection_rate numeric;
  trust_score numeric;
  
  tasks_assigned int;
begin
  -- 1. Total Tasks Assigned
  select count(*) into tasks_assigned from public.tasks where assigned_to = emp_id;
  
  if tasks_assigned = 0 then
    return json_build_object(
      'trust_score', 0,
      'certified_percent', 0,
      'avg_confidence', 0,
      'risk_flags', 0,
      'overdue_count', 0,
      'rejection_rate', 0
    );
  end if;

  -- 2. Certified Tasks (Completion >= 100 in task_progress linked to tasks assigned to user)
  select count(tp.task_id) into certified_tasks
  from public.task_progress tp
  join public.tasks t on t.id = tp.task_id
  where t.assigned_to = emp_id and tp.completion_percent >= 100;

  -- 3. Avg Confidence
  select coalesce(avg(tp.confidence_score), 0) into avg_confidence
  from public.task_progress tp
  join public.tasks t on t.id = tp.task_id
  where t.assigned_to = emp_id;

  -- 4. Risk Flags
  select count(tp.task_id) into risk_flags
  from public.task_progress tp
  join public.tasks t on t.id = tp.task_id
  where t.assigned_to = emp_id and tp.risk_flag = true;

  -- 5. Delay History (Overdue & Incomplete)
  select count(*) into overdue_tasks
  from public.tasks
  where assigned_to = emp_id 
  and due_date < now() 
  and status not in ('completed', 'done', 'cancelled');

  -- 6. Rejection Rate
  -- Count unique tasks that had at least one rejected review
  select count(distinct task_id) into rejected_tasks
  from public.task_reviews
  where task_id in (select id from public.tasks where assigned_to = emp_id)
  and approved = false;

  rejection_rate := (rejected_tasks::numeric / tasks_assigned::numeric) * 100;

  -- 7. CALCULATE TRUST SCORE (0-100)
  -- Base: 50
  -- Certified Bonus: up to +30
  -- Confidence Bonus: up to +20
  -- Penalties: Risks (-5 each), Rejections (-3 each), Delays (-2 each)
  
  trust_score := 50 + 
                 ((certified_tasks::numeric / tasks_assigned::numeric) * 30) + 
                 (avg_confidence * 0.2);
                 
  trust_score := trust_score - (risk_flags * 5) - (rejected_tasks * 3) - (overdue_tasks * 2);
  
  if trust_score < 0 then trust_score := 0; end if;
  if trust_score > 100 then trust_score := 100; end if;

  return json_build_object(
    'trust_score', round(trust_score),
    'certified_percent', round((certified_tasks::numeric / tasks_assigned::numeric) * 100),
    'avg_confidence', round(avg_confidence),
    'risk_flags', risk_flags,
    'overdue_count', overdue_tasks,
    'rejection_rate', round(rejection_rate)
  );
end;
$$ language plpgsql;
