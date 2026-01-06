# Setup Steps - Make Brands Visible to Everyone

## ✅ Step 1: Home Page Fix (COMPLETED)
- Fixed `Home.jsx` to use `brands.json` as the source of truth
- Changes committed and pushed to GitHub
- Vercel will auto-deploy in 1-2 minutes

## 🔧 Step 2: Set Up GitHub Token (REQUIRED)

This is needed so admin changes sync to GitHub and become visible to everyone.

### Option A: Automated Setup (Recommended)

Run the automation script:

```bash
node automate-full-setup.js
```

**What it does:**
1. Opens browser automatically
2. Logs into GitHub and creates token
3. Logs into Vercel (you'll enter OTP code)
4. Adds `GITHUB_TOKEN` to Vercel
5. Triggers redeploy

**When prompted:**
- **OTP Code:** Check email (`koushik.tech2003@gmail.com`) for Vercel verification code
- **Manual Token (if needed):** If token extraction fails, paste token from browser (starts with `ghp_`)

### Option B: Manual Setup

1. **Create GitHub Token:**
   - Visit: https://github.com/settings/tokens/new?scopes=repo
   - Name: `Vercel Brands Sync`
   - Expiration: `No expiration`
   - Scopes: Check `repo`
   - Click "Generate token"
   - **COPY THE TOKEN** (starts with `ghp_`)

2. **Add to Vercel:**
   - Visit: https://vercel.com/cryptobrands/settings/environment-variables
   - Click "Add New"
   - Key: `GITHUB_TOKEN`
   - Value: Paste your token
   - Environment: All (Production, Preview, Development)
   - Click "Save"

3. **Redeploy:**
   - Go to: https://vercel.com/cryptobrands
   - Click "..." on latest deployment → "Redeploy"

## ✅ Step 3: Test the Flow

After setup is complete:

1. Go to: https://cryptobrands.vercel.app/admin
2. Login: `admin` / `200345i`
3. Add a test brand
4. You should see: "Successfully synced to GitHub. Vercel will auto-deploy in 1-2 minutes."
5. Wait 1-2 minutes
6. Check: https://cryptobrands.vercel.app/
7. The new brand should appear!

## 🎯 How It Works Now

1. **You add a brand in admin** → Saved to localStorage (instant feedback)
2. **Syncs to GitHub** → Updates `brands.json` in repository
3. **Vercel auto-deploys** → Takes 1-2 minutes
4. **All users see the update** → Everyone sees the new brand from `brands.json`

## 📝 Current Status

- ✅ Home page fixed (uses `brands.json` as source of truth)
- ✅ Changes pushed to GitHub
- ⏳ Waiting for Vercel to deploy (1-2 minutes)
- ⏳ GitHub token setup needed (run automation or manual setup)

## 🚨 Important Notes

- **After GitHub token is set:** All admin changes will sync to GitHub automatically
- **Before GitHub token is set:** Changes only save to localStorage (browser-specific)
- **Once token is set:** Changes become visible to everyone within 1-2 minutes

