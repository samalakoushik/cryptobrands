// Direct extraction using Chrome DevTools Protocol
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🔍 Attempting direct extraction from your browser...\n');

// Method 1: Check if user already exported the file
function checkAndProcessExportedFile() {
  const downloadsPath = path.join(os.homedir(), 'Downloads');
  const possibleFiles = [
    path.join(downloadsPath, 'brands-data.json'),
    path.join(downloadsPath, 'brands.json'),
    path.join(__dirname, 'brands-data.json'),
    path.join(__dirname, 'brands.json')
  ];
  
  for (const filePath of possibleFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`📁 Found file: ${filePath}`);
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        let parsed;
        
        // Try to parse as JSON
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          // If it's just an array, wrap it
          const arrayParsed = JSON.parse(data);
          parsed = { brands: Array.isArray(arrayParsed) ? arrayParsed : [arrayParsed] };
        }
        
        // Ensure it has the right structure
        if (!parsed.brands && Array.isArray(parsed)) {
          parsed = { brands: parsed };
        }
        
        if (parsed.brands && Array.isArray(parsed.brands)) {
          const brandsJsonPath = path.join(__dirname, 'src', 'data', 'brands.json');
          fs.writeFileSync(brandsJsonPath, JSON.stringify(parsed, null, 2), 'utf8');
          console.log(`✅ Updated src/data/brands.json with ${parsed.brands.length} brand(s)`);
          return true;
        }
      } catch (error) {
        console.log(`⚠️  Error processing ${filePath}: ${error.message}`);
      }
    }
  }
  return false;
}

// Method 2: Try to trigger export via browser automation with existing profile
async function extractWithExistingBrowser() {
  try {
    const puppeteer = require('puppeteer-core');
    
    // Try to find Chrome executable
    const possibleChromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Edge', 'Application', 'msedge.exe')
    ];
    
    let chromePath = null;
    for (const possiblePath of possibleChromePaths) {
      if (fs.existsSync(possiblePath)) {
        chromePath = possiblePath;
        break;
      }
    }
    
    if (!chromePath) {
      console.log('⚠️  Chrome/Edge not found in standard locations');
      return false;
    }
    
    console.log('🌐 Connecting to your browser...');
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: false,
      userDataDir: null, // Use default profile
      defaultViewport: null,
      args: ['--remote-debugging-port=9222']
    });
    
    const pages = await browser.pages();
    let page = pages[0] || await browser.newPage();
    
    // Try to navigate to localhost or find existing tab
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 5000 });
    } catch (e) {
      console.log('⚠️  localhost:3000 not accessible. Trying to extract from any open tab...');
      // Try to get data from any page
    }
    
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('cryptoBrands');
    });
    
    if (!localStorageData) {
      console.log('❌ No data found. Make sure you have the site open with brand data.');
      await browser.close();
      return false;
    }
    
    const brands = JSON.parse(localStorageData);
    const jsonData = JSON.stringify({ brands }, null, 2);
    
    console.log(`✅ Found ${brands.length} brand(s) in localStorage`);
    
    const brandsJsonPath = path.join(__dirname, 'src', 'data', 'brands.json');
    fs.writeFileSync(brandsJsonPath, jsonData, 'utf8');
    console.log(`✅ Updated ${brandsJsonPath}`);
    
    await browser.close();
    return true;
    
  } catch (error) {
    if (error.message.includes('puppeteer-core')) {
      console.log('⚠️  puppeteer-core not available. Trying alternative...');
    } else {
      console.log(`⚠️  Browser automation failed: ${error.message}`);
    }
    return false;
  }
}

// Main execution
async function main() {
  // First, check for already exported files
  if (checkAndProcessExportedFile()) {
    console.log('\n✅ Data extracted from exported file!');
    commitAndPush();
    return;
  }
  
  // Try browser automation
  console.log('🌐 Attempting browser automation...');
  if (await extractWithExistingBrowser()) {
    console.log('\n✅ Data extracted via browser!');
    commitAndPush();
    return;
  }
  
  // Fallback: Create simple extraction page
  console.log('\n📝 Creating extraction helper...');
  const htmlContent = `<!DOCTYPE html>
<html>
<head><title>Extract Data</title></head>
<body style="font-family:Arial;padding:20px;background:#1a1a1a;color:#fff;">
<h1>Extract Brand Data</h1>
<button onclick="extract()" style="padding:15px;background:#4CAF50;color:white;border:none;border-radius:5px;cursor:pointer;">Extract & Download</button>
<pre id="out" style="background:#2a2a2a;padding:15px;margin-top:20px;border-radius:5px;overflow:auto;"></pre>
<script>
function extract() {
  const data = localStorage.getItem('cryptoBrands');
  if (!data) { document.getElementById('out').textContent = 'No data found'; return; }
  const brands = JSON.parse(data);
  const json = JSON.stringify({ brands }, null, 2);
  document.getElementById('out').textContent = json;
  const blob = new Blob([json], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'brands.json';
  a.click();
  alert('File downloaded! Save it in the project folder, then run the script again.');
}
window.onload = extract;
</script>
</body>
</html>`;
  
  const htmlPath = path.join(__dirname, 'extract-now.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  
  try {
    execSync(`start ${htmlPath}`, { shell: true });
  } catch (e) {
    console.log(`\n📝 Please open: ${htmlPath}`);
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. The extraction page will open in your browser');
  console.log('2. It will automatically extract and download the data');
  console.log('3. Save the downloaded file in this project folder');
  console.log('4. Run this script again to process it automatically');
}

function commitAndPush() {
  console.log('\n📤 Committing and pushing to GitHub...');
  try {
    execSync('git add src/data/brands.json', { stdio: 'inherit' });
    execSync('git commit -m "Add brand data from localStorage to brands.json"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\n✅ Successfully pushed to GitHub!');
    console.log('⏳ Vercel will auto-deploy in 1-2 minutes.');
  } catch (gitError) {
    console.log('\n⚠️  Git commands failed. Please run manually:');
    console.log('   git add src/data/brands.json');
    console.log('   git commit -m "Add brand data"');
    console.log('   git push origin main');
  }
}

main().catch(console.error);


