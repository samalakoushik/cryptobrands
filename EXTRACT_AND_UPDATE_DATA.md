# Extract LocalStorage Data and Update Live Site

## Quick Method: Browser Console

1. **Open your localhost** (where you added the brand data)
   - Go to: `http://localhost:3000`
   - Press `F12` to open Developer Tools
   - Go to the **Console** tab

2. **Run this command:**
   ```javascript
   const data = localStorage.getItem('cryptoBrands');
   if (data) {
     const brands = JSON.parse(data);
     const json = JSON.stringify({ brands }, null, 2);
     console.log(json);
     navigator.clipboard.writeText(json).then(() => {
       console.log('✅ Copied to clipboard! Now paste it into src/data/brands.json');
     });
   } else {
     console.log('No data found in localStorage');
   }
   ```

3. **Copy the output** and paste it into `src/data/brands.json`

## Alternative: Use Admin Export Button

1. Go to: `http://localhost:3000/admin` (type "admin" in search bar and press Enter)
2. Login with: `admin` / `200345i`
3. Click **"Export Data"** button (top right)
4. A file `brands-data.json` will download
5. Open the file and copy its contents
6. Paste into `src/data/brands.json` (replace the entire file content)

## After Extracting Data

1. **Update `src/data/brands.json`** with your exported data
2. **Commit and push:**
   ```bash
   git add src/data/brands.json
   git commit -m "Add brand data to brands.json for live site"
   git push origin main
   ```
3. **Vercel will auto-deploy** with the new data in 1-2 minutes


