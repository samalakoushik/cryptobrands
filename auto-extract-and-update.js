// Fully automated extraction and update script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🚀 Starting automated extraction process...\n');

const downloadsPath = path.join(os.homedir(), 'Downloads');
const projectPath = __dirname;
const brandsJsonPath = path.join(projectPath, 'src', 'data', 'brands.json');

// Create extraction HTML that saves to a specific location
function createExtractorPage() {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Auto Extract Brand Data</title>
    <style>
        body { font-family: Arial; padding: 30px; background: #1a1a1a; color: #fff; max-width: 800px; margin: 50px auto; }
        .container { background: #2a2a2a; padding: 30px; border-radius: 10px; }
        button { background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
        button:hover { background: #45a049; }
        .success { color: #4CAF50; margin: 15px 0; padding: 10px; background: #1a3a1a; border-radius: 5px; }
        .error { color: #f44336; margin: 15px 0; padding: 10px; background: #3a1a1a; border-radius: 5px; }
        pre { background: #1a1a1a; padding: 15px; border-radius: 5px; overflow-x: auto; max-height: 400px; overflow-y: auto; }
        .info { color: #2196F3; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Extracting Brand Data...</h1>
        <div id="status" class="info">Checking localStorage...</div>
        <div id="message"></div>
        <pre id="output" style="display:none;"></pre>
    </div>
    
    <script>
        function extractAndProcess() {
            const statusDiv = document.getElementById('status');
            const messageDiv = document.getElementById('message');
            const outputDiv = document.getElementById('output');
            
            try {
                const storedBrands = localStorage.getItem('cryptoBrands');
                
                if (!storedBrands) {
                    statusDiv.innerHTML = '<div class="error">❌ No brand data found in localStorage.</div>';
                    statusDiv.innerHTML += '<div class="info">💡 Make sure you have added brands on <a href="http://localhost:3000" style="color:#4CAF50;">localhost:3000</a> first.</div>';
                    return;
                }
                
                const brands = JSON.parse(storedBrands);
                const jsonData = JSON.stringify({ brands }, null, 2);
                
                statusDiv.innerHTML = '<div class="success">✅ Found ' + brands.length + ' brand(s) in localStorage!</div>';
                outputDiv.textContent = jsonData;
                outputDiv.style.display = 'block';
                
                // Download the file
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'brands.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                messageDiv.innerHTML = '<div class="success">✅ File downloaded as brands.json</div>';
                messageDiv.innerHTML += '<div class="info">📝 The file has been saved to your Downloads folder.</div>';
                messageDiv.innerHTML += '<div class="info">⏳ The automation script will process it automatically...</div>';
                
                // Also try to copy to clipboard
                navigator.clipboard.writeText(jsonData).then(() => {
                    messageDiv.innerHTML += '<div class="success">📋 Data also copied to clipboard!</div>';
                }).catch(() => {});
                
            } catch (error) {
                statusDiv.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
            }
        }
        
        // Auto-extract on load
        window.onload = function() {
            setTimeout(extractAndProcess, 500);
        };
    </script>
</body>
</html>`;
  
  const htmlPath = path.join(projectPath, 'extract-now.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  return htmlPath;
}

// Process downloaded file
function processDownloadedFile() {
  const possibleFiles = [
    path.join(downloadsPath, 'brands.json'),
    path.join(downloadsPath, 'brands-data.json'),
    path.join(projectPath, 'brands.json')
  ];
  
  for (const filePath of possibleFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        let parsed = JSON.parse(data);
        
        // Normalize structure
        if (Array.isArray(parsed)) {
          parsed = { brands: parsed };
        }
        
        if (parsed.brands && Array.isArray(parsed.brands)) {
          fs.writeFileSync(brandsJsonPath, JSON.stringify(parsed, null, 2), 'utf8');
          console.log(`✅ Updated src/data/brands.json with ${parsed.brands.length} brand(s)`);
          
          // Clean up downloaded file
          try {
            fs.unlinkSync(filePath);
          } catch (e) {}
          
          return true;
        }
      } catch (error) {
        console.log(`⚠️  Error processing ${filePath}: ${error.message}`);
      }
    }
  }
  return false;
}

// Watch Downloads folder for new files
function watchForFile() {
  console.log('👀 Watching Downloads folder for brands.json...');
  console.log('📝 Opening extraction page in your browser...\n');
  
  const htmlPath = createExtractorPage();
  
  try {
    execSync(`start ${htmlPath}`, { shell: true });
  } catch (e) {
    console.log(`⚠️  Please manually open: ${htmlPath}`);
  }
  
  // Check immediately
  if (processDownloadedFile()) {
    return true;
  }
  
  // Watch for file changes
  let checkCount = 0;
  const maxChecks = 60; // Check for 60 seconds
  
  const checkInterval = setInterval(() => {
    checkCount++;
    
    if (processDownloadedFile()) {
      clearInterval(checkInterval);
      return true;
    }
    
    if (checkCount >= maxChecks) {
      clearInterval(checkInterval);
      console.log('\n⏱️  Timeout waiting for file. Please:');
      console.log('   1. Make sure the extraction page downloaded brands.json');
      console.log('   2. Run this script again');
      return false;
    }
  }, 1000);
  
  return false;
}

// Commit and push
function commitAndPush() {
  console.log('\n📤 Committing and pushing to GitHub...\n');
  try {
    execSync('git add src/data/brands.json', { stdio: 'inherit' });
    execSync('git commit -m "Add brand data from localStorage to brands.json"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\n✅ Successfully pushed to GitHub!');
    console.log('⏳ Vercel will auto-deploy in 1-2 minutes.');
    console.log('🌐 Your friend will see the brand data on the live site!');
    return true;
  } catch (gitError) {
    console.log('\n⚠️  Git commands failed. Please run manually:');
    console.log('   git add src/data/brands.json');
    console.log('   git commit -m "Add brand data"');
    console.log('   git push origin main');
    return false;
  }
}

// Main execution
console.log('Step 1: Checking for already downloaded files...\n');
if (processDownloadedFile()) {
  console.log('\n✅ Found and processed existing file!');
  commitAndPush();
} else {
  console.log('Step 2: Creating extraction page and watching for download...\n');
  watchForFile();
  
  // Give it a moment, then check again
  setTimeout(() => {
    if (processDownloadedFile()) {
      commitAndPush();
    }
  }, 3000);
}


