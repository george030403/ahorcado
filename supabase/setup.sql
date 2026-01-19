-- =====================================================
-- SUPABASE SETUP SCRIPT - Ahorcado Multiplayer
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- =====================================================

-- Create the KV Store table for game data
CREATE TABLE IF NOT EXISTS kv_store_e9cd80f1 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster prefix searches
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_e9cd80f1 (key text_pattern_ops);

-- Enable Row Level Security
ALTER TABLE kv_store_e9cd80f1 ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated and anonymous access
-- Policy for SELECT
CREATE POLICY "Allow public read access" ON kv_store_e9cd80f1
  FOR SELECT
  TO public
  USING (true);

-- Policy for INSERT
CREATE POLICY "Allow public insert access" ON kv_store_e9cd80f1
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for UPDATE
CREATE POLICY "Allow public update access" ON kv_store_e9cd80f1
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policy for DELETE
CREATE POLICY "Allow public delete access" ON kv_store_e9cd80f1
  FOR DELETE
  TO public
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store_e9cd80f1;
CREATE TRIGGER update_kv_store_updated_at
  BEFORE UPDATE ON kv_store_e9cd80f1
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES (optional, run to verify setup)
-- =====================================================

-- Check table exists:
-- SELECT * FROM information_schema.tables WHERE table_name = 'kv_store_e9cd80f1';

-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'kv_store_e9cd80f1';
