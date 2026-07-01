-- Replace sequence-based position assignment with gapless calculation
-- This ensures no gaps even if transactions fail or rows are deleted
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Drop the old sequence-based trigger and function
DROP TRIGGER IF EXISTS set_waitlist_position ON waitlist;
DROP FUNCTION IF EXISTS assign_waitlist_position();

-- 2. Drop the old sequence (we don't need it anymore)
DROP SEQUENCE IF EXISTS waitlist_position_seq;

-- 3. Create new gapless position assignment function
CREATE OR REPLACE FUNCTION assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate position as current number of rows + 1 (oldest = #1)
  NEW.waitlist_position := (SELECT COALESCE(COUNT(*), 0) + 1 FROM waitlist);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger with the new function
CREATE TRIGGER set_waitlist_position
BEFORE INSERT ON waitlist
FOR EACH ROW EXECUTE FUNCTION assign_waitlist_position();

COMMIT;
