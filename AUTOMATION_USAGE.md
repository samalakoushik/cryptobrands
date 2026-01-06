# Automation Usage Guide

## Overview

This automation script fully automates the setup of GitHub token and Vercel environment variables for the crypto brands project.

## Prerequisites

1. **Node.js** installed (v14 or higher)
2. **Puppeteer** installed (already in package.json)
3. **GitHub account** credentials
4. **Vercel account** credentials
5. **Email access** for OTP verification

## Quick Start

### Step 1: Validate Setup

Before running the automation, validate that everything is ready:

```bash
node validate-setup.js
```

This will check:
- Required files exist
- Script syntax is correct
- Dependencies are installed

### Step 2: Run Automation

```bash
node automate-full-setup.js
```

The script will:
1. Open a browser window (Chrome/Chromium)
2. Automatically log into GitHub
3. Create a Personal Access Token with `repo` scope
4. Extract and validate the token
5. Log into Vercel (with OTP prompt)
6. Add `GITHUB_TOKEN` environment variable
7. Trigger a redeploy

## What to Expect

### During GitHub Token Creation

- Browser will open and navigate to GitHub login
- Credentials are filled automatically
- Token creation form is filled automatically
- Token is extracted from the success page
- Token is validated via GitHub API

**If token extraction fails:**
- The script will prompt you to manually paste the token
- Check the browser window for the token (starts with `ghp_`)

### During Vercel Setup

- Browser will navigate to Vercel login
- Email is filled automatically
- **OTP Code Required:** You'll be prompted to enter the OTP code from your email
- Environment variable form is filled automatically
- Save button is clicked automatically
- Redeploy is triggered (if possible)

**If OTP is required:**
- Check your email: `koushik.tech2003@gmail.com`
- Look for email from Vercel with subject containing "verification" or "code"
- Enter the 6-digit code when prompted

## Troubleshooting

### Browser Doesn't Open

**Issue:** Puppeteer can't launch browser

**Solution:**
```bash
npm install puppeteer
```

### Login Fails

**Issue:** GitHub or Vercel login fails

**Possible causes:**
- Credentials are incorrect
- Account requires 2FA (GitHub - not supported in automation)
- Account is locked or suspended
- Page structure changed

**Solution:**
- Verify credentials are correct
- Check if account requires 2FA (disable temporarily if possible)
- Try manual login in the browser window
- Check browser console for errors

### Token Extraction Fails

**Issue:** Can't extract GitHub token from page

**Solution:**
- The script will prompt you to paste the token manually
- Look in the browser window for the token (starts with `ghp_`)
- Copy and paste when prompted

### OTP Not Received

**Issue:** OTP code not received in email

**Solution:**
- Check spam folder
- Wait a few minutes and try again
- Check email address is correct: `koushik.tech2003@gmail.com`
- Try requesting a new OTP code

### Element Not Found Errors

**Issue:** Script can't find buttons or form fields

**Possible causes:**
- Website structure changed
- Page loaded slowly
- JavaScript errors on page

**Solution:**
- The script will retry automatically (up to 3-5 times)
- If it still fails, the browser stays open for manual completion
- Check the browser console for errors

### Vercel Project Not Found

**Issue:** Can't find the `cryptobrands` project

**Solution:**
- Verify project name is correct: `cryptobrands`
- Check you're logged into the correct Vercel account
- Navigate manually: `https://vercel.com/cryptobrands/settings/environment-variables`

## Manual Fallback

If automation fails, you can complete setup manually:

### 1. Create GitHub Token

1. Visit: https://github.com/settings/tokens/new?scopes=repo
2. Name: `Vercel Brands Sync`
3. Expiration: `No expiration`
4. Scopes: Check `repo`
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

### 2. Add to Vercel

1. Visit: https://vercel.com/cryptobrands/settings/environment-variables
2. Click "Add New"
3. Key: `GITHUB_TOKEN`
4. Value: Paste your GitHub token
5. Environment: Select all (Production, Preview, Development)
6. Click "Save"
7. Go to Deployments → Redeploy

## Security Notes

- **Credentials:** Stored in the script file (not committed to git)
- **Token:** Saved temporarily to `.github-token-temp.txt` (not committed)
- **Cleanup:** Delete `.github-token-temp.txt` after setup is complete

## Files Created

- `automate-full-setup.js` - Main automation script
- `email-otp-handler.js` - OTP handling utility
- `validate-setup.js` - Setup validation script
- `.github-token-temp.txt` - Temporary token storage (delete after use)

## After Setup

Once setup is complete:

1. ✅ Verify `GITHUB_TOKEN` exists in Vercel environment variables
2. ✅ Wait for Vercel to redeploy (1-2 minutes)
3. ✅ Test by adding a brand in admin dashboard
4. ✅ Check that changes appear on the live site
5. ✅ Delete `.github-token-temp.txt` file

## Support

If you encounter issues:

1. Check the browser window for error messages
2. Review the console output for detailed error messages
3. Check the troubleshooting section above
4. Try manual setup as fallback

## Next Steps

After successful setup:

- Admin changes will automatically sync to GitHub
- Vercel will auto-deploy on every GitHub commit
- Changes will be visible across all browsers within 1-2 minutes

