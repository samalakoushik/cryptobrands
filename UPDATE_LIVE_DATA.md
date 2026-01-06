# Update Live Site with Your Brand Data

## The Problem
Your brand data is stored in **localStorage** (only on your computer). To make it visible to everyone on the live site, we need to add it to `brands.json` and push it to GitHub.

## Solution: Extract and Update

### Method 1: Use the HTML Tool (Easiest)

1. **Open the extraction tool:**
   - Make sure your localhost is running (`npm start`)
   - Open `extract-data.html` in your browser
   - OR go to: `http://localhost:3000` and open the file from there

2. **Extract your data:**
   - The tool will automatically load your localStorage data
   - Click **"Copy to Clipboard"** or **"Download JSON File"**

3. **Update brands.json:**
   - Open `src/data/brands.json` in your project
   - Replace the entire content with the extracted data
   - Save the file

4. **Push to GitHub:**
   ```bash
   git add src/data/brands.json
   git commit -m "Add brand data to brands.json for live site"
   git push origin main
   ```

### Method 2: Browser Console (Quick)

1. **Open your localhost:**
   - Go to: `http://localhost:3000`
   - Press `F12` → Go to **Console** tab

2. **Run this command:**
   ```javascript
   const data = localStorage.getItem('cryptoBrands');
   if (data) {
     const brands = JSON.parse(data);
     const json = JSON.stringify({ brands }, null, 2);
     console.log(json);
     navigator.clipboard.writeText(json).then(() => {
       console.log('✅ Copied! Paste into src/data/brands.json');
     });
   }
   ```

3. **Copy and paste** into `src/data/brands.json`

4. **Commit and push** (same as Method 1, step 4)

### Method 3: Admin Dashboard Export

1. **Go to Admin:**
   - On localhost, type "admin" in search bar and press Enter
   - Login: `admin` / `200345i`

2. **Export:**
   - Click **"Export Data"** button (top right)
   - File `brands-data.json` will download

3. **Update brands.json:**
   - Open the downloaded file
   - Copy its contents
   - Paste into `src/data/brands.json`

4. **Commit and push** (same as Method 1, step 4)

## After Pushing

- ✅ Vercel will auto-deploy in 1-2 minutes
- ✅ Your friend will see the brand data on the live site
- ✅ The data is now in the codebase, not just localStorage

## Important Notes

- **Local edits** will still work (stored in localStorage)
- **Live site** will show data from `brands.json` (shared with everyone)
- **To update live site again:** Repeat the extraction process and push


