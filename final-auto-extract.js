// Final automated script - waits for file and processes automatically
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🚀 Automated Brand Data Extraction\n');
console.log('📋 This script will:');
console.log('   1. Check for downloaded brands.json file');
console.log('   2. Update src/data/brands.json');
console.log('   3. Commit and push to GitHub\n');

const downloadsPath = path.join(os.homedir(), 'Downloads');
const brandsJsonPath = path.join(__dirname, 'src', 'data', 'brands.json');

function processFile(filePath) {
  try {
    console.log(`📁 Processing: ${filePath}`);
    const data = fs.readFileSync(filePath, 'utf8');
    let parsed = JSON.parse(data);
    
    // Normalize: ensure it's { brands: [...] }
    if (Array.isArray(parsed)) {
      parsed = { brands: parsed };
    }
    
    if (!parsed.brands || !Array.isArray(parsed.brands)) {
      console.log('❌ Invalid format. Expected { brands: [...] }');
      return false;
    }
    
    // Write to brands.json
    fs.writeFileSync(brandsJsonPath, JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`✅ Updated src/data/brands.json with ${parsed.brands.length} brand(s)\n`);
    
    // Clean up
    try {
      fs.unlinkSync(filePath);
      console.log('🧹 Cleaned up downloaded file\n');
    } catch (e) {}
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Check multiple possible locations
const possibleFiles = [
  path.join(downloadsPath, 'brands.json'),
  path.join(downloadsPath, 'brands-data.json'),
  path.join(__dirname, 'brands.json'),
  path.join(__dirname, 'brands-data.json')
];

let found = false;
for (const filePath of possibleFiles) {
  if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
      found = true;
      break;
    }
  }
}

if (!found) {
  console.log('❌ No brands.json file found in Downloads folder.');
  console.log('\n📝 To extract your data:');
  console.log('   1. Go to http://localhost:3000/extract-data.html');
  console.log('   2. The page will automatically download brands.json');
  console.log('   3. Run this script again: node final-auto-extract.js');
  console.log('\n   OR');
  console.log('   1. Go to http://localhost:3000/admin');
  console.log('   2. Click "Export Data" button');
  console.log('   3. Run this script again');
  process.exit(1);
}

// Commit and push
console.log('📤 Committing and pushing to GitHub...\n');
try {
  execSync('git add src/data/brands.json', { stdio: 'inherit' });
  execSync('git commit -m "Add brand data from localStorage to brands.json"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\n✅ Successfully pushed to GitHub!');
  console.log('⏳ Vercel will auto-deploy in 1-2 minutes.');
  console.log('🌐 Your friend will see the brand data on the live site!');
} catch (gitError) {
  console.log('\n⚠️  Git error. Please run manually:');
  console.log('   git add src/data/brands.json');
  console.log('   git commit -m "Add brand data"');
  console.log('   git push origin main');
  process.exit(1);
}


