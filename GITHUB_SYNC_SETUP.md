# GitHub Sync Setup Guide

## Overview
This setup allows the admin dashboard to automatically commit changes to GitHub, which triggers Vercel auto-deployment. This ensures all changes are visible across all browsers and devices.

## Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Give it a name: `Vercel Brands Sync`
   - Set expiration: Choose your preference (or "No expiration" for convenience)
   - Select scopes:
     - ✅ **`repo`** (Full control of private repositories)
       - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
   - Click **"Generate token"**

3. **Copy the Token:**
   - ⚠️ **IMPORTANT:** Copy the token immediately - you won't be able to see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Add Token to Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Find your **cryptobrands** project
   - Click on it

2. **Open Settings:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in the sidebar

3. **Add Environment Variable:**
   - **Key:** `GITHUB_TOKEN`
   - **Value:** Paste your GitHub token (the `ghp_...` value)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

4. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - This ensures the new environment variable is available

## Step 3: Verify Setup

1. **Test the Integration:**
   - Go to: https://cryptobrands.vercel.app/admin
   - Login with: `admin` / `200345i`
   - Add a test brand
   - You should see: "Brand added successfully! Successfully synced to GitHub. Vercel will auto-deploy in 1-2 minutes."

2. **Check GitHub:**
   - Visit: https://github.com/samalakoushik/cryptobrands/commits/main
   - You should see a new commit: "Update brands: Added brand: [Brand Name]"

3. **Check Vercel:**
   - Go to Vercel dashboard → Deployments
   - A new deployment should start automatically within 1-2 minutes

## How It Works

1. **Admin adds/edits/deletes a brand:**
   - Brand is saved to localStorage (instant local update)
   - API call is made to `/api/update-brands`
   - Serverless function uses GitHub API to commit `brands.json`
   - GitHub webhook triggers Vercel deployment
   - New deployment goes live in 1-2 minutes
   - All users see the updated brands

## Troubleshooting

### Error: "GitHub token not configured"
- Make sure you added `GITHUB_TOKEN` to Vercel environment variables
- Make sure you redeployed after adding the variable
- Check that the token has `repo` scope

### Error: "Failed to sync to GitHub"
- Check that the GitHub token is valid and not expired
- Verify the token has `repo` permissions
- Check Vercel function logs: Vercel Dashboard → Your Project → Functions → View Logs

### Changes not appearing on live site
- Wait 1-2 minutes for Vercel to deploy
- Check Vercel dashboard for deployment status
- Verify the commit was created on GitHub
- Clear browser cache and reload

## Security Notes

- The GitHub token is stored securely in Vercel environment variables
- The token only has access to your `cryptobrands` repository
- Never commit the token to your codebase
- If the token is compromised, revoke it immediately on GitHub

## Alternative: Manual Sync

If you prefer not to use GitHub API, you can:
1. Use the "Export Data" button in admin dashboard
2. Manually update `src/data/brands.json`
3. Commit and push to GitHub manually

However, the automatic sync is recommended for real-time updates across all browsers.


