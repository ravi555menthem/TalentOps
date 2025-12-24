-- SQL Script to set up leave accumulation system
-- Run this in your Supabase SQL Editor

-- 1. Update the profiles table to ensure leaves_remaining has the correct DEFAULT
-- This makes leaves_remaining default to monthly_leave_quota value
ALTER TABLE profiles 
ALTER COLUMN leaves_remaining SET DEFAULT (monthly_leave_quota);

-- Note: The above won't work because DEFAULT can't reference another column
-- Instead, we'll use a trigger to set the initial value

-- 2. Create a function to initialize leaves_remaining
CREATE OR REPLACE FUNCTION initialize_leaves_remaining()
RETURNS TRIGGER AS $$
BEGIN
  -- Set leaves_remaining to monthly_leave_quota if not explicitly set
  IF NEW.leaves_remaining IS NULL THEN
    NEW.leaves_remaining := NEW.monthly_leave_quota;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger to run the function before insert
DROP TRIGGER IF EXISTS set_initial_leaves ON profiles;
CREATE TRIGGER set_initial_leaves
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_leaves_remaining();

-- 4. Create a function to accumulate leaves monthly
CREATE OR REPLACE FUNCTION accumulate_monthly_leaves()
RETURNS void AS $$
BEGIN
  -- Add monthly_leave_quota to leaves_remaining for all active employees
  UPDATE profiles
  SET 
    leaves_remaining = leaves_remaining + monthly_leave_quota,
    leaves_taken_this_month = 0  -- Reset monthly counter
  WHERE role IN ('employee', 'team lead', 'manager', 'executive');
END;
$$ LANGUAGE plpgsql;

-- 5. Optional: Create a scheduled job to run monthly leave accumulation
-- This requires the pg_cron extension (available in Supabase)
-- Uncomment and adjust the schedule as needed:

-- SELECT cron.schedule(
--   'monthly-leave-accumulation',
--   '0 0 1 * *',  -- Run at midnight on the 1st of every month
--   $$SELECT accumulate_monthly_leaves()$$
-- );

-- 6. To manually run the monthly accumulation (for testing):
-- SELECT accumulate_monthly_leaves();

-- 7. View current leave balances
-- SELECT 
--   full_name, 
--   email, 
--   monthly_leave_quota, 
--   leaves_remaining, 
--   leaves_taken_this_month 
-- FROM profiles 
-- WHERE role IN ('employee', 'team lead', 'manager', 'executive')
-- ORDER BY full_name;
