-- 1. Add public_slug to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(public_slug);

-- 2. New Reading Log Table
CREATE TABLE IF NOT EXISTS readings_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read_date DATE NOT NULL,
  score INTEGER NOT NULL,
  title TEXT NOT NULL,
  moon_house INTEGER,
  tithi TEXT,
  maha_dasha TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, read_date)
);

-- 3. RLS for Profiles Sharing
CREATE POLICY "Public read by slug"
ON profiles FOR SELECT
USING (public_slug IS NOT NULL);

-- 4. RLS for Readings Log
ALTER TABLE readings_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own readings" ON readings_log;
CREATE POLICY "Users manage own readings"
ON readings_log FOR ALL USING (auth.uid() = user_id);

-- 5. Calculated Charts Cache
CREATE TABLE IF NOT EXISTS calculated_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_hash TEXT NOT NULL,
  chart_data JSONB NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, calculation_hash)
);

ALTER TABLE calculated_charts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own calculated charts" ON calculated_charts;
CREATE POLICY "Users manage own calculated charts"
ON calculated_charts FOR ALL USING (auth.uid() = user_id);

