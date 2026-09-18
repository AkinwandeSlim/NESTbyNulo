-- Run this in your Supabase SQL Editor

CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  investor_type TEXT CHECK (investor_type IN ('first_time', 'existing_landlord', 'diaspora')) NOT NULL,
  referral_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  referred_by TEXT REFERENCES waitlist(referral_code),
  referral_count INTEGER DEFAULT 0,
  waitlist_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-assign sequential waitlist position on insert
CREATE SEQUENCE waitlist_position_seq;

CREATE OR REPLACE FUNCTION assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.waitlist_position := nextval('waitlist_position_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_waitlist_position
BEFORE INSERT ON waitlist
FOR EACH ROW EXECUTE FUNCTION assign_waitlist_position();

-- Increment referral count on the referrer's row when someone joins via their link
CREATE OR REPLACE FUNCTION increment_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE waitlist SET referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_referral_join
AFTER INSERT ON waitlist
FOR EACH ROW EXECUTE FUNCTION increment_referral_count();
