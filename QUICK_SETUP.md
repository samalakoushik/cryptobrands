# Quick Setup - GitHub Sync

## Automated Setup (Easiest)

1. **Open the setup page:**
   - Double-click `setup-github-sync.html` 
   - Or visit: `file:///[project-path]/setup-github-sync.html`

2. **Follow the on-screen instructions** - it will guide you through everything!

## Manual Setup (If needed)

### Step 1: Create GitHub Token
Visit: https://github.com/settings/tokens/new?scopes=repo&description=Vercel%20Brands%20Sync

- Click "Generate token"
- Copy the token (starts with `ghp_`)

### Step 2: Add to Vercel
1. Go to: https://vercel.com/dashboard
2. Find "cryptobrands" project → Settings → Environment Variables
3. Add: `GITHUB_TOKEN` = `[your token]`
4. Environment: All
5. Save → Redeploy

Done! ✅

