// Script to extract localStorage from Chrome/Edge browser storage files
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🔍 Attempting to extract localStorage data from your browser...\n');

// Try to read from Chrome's localStorage
function tryExtractFromChrome() {
  const userDataPath = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const chromePaths = [
    path.join(userDataPath, 'Google', 'Chrome', 'User Data', 'Default', 'Local Storage', 'leveldb'),
    path.join(userDataPath, 'Google', 'Chrome', 'User Data', 'Profile 1', 'Local Storage', 'leveldb'),
  ];
  
  console.log('⚠️  Direct browser file access is complex. Using alternative method...\n');
  return false;
}

// Create a simple HTML file that user can open in their browser
function createExtractorHTML() {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Extract Brand Data</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #1a1a1a; color: #fff; }
        button { background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 0; }
        button:hover { background: #45a049; }
        .success { color: #4CAF50; margin: 10px 0; }
        .error { color: #f44336; margin: 10px 0; }
        pre { background: #2a2a2a; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Extract Brand Data from LocalStorage</h1>
    <p>This page will extract your brand data and save it automatically.</p>
    <button onclick="extractAndSave()">Extract & Save Data</button>
    <div id="message"></div>
    <pre id="output"></pre>
    
    <script>
        function extractAndSave() {
            const storedBrands = localStorage.getItem('cryptoBrands');
            const messageDiv = document.getElementById('message');
            const output = document.getElementById('output');
            
            if (!storedBrands) {
                messageDiv.innerHTML = '<div class="error">❌ No brand data found in localStorage. Make sure you\'ve added brands on localhost first.</div>';
                return;
            }
            
            try {
                const brands = JSON.parse(storedBrands);
                const jsonData = JSON.stringify({ brands }, null, 2);
                
                output.textContent = jsonData;
                messageDiv.innerHTML = '<div class="success">✅ Found ' + brands.length + ' brand(s)!</div>';
                
                // Save to file using File System Access API (if supported) or download
                if ('showSaveFilePicker' in window) {
                    window.showSaveFilePicker({
                        suggestedName: 'brands.json',
                        types: [{
                            description: 'JSON file',
                            accept: { 'application/json': ['.json'] }
                        }]
                    }).then(fileHandle => {
                        return fileHandle.createWritable();
                    }).then(writable => {
                        return writable.write(jsonData);
                    }).then(() => {
                        messageDiv.innerHTML += '<div class="success">✅ File saved! Now update src/data/brands.json with this content.</div>';
                    }).catch(err => {
                        console.error('Error saving file:', err);
                        downloadFile(jsonData);
                    });
                } else {
                    downloadFile(jsonData);
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
            }
        }
        
        function downloadFile(data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'brands.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            document.getElementById('message').innerHTML += '<div class="success">✅ File downloaded! Replace src/data/brands.json with this file.</div>';
        }
        
        // Auto-extract on load
        window.onload = function() {
            setTimeout(extractAndSave, 500);
        };
    </script>
</body>
</html>`;
  
  const htmlPath = path.join(__dirname, 'auto-extract.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('✅ Created auto-extract.html');
  console.log('📝 Opening in your default browser...\n');
  
  // Open in default browser
  try {
    execSync(`start ${htmlPath}`, { shell: true });
  } catch (e) {
    console.log('⚠️  Please manually open: ' + htmlPath);
  }
  
  return htmlPath;
}

// Alternative: Check Downloads folder for exported file
function checkDownloads() {
  const downloadsPath = path.join(os.homedir(), 'Downloads');
  const exportedFile = path.join(downloadsPath, 'brands-data.json');
  const brandsJson = path.join(downloadsPath, 'brands.json');
  
  let foundFile = null;
  if (fs.existsSync(exportedFile)) {
    foundFile = exportedFile;
  } else if (fs.existsSync(brandsJson)) {
    foundFile = brandsJson;
  }
  
  if (foundFile) {
    console.log('📁 Found exported file: ' + foundFile);
    const data = fs.readFileSync(foundFile, 'utf8');
    
    // Validate JSON
    try {
      const parsed = JSON.parse(data);
      if (parsed.brands && Array.isArray(parsed.brands)) {
        const brandsJsonPath = path.join(__dirname, 'src', 'data', 'brands.json');
        fs.writeFileSync(brandsJsonPath, JSON.stringify(parsed, null, 2), 'utf8');
        console.log('✅ Updated src/data/brands.json');
        return true;
      }
    } catch (e) {
      console.log('⚠️  File found but invalid JSON format');
    }
  }
  
  return false;
}

// Main execution
console.log('Method 1: Checking Downloads folder for exported file...\n');
if (checkDownloads()) {
  console.log('\n✅ Data extracted and updated!');
  console.log('📤 Committing and pushing to GitHub...\n');
  try {
    execSync('git add src/data/brands.json', { stdio: 'inherit' });
    execSync('git commit -m "Add brand data from localStorage to brands.json"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\n✅ Successfully pushed to GitHub!');
    console.log('⏳ Vercel will auto-deploy in 1-2 minutes.');
    process.exit(0);
  } catch (gitError) {
    console.log('\n⚠️  Git commands failed. Please run manually:');
    console.log('   git add src/data/brands.json');
    console.log('   git commit -m "Add brand data"');
    console.log('   git push origin main');
    process.exit(1);
  }
} else {
  console.log('Method 2: Creating browser-based extractor...\n');
  createExtractorHTML();
  console.log('\n📋 Instructions:');
  console.log('1. The browser will open with an extraction page');
  console.log('2. It will automatically extract your localStorage data');
  console.log('3. A file will be downloaded or saved');
  console.log('4. Run this script again after the file is saved/downloaded');
  console.log('\n   OR manually:');
  console.log('   - Copy the JSON from the page');
  console.log('   - Paste into src/data/brands.json');
  console.log('   - Run: git add src/data/brands.json && git commit -m "Add data" && git push origin main');
}


