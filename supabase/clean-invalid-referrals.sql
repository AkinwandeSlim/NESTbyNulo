-- Clean up invalid referred_by codes (codes that don't exist in the waitlist table)
-- Run this in Supabase SQL Editor if you suspect bad referral data

BEGIN;

-- 1. First, find all invalid referred_by codes to review before deleting
SELECT
  id,
  full_name,
  email,
  referred_by AS invalid_referral_code
FROM waitlist
WHERE referred_by IS NOT NULL
  AND referred_by NOT IN (SELECT referral_code FROM waitlist);

-- 2. Then, set invalid referred_by codes to NULL (safe, non-destructive)
UPDATE waitlist
SET referred_by = NULL
WHERE referred_by IS NOT NULL
  AND referred_by NOT IN (SELECT referral_code FROM waitlist);

-- 3. Verify the fix
SELECT COUNT(*) AS fixed_invalid_referrals
FROM waitlist
WHERE referred_by IS NULL
  AND referred_by NOT IN (SELECT referral_code FROM waitlist);

COMMIT;
