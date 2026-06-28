-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_locations (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    ip_address   TEXT,
    city         TEXT,
    region       TEXT,
    country      TEXT,
    country_code TEXT,
    latitude     NUMERIC,
    longitude    NUMERIC,
    isp          TEXT,
    timezone     TEXT,
    logged_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_logged_at ON user_locations(logged_at DESC);

-- Allow users to see their own location logs (optional)
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own locations" ON user_locations
    FOR SELECT USING (auth.uid() = user_id);

-- Service role (used by the API route) bypasses RLS automatically
