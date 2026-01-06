# Extract LocalStorage Data to Add to Live Site

## Problem
Brand data added locally is stored in browser localStorage, which doesn't transfer to the live website.

## Solution

### Method 1: Use Admin Dashboard Export (Easiest)

1. **On your localhost:**
   - Go to: `http://localhost:3000/admin`
   - Login with: `admin` / `200345i`
   - Click **"Export Data"** button (top right)
   - A file `brands-data.json` will download

2. **Add to Repository:**
   - Open the downloaded `brands-data.json`
   - Copy the contents
   - Paste into `src/data/brands.json` in your project
   - Commit and push to GitHub

### Method 2: Browser Console (Manual)

1. **Open Browser Console:**
   - On localhost, press `F12` or right-click → Inspect
   - Go to Console tab

2. **Run this command:**
   ```javascript
   JSON.stringify(JSON.parse(localStorage.getItem('cryptoBrands') || '[]'), null, 2)
   ```

3. **Copy the output:**
   - Copy the JSON output
   - Paste into `src/data/brands.json` (replace the `brands` array)

4. **Format:**
   ```json
   {
     "brands": [
       {
         "id": 1234567890,
         "name": "Brand Name",
         "username": "@username",
         "affiliateBadges": 5,
         "xProfileLink": "https://x.com/username",
         "logoUrl": "data:image/..."
       }
     ]
   }
   ```

### Method 3: Direct Edit

1. **Open:** `src/data/brands.json`
2. **Add your brand data** in this format:
   ```json
   {
     "brands": [
       {
         "id": 1700000000000,
         "name": "Example Brand",
         "username": "@example",
         "affiliateBadges": 10,
         "xProfileLink": "https://x.com/example",
         "logoUrl": "https://example.com/logo.png"
       }
     ]
   }
   ```
3. **Save and push to GitHub**

---

## After Adding Data

1. **Commit changes:**
   ```bash
   git add src/data/brands.json
   git commit -m "Add initial brand data"
   git push origin main
   ```

2. **Vercel will auto-deploy** with the new data

3. **The live site will show your brands!**

---

## Notes

- **ID Format:** Use timestamp (e.g., `Date.now()` or `1700000000000`)
- **Logo URLs:** Can be:
  - Base64: `data:image/jpeg;base64,...`
  - URL: `https://example.com/logo.png`
- **Required Fields:** `name`, `username`, `affiliateBadges`
- **Optional Fields:** `xProfileLink`, `logoUrl`



