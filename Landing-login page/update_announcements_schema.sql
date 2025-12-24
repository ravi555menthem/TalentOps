-- 1. Add status column if it doesn't exist
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'future';

-- 2. Drop the constraint if it exists (to allow changing enum values)
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_status_check;

-- 3. Migrate any existing 'scheduled' statuses to 'future'
UPDATE announcements SET status = 'future' WHERE status = 'scheduled';

-- 4. Update NULL records based on date
UPDATE announcements
SET status = CASE
    WHEN event_date > CURRENT_DATE THEN 'future'
    WHEN event_date = CURRENT_DATE THEN 'active'
    ELSE 'completed'
END
WHERE status IS NULL;

-- 5. Add the constraint with the new values
ALTER TABLE announcements ADD CONSTRAINT announcements_status_check CHECK (status IN ('future', 'active', 'completed'));
