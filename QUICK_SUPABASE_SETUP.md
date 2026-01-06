# Quick Supabase Setup

## 🚀 Automated Setup (Easiest)

Run this command:

```bash
node setup-supabase.js
```

The script will:
1. ✅ Open browser and log into Supabase
2. ✅ Extract your project credentials
3. ✅ Save to `.env.local`

## 📋 Manual Steps After Automation

### 1. Create Database Table

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" → "New query"
4. Copy and paste the SQL from `supabase-schema.sql`
5. Click "Run"

### 2. Migrate Existing Data (Optional)

If you have brands in `brands.json`:

```bash
node migrate-to-supabase.js
```

### 3. Add to Vercel

1. Go to: https://vercel.com/cryptobrands/settings/environment-variables
2. Add:
   - `REACT_APP_SUPABASE_URL` = (from `.env.local`)
   - `REACT_APP_SUPABASE_ANON_KEY` = (from `.env.local`)
3. Environment: All
4. Save → Redeploy

## ✅ Done!

After setup:
- Admin changes go directly to Supabase
- All users see updates in real-time
- No more localStorage or GitHub sync!

## 🆘 Troubleshooting

**"Missing Supabase environment variables"**
- Check `.env.local` exists
- Restart dev server: `npm start`

**"Table doesn't exist"**
- Run the SQL script in Supabase SQL Editor

**See SUPABASE_SETUP.md for detailed instructions**

