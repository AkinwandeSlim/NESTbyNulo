-- ============================================================================
-- Reset NEST waitlist database
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (Project → SQL → New query).
-- This is DESTRUCTIVE: all signups, referral counts, and positions are wiped
-- and the next signup will be assigned position #1.
--
-- Side-effects NOT covered here (clean up separately if needed):
--   - Google Sheets "Realtime_Signups" tab still contains all historical rows
--   - Google Sheets "Daily_Sync" tab still contains daily aggregates
--   - Each visitor's browser `localStorage.nest_waitlist_success` will still
--     show their old success view until cleared
-- ============================================================================

BEGIN;

-- 1. Wipe every row. CASCADE handles any FK references (e.g. referred_by).
TRUNCATE TABLE waitlist RESTART IDENTITY CASCADE;

-- 2. Reset the sequence that assigns `waitlist_position`. Even though the
--    table's identity columns are reset above, the `waitlist_position_seq`
--    used by the BEFORE INSERT trigger is a standalone sequence and must be
--    restarted explicitly so the next signup becomes #1 again.
ALTER SEQUENCE waitlist_position_seq RESTART WITH 1;

-- 3. Sanity check: confirm the table is empty and the sequence is at 1.
SELECT COUNT(*) AS remaining_rows FROM waitlist;
SELECT last_value, is_called FROM waitlist_position_seq;

COMMIT;
