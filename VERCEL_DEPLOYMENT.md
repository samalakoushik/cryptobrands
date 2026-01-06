# Deploy to Vercel - Step by Step Guide

## ✅ Step 1: Code Pushed to GitHub
Your code has been successfully pushed to: https://github.com/samalakoushik/cryptobrands

## 🚀 Step 2: Deploy to Vercel

### Option A: If You Haven't Deployed Yet

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Sign in with your GitHub account

2. **Import Project:**
   - Click **"Add New..."** → **"Project"**
   - Find **"cryptobrands"** in your repositories list
   - Click **"Import"**

3. **Configure Project:**
   - Framework Preset: `Create React App` (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `build` (auto-filled)
   - Install Command: `npm install` (auto-filled)

4. **Deploy:**
   - Click **"Deploy"** button
   - Wait 1-2 minutes for deployment

5. **Get Your URL:**
   - After deployment, you'll get: `https://cryptobrands-xxxxx.vercel.app`
   - This is your default Vercel domain

### Option B: If Already Deployed (Update)

If you've already deployed, Vercel will automatically redeploy when you push to GitHub!

1. **Check Deployment:**
   - Go to: https://vercel.com/dashboard
   - Find your **cryptobrands** project
   - Click on it to see deployments

2. **Automatic Deployment:**
   - Your latest push should trigger a new deployment
   - Wait 1-2 minutes for it to complete

---

## 🌐 Step 3: Custom Domain Setup

### About the Domain Format

The format you mentioned (`cryptobrands/admin.vercel.app`) is not a standard Vercel domain format.

**Standard Vercel domains are:**
- Default: `cryptobrands-xxxxx.vercel.app` (random suffix)
- Or: `cryptobrands.vercel.app` (if available)

**To set up a custom domain:**

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Domains**

2. **Add Custom Domain:**
   - Click **"Add Domain"**
   - Enter your domain (e.g., `cryptobrands.vercel.app` or your own domain)
   - Follow DNS configuration instructions

3. **Domain Options:**
   - **Option 1:** Use default Vercel domain: `cryptobrands-xxxxx.vercel.app`
   - **Option 2:** Request `cryptobrands.vercel.app` (if available)
   - **Option 3:** Add your own custom domain

### Note on Subdomain Format

If you want a subdomain like `admin.cryptobrands.vercel.app`, you would need to:
1. Set up a custom domain in Vercel
2. Configure DNS for subdomain routing
3. Or use Vercel's rewrites in `vercel.json` (for path-based routing)

---

## 📝 Step 4: Verify Deployment

1. **Check Your Live Site:**
   - Visit your Vercel URL (from dashboard)
   - Test the homepage
   - Click "Admin" link in top right
   - Login with: `admin` / `200345i`

2. **Test Admin Dashboard:**
   - Add a test brand
   - Edit a brand
   - Delete a brand
   - Verify everything works

---

## 🔄 Automatic Updates

**Every time you push to GitHub:**
- Vercel automatically detects the push
- Starts a new deployment
- Updates your live site in 1-2 minutes

---

## 📍 Quick Links

- **GitHub Repository:** https://github.com/samalakoushik/cryptobrands
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Documentation:** https://vercel.com/docs

---

## 🆘 Troubleshooting

### Build Fails?
- Check build logs in Vercel dashboard
- Verify `package.json` has all dependencies
- Make sure Node.js version is compatible (Vercel uses Node 18+)

### Domain Not Working?
- Check DNS configuration
- Wait for DNS propagation (can take up to 48 hours)
- Verify domain is correctly added in Vercel

### Admin Dashboard Not Accessible?
- Make sure you're using the correct URL: `https://your-domain.vercel.app/admin`
- Check browser console for errors
- Verify routing is working correctly

---

## ✅ Summary

1. ✅ Code pushed to GitHub
2. ⏳ Deploy on Vercel (follow steps above)
3. ⏳ Configure custom domain (if needed)
4. ✅ Test your live site

Your project is ready to deploy! 🚀



