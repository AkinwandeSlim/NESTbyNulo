-- Reassign gapless waitlist positions based on created_at (oldest = #1)
-- Run this in Supabase SQL Editor to fix existing gaps

BEGIN;

-- 1. Lock the table to prevent new signups during reassignment
LOCK TABLE waitlist IN EXCLUSIVE MODE;

-- 2. Reassign positions: oldest created_at gets #1, next #2, etc.
WITH ordered_waitlist AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) AS new_position
  FROM waitlist
)
UPDATE waitlist w
SET waitlist_position = ow.new_position
FROM ordered_waitlist ow
WHERE w.id = ow.id;

-- 3. Reset the sequence to match the current max position, so future signups continue without gaps
SELECT setval('waitlist_position_seq', COALESCE(MAX(waitlist_position), 1), false)
FROM waitlist;

-- 4. Verify the fix
SELECT
  COUNT(*) AS total_signups,
  MIN(waitlist_position) AS min_position,
  MAX(waitlist_position) AS max_position,
  CASE WHEN COUNT(*) = MAX(waitlist_position) THEN '✅ No gaps' ELSE '❌ Gaps still exist' END AS gap_status
FROM waitlist;

COMMIT;
