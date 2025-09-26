-- Add referral tracking table
CREATE TABLE referral_tracking (
  id TEXT PRIMARY KEY,
  referrer_fid TEXT NOT NULL,
  referred_fid TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT referral_unique_idx UNIQUE(referrer_fid, referred_fid)
);

-- Enable Row Level Security
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;

-- Policy for selecting records: Users can only view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
  ON referral_tracking
  FOR SELECT
  USING (referrer_fid = auth.uid()::text);

-- Policy for inserting records: Users can only create referrals where they are the referred user
CREATE POLICY "Users can create referrals when referred"
  ON referral_tracking
  FOR INSERT
  WITH CHECK (referred_fid = auth.uid()::text);

-- Policy for service role to manage all referrals
CREATE POLICY "Service role full access"
  ON referral_tracking
  FOR ALL
  USING (auth.role() = 'service_role');