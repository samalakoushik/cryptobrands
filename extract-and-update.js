// Automated script to extract localStorage data and update brands.json
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking for browser automation tools...');

// Try to use Puppeteer if available, otherwise use a simpler approach
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.log('⚠️  Puppeteer not found. Installing...');
  try {
    execSync('npm install puppeteer --save-dev', { stdio: 'inherit' });
    puppeteer = require('puppeteer');
  } catch (err) {
    console.error('❌ Failed to install Puppeteer. Trying alternative method...');
    // Fallback: check for downloaded export file
    checkForExportedFile();
    process.exit(1);
  }
}

async function extractLocalStorage() {
  console.log('🚀 Starting browser automation...');
  console.log('📝 Make sure your localhost is running on http://localhost:3000');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Show browser so user can see what's happening
      defaultViewport: null
    });
    
    const page = await browser.newPage();
    
    console.log('🌐 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    
    console.log('📦 Extracting localStorage data...');
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('cryptoBrands');
    });
    
    if (!localStorageData) {
      console.log('❌ No data found in localStorage. Make sure you have added brands on localhost.');
      await browser.close();
      process.exit(1);
    }
    
    const brands = JSON.parse(localStorageData);
    const jsonData = JSON.stringify({ brands }, null, 2);
    
    console.log(`✅ Found ${brands.length} brand(s) in localStorage`);
    
    // Save to brands.json
    const brandsJsonPath = path.join(__dirname, 'src', 'data', 'brands.json');
    fs.writeFileSync(brandsJsonPath, jsonData, 'utf8');
    console.log(`✅ Updated ${brandsJsonPath}`);
    
    await browser.close();
    
    // Commit and push
    console.log('📤 Committing and pushing to GitHub...');
    try {
      execSync('git add src/data/brands.json', { stdio: 'inherit' });
      execSync('git commit -m "Add brand data from localStorage to brands.json"', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Successfully pushed to GitHub!');
      console.log('⏳ Vercel will auto-deploy in 1-2 minutes.');
    } catch (gitError) {
      console.error('❌ Error with git commands:', gitError.message);
      console.log('💡 You may need to commit and push manually:');
      console.log('   git add src/data/brands.json');
      console.log('   git commit -m "Add brand data"');
      console.log('   git push origin main');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

function checkForExportedFile() {
  // Check Downloads folder for exported file
  const downloadsPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads');
  const exportedFile = path.join(downloadsPath, 'brands-data.json');
  
  if (fs.existsSync(exportedFile)) {
    console.log('📁 Found exported file in Downloads folder!');
    const data = fs.readFileSync(exportedFile, 'utf8');
    const brandsJsonPath = path.join(__dirname, 'src', 'data', 'brands.json');
    fs.writeFileSync(brandsJsonPath, data, 'utf8');
    console.log(`✅ Updated ${brandsJsonPath}`);
    
    // Commit and push
    try {
      execSync('git add src/data/brands.json', { stdio: 'inherit' });
      execSync('git commit -m "Add brand data from exported file"', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Successfully pushed to GitHub!');
    } catch (gitError) {
      console.error('❌ Error with git commands:', gitError.message);
    }
  } else {
    console.log('❌ No exported file found. Please:');
    console.log('   1. Go to http://localhost:3000/admin');
    console.log('   2. Click "Export Data" button');
    console.log('   3. Run this script again');
  }
}

// Run the extraction
extractLocalStorage().catch(console.error);


