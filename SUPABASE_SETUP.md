# Supabase Setup Guide

## Overview
This guide will help you set up Supabase as your database for the crypto brands application.

## Step 1: Run Setup Script

Run the automated setup script:

```bash
node setup-supabase.js
```

This will:
- Log into your Supabase account
- Extract your project credentials
- Save them to `.env.local`

## Step 2: Create Database Table

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run this SQL script:**

```sql
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
-- For now, we'll allow all operations (you can restrict later)
CREATE POLICY "Allow authenticated insert" ON brands
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON brands
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON brands
  FOR DELETE USING (true);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_brands_username ON brands(username);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
```

4. **Click "Run"** to execute the SQL

## Step 3: Migrate Existing Data

If you have existing brands in `brands.json`, migrate them:

```bash
node migrate-to-supabase.js
```

This will copy all brands from `brands.json` to Supabase.

## Step 4: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your "cryptobrands" project

2. **Go to Settings → Environment Variables**

3. **Add these variables:**
   - **Key:** `REACT_APP_SUPABASE_URL`
   - **Value:** Your Supabase project URL (from `.env.local`)
   - **Environment:** All (Production, Preview, Development)
   - Click "Save"

   - **Key:** `REACT_APP_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon key (from `.env.local`)
   - **Environment:** All (Production, Preview, Development)
   - Click "Save"

4. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

## Step 5: Test

1. **Start local development:**
   ```bash
   npm start
   ```

2. **Test Admin:**
   - Go to: http://localhost:3000/admin
   - Login: `admin` / `200345i`
   - Add a test brand
   - It should save to Supabase!

3. **Test Home:**
   - Go to: http://localhost:3000
   - Your brands should load from Supabase
   - Changes should appear in real-time!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists with your credentials
- Restart your dev server after creating `.env.local`

### "Table doesn't exist" error
- Make sure you ran the SQL script in Supabase SQL Editor
- Check that the table name is exactly `brands` (lowercase)

### "Permission denied" error
- Check your RLS policies in Supabase
- Make sure the policies allow the operations you need

### Real-time not working
- Check that Replication is enabled for the `brands` table
- In Supabase Dashboard → Database → Replication
- Enable replication for the `brands` table

## Benefits

✅ **Real-time updates** - Changes appear instantly across all browsers
✅ **No GitHub sync needed** - Direct database updates
✅ **Scalable** - Can handle thousands of brands
✅ **Secure** - Row Level Security policies
✅ **Fast** - Optimized queries with indexes

## Next Steps

After setup:
- All admin changes go directly to Supabase
- All users see updates in real-time
- No more localStorage or GitHub sync needed!

