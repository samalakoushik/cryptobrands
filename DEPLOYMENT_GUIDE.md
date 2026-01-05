# Complete Deployment Guide: GitHub + Vercel

## 📋 Overview
This guide will help you:
1. Push your project to GitHub
2. Deploy it to Vercel (free hosting)

---

## Part 1: Push to GitHub

### Step 1: Open GitHub Desktop
1. Open **GitHub Desktop** application
2. If you don't have it, download from: https://desktop.github.com/

### Step 2: Add Your Project
1. Click **File** → **Add Local Repository**
2. Click **Choose...** button
3. Navigate to: `C:\Users\KOUSHIK\Documents\cursor-test\test2`
4. Click **Add Repository**

### Step 3: Initialize Repository (if needed)
- If GitHub Desktop says "This directory does not appear to be a Git repository":
  - Click **"create a repository"** link
  - Repository name: `cryptobrands`
  - Click **Create Repository**

### Step 4: Connect to GitHub Repository
1. Click **Repository** → **Repository Settings** (or press `Ctrl + ,`)
2. Go to **Remote** tab
3. In **Primary remote repository (origin)**, enter:
   ```
   https://github.com/samalakoushik/cryptobrands.git
   ```
4. Click **Save**

### Step 5: Commit Your Files
1. In the left sidebar, you'll see all your files
2. At the bottom, write commit message:
   ```
   Initial commit: Crypto Brands X Affiliate Spends Dashboard
   ```
3. Click **Commit to main** button

### Step 6: Publish/Push to GitHub
1. Click **Publish repository** button (top right)
   - OR if already published, click **Push origin**
2. Make sure repository name is: `cryptobrands`
3. Make sure it's set to **Private** or **Public** (your choice)
4. Click **Publish Repository** (or **Push origin**)

### Step 7: Verify on GitHub
1. Visit: https://github.com/samalakoushik/cryptobrands
2. You should see all your files! ✅

---

## Part 2: Deploy to Vercel

### Step 1: Create Vercel Account
1. Go to: https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub** (easiest option)
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project
1. After logging in, click **Add New...** → **Project**
2. You'll see a list of your GitHub repositories
3. Find **cryptobrands** and click **Import**

### Step 3: Configure Project Settings
Vercel will auto-detect it's a React app. Verify these settings:

**Framework Preset:** `Create React App` (should be auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (should be auto-filled)

**Output Directory:** `build` (should be auto-filled)

**Install Command:** `npm install` (should be auto-filled)

### Step 4: Environment Variables (if needed)
- For this project, you don't need any environment variables
- Click **Deploy** to proceed

### Step 5: Deploy
1. Click **Deploy** button
2. Wait 1-2 minutes for deployment
3. Vercel will build and deploy your app

### Step 6: Access Your Live Website
1. After deployment completes, you'll see:
   - ✅ **Success!** message
   - A URL like: `https://cryptobrands-xxxxx.vercel.app`
2. Click the URL to visit your live website! 🎉

### Step 7: Custom Domain (Optional)
1. In your project dashboard, go to **Settings** → **Domains**
2. Add your custom domain if you have one
3. Follow Vercel's instructions to configure DNS

---

## Part 3: Automatic Deployments

### How It Works:
- ✅ Every time you push to GitHub, Vercel automatically redeploys
- ✅ You get a preview URL for each commit
- ✅ Production URL stays the same

### To Update Your Website:
1. Make changes to your code locally
2. Commit and push to GitHub (using GitHub Desktop)
3. Vercel automatically detects the push
4. New deployment starts automatically
5. Your website updates in 1-2 minutes!

---

## Troubleshooting

### Issue: Build fails on Vercel
**Solution:**
- Check the build logs in Vercel dashboard
- Make sure `package.json` has all dependencies
- Verify Node.js version (Vercel uses Node 18 by default)

### Issue: Website shows blank page
**Solution:**
- Check browser console for errors
- Verify all file paths are correct
- Make sure `public/index.html` exists

### Issue: Can't push to GitHub
**Solution:**
- Make sure you're logged into GitHub Desktop
- Verify repository URL is correct
- Check your internet connection

---

## Quick Checklist

### Before Pushing to GitHub:
- ✅ All files are in the project folder
- ✅ `.gitignore` is present
- ✅ `package.json` exists
- ✅ `README.md` exists

### Before Deploying to Vercel:
- ✅ Code is pushed to GitHub
- ✅ Repository is accessible
- ✅ Vercel account is created
- ✅ GitHub account is connected to Vercel

---

## Your Project URLs

**GitHub Repository:**
https://github.com/samalakoushik/cryptobrands

**Vercel Dashboard:**
https://vercel.com/dashboard

**Your Live Website:**
(Will be provided after deployment)

---

## Need Help?

- **GitHub Desktop Help:** https://docs.github.com/en/desktop
- **Vercel Documentation:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support

---

## Summary

1. **Push to GitHub:** Use GitHub Desktop to commit and push
2. **Deploy to Vercel:** Import from GitHub, click Deploy
3. **Done!** Your website is live and auto-updates on every push

Good luck! 🚀

