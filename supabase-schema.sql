-- Supabase Database Schema for Crypto Brands
-- Run this in Supabase SQL Editor

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  affiliate_badges INTEGER NOT NULL DEFAULT 0,
  x_profile_link TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow public read access
CREATE POLICY "Allow public read access" ON brands
  FOR SELECT USING (true);

-- Create policy: Allow authenticated users to insert/update/delete
-- For now, we'll allow all operations (you can restrict later based on auth)
CREATE POLICY "Allow authenticated insert" ON brands
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON brands
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON brands
  FOR DELETE USING (true);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_brands_username ON brands(username);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- Enable Realtime for the table (for real-time updates)
ALTER PUBLICATION supabase_realtime ADD TABLE brands;

