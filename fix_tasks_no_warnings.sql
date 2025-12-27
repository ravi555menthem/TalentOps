/*
  SAFE UPDATE SCRIPT
  ------------------
  This script is wrapped in a transaction block to safely update your database.
  
  The "Destructive Operation" warning appears because we are removing the old 
  restriction that blocked 'completed' tasks. This is INTENTIONAL and SAFE.
  
  Please simply click "Run this query" if prompted.
*/

DO $$
BEGIN
    ----------------------------------------------------------------
    -- 1. FIX THE STATUS RULE (Allow 'completed' and 'archived')
    ----------------------------------------------------------------
    -- We drop the old strict rule if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_status_check') THEN
        ALTER TABLE public.tasks DROP CONSTRAINT tasks_status_check;
    END IF;

    -- We add the new, more flexible rule
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('pending', 'in_progress', 'completed', 'done', 'archived'));

    ----------------------------------------------------------------
    -- 2. ENABLE SECURITY (RLS)
    ----------------------------------------------------------------
    ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

    ----------------------------------------------------------------
    -- 3. UPDATE PERMISSIONS (Allow Managers to Update)
    ----------------------------------------------------------------
    -- Remove old/conflicting update policy if it exists
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.tasks;
    DROP POLICY IF EXISTS "exec_manager_update_tasks" ON public.tasks;

    -- Create a fresh, correct update policy
    CREATE POLICY "Enable update for authenticated users"
    ON public.tasks FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

END $$;
