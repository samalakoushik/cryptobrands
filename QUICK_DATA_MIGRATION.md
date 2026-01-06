# Quick Guide: Add Your Local Data to Live Site

## 🎯 Goal
Move brand data from localhost localStorage to the live website.

---

## ✅ Step 1: Extract Your Local Data

### Option A: Using Admin Dashboard (Easiest)

1. **On localhost:** Go to `http://localhost:3000/admin`
2. **Login:** `admin` / `200345i`
3. **Click:** "Export Data" button (top right, next to Logout)
4. **File downloads:** `brands-data.json` will be in your Downloads folder

### Option B: Using Browser Console

1. **On localhost:** Open browser console (F12)
2. **Paste this code:**
   ```javascript
   JSON.stringify(JSON.parse(localStorage.getItem('cryptoBrands') || '[]'), null, 2)
   ```
3. **Press Enter**
4. **Copy the output** (it's your brand data in JSON format)

---

## ✅ Step 2: Add Data to Repository

1. **Open:** `src/data/brands.json` in your project
2. **Replace the content** with your exported data:

   **If you used Export button:**
   - Open the downloaded `brands-data.json`
   - Copy all contents
   - Paste into `src/data/brands.json`

   **If you used console:**
   - Wrap the output in: `{ "brands": [ ...your data... ] }`
   - Paste into `src/data/brands.json`

3. **Save the file**

---

## ✅ Step 3: Push to GitHub

```bash
git add src/data/brands.json
git commit -m "Add initial brand data from localhost"
git push origin main
```

---

## ✅ Step 4: Verify

1. **Wait 1-2 minutes** for Vercel to deploy
2. **Visit your live site**
3. **Your brands should now be visible!** 🎉

---

## 📝 Example brands.json Format

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

---

## 🆘 Troubleshooting

**No data exported?**
- Make sure you added brands on localhost first
- Check browser console for errors

**Data not showing on live site?**
- Verify `src/data/brands.json` has correct format
- Check Vercel deployment logs
- Hard refresh the live site (Ctrl+Shift+R)

---

## ✨ Done!

Your brand data will now be available on the live website! 🚀



