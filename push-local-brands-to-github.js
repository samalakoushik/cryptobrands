// Script to push locally saved brands to GitHub
// This reads brands from a JSON file and updates brands.json on GitHub

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Configuration
const GITHUB_EMAIL = 'koushik.tech2003@gmail.com';
const GITHUB_PASSWORD = 'tL#K6O^dPTt4m3';
const REPO_OWNER = 'samalakoushik';
const REPO_NAME = 'cryptobrands';
const FILE_PATH = 'src/data/brands.json';
const BRANCH = 'main';

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Create GitHub token using credentials
 */
async function createGitHubToken() {
  log('\n🔑 Creating GitHub Personal Access Token...', 'cyan');
  log('This requires browser automation. Opening browser...', 'yellow');
  
  // Use the automation script to create token
  const { execSync } = require('child_process');
  const puppeteer = require('puppeteer');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    
    // Navigate to login
    await page.goto('https://github.com/login', { waitUntil: 'networkidle2' });
    
    // Fill login
    await page.type('#login_field', GITHUB_EMAIL, { delay: 50 });
    await page.type('#password', GITHUB_PASSWORD, { delay: 50 });
    await page.click('input[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Navigate to token creation
    const tokenUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=Vercel%20Brands%20Sync';
    await page.goto(tokenUrl, { waitUntil: 'networkidle2' });
    
    // Fill form
    await page.waitForSelector('input[name="oauth_access[description]"]');
    const noteInput = await page.$('input[name="oauth_access[description]"]');
    if (noteInput) {
      await noteInput.click({ clickCount: 3 });
      await noteInput.type('Vercel Brands Sync', { delay: 50 });
    }
    
    // Select no expiration
    const noExpiration = await page.$('input[value="0"][name="oauth_access[expires_at]"]');
    if (noExpiration) {
      await noExpiration.click();
    }
    
    // Check repo scope
    const repoCheckbox = await page.$('input[value="repo"]');
    if (repoCheckbox) {
      const isChecked = await page.evaluate(el => el.checked, repoCheckbox);
      if (!isChecked) {
        await repoCheckbox.click();
      }
    }
    
    // Generate token
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Extract token
    const token = await page.evaluate(() => {
      const codeBlock = document.querySelector('code, input[readonly]');
      if (codeBlock) {
        return codeBlock.textContent || codeBlock.value;
      }
      const pageText = document.body.textContent;
      const match = pageText.match(/ghp_[a-zA-Z0-9]{36,}/);
      return match ? match[0] : null;
    });
    
    await browser.close();
    
    if (token && token.startsWith('ghp_')) {
      log('✅ Token created successfully!', 'green');
      // Save token
      const tokenFile = path.join(__dirname, '.github-token-temp.txt');
      fs.writeFileSync(tokenFile, token, 'utf8');
      return token;
    } else {
      log('⚠️  Could not extract token automatically.', 'yellow');
      const manualToken = await question('Please paste your GitHub token (starts with ghp_): ');
      if (manualToken && manualToken.trim().startsWith('ghp_')) {
        const tokenFile = path.join(__dirname, '.github-token-temp.txt');
        fs.writeFileSync(tokenFile, manualToken.trim(), 'utf8');
        return manualToken.trim();
      }
      throw new Error('Invalid token');
    }
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    log('❌ Error creating token: ' + error.message, 'red');
    throw error;
  }
}

/**
 * Get or create GitHub token
 */
async function getGitHubToken() {
  // Check for existing token file
  const tokenFile = path.join(__dirname, '.github-token-temp.txt');
  if (fs.existsSync(tokenFile)) {
    const token = fs.readFileSync(tokenFile, 'utf8').trim();
    if (token.startsWith('ghp_')) {
      log('✅ Using existing GitHub token', 'green');
      return token;
    }
  }
  
  // Try to create new token
  return await createGitHubToken();
}

/**
 * Update brands.json on GitHub
 */
async function updateBrandsOnGitHub(brands, token) {
  return new Promise((resolve, reject) => {
    // Step 1: Get current file SHA
    const getFileOptions = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const getReq = https.request(getFileOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let currentSha = null;
        if (res.statusCode === 200) {
          const fileData = JSON.parse(data);
          currentSha = fileData.sha;
        } else if (res.statusCode !== 404) {
          reject(new Error(`Failed to get file: ${res.statusCode} ${data}`));
          return;
        }

        // Step 2: Update file
        const newContent = JSON.stringify({ brands }, null, 2);
        const encodedContent = Buffer.from(newContent).toString('base64');

        const updateOptions = {
          hostname: 'api.github.com',
          path: `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'Node.js',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          }
        };

        const updateReq = https.request(updateOptions, (updateRes) => {
          let updateData = '';
          updateRes.on('data', (chunk) => { updateData += chunk; });
          updateRes.on('end', () => {
            if (updateRes.statusCode === 200 || updateRes.statusCode === 201) {
              const result = JSON.parse(updateData);
              resolve(result);
            } else {
              reject(new Error(`Failed to update: ${updateRes.statusCode} ${updateData}`));
            }
          });
        });

        updateReq.on('error', reject);

        updateReq.write(JSON.stringify({
          message: 'Update brands.json: Push local brands to GitHub',
          content: encodedContent,
          branch: BRANCH,
          sha: currentSha
        }));

        updateReq.end();
      });
    });

    getReq.on('error', reject);
    getReq.end();
  });
}

/**
 * Get brands from localStorage export or current brands.json
 */
async function getBrandsData() {
  // Check if there's a brands-export.json file
  const exportFile = path.join(__dirname, 'brands-export.json');
  if (fs.existsSync(exportFile)) {
    log('📦 Reading brands from brands-export.json...', 'cyan');
    const data = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
    return data.brands || data;
  }

  // Check current brands.json
  const brandsFile = path.join(__dirname, 'src', 'data', 'brands.json');
  if (fs.existsSync(brandsFile)) {
    log('📦 Reading brands from brands.json...', 'cyan');
    const data = JSON.parse(fs.readFileSync(brandsFile, 'utf8'));
    return data.brands || [];
  }

  // Ask user to provide brands
  log('⚠️  No brands file found.', 'yellow');
  log('Please either:', 'yellow');
  log('  1. Open export-localstorage-brands.html in browser and export brands', 'yellow');
  log('  2. Save the JSON as brands-export.json in this directory', 'yellow');
  log('  3. Or paste the brands JSON here', 'yellow');
  
  const jsonInput = await question('\nPaste brands JSON (or press Enter to use current brands.json): ');
  if (jsonInput && jsonInput.trim()) {
    try {
      const data = JSON.parse(jsonInput);
      return data.brands || data;
    } catch (e) {
      log('❌ Invalid JSON. Using current brands.json', 'red');
      return [];
    }
  }

  return [];
}

/**
 * Main function
 */
async function main() {
  log('\n🚀 Push Local Brands to GitHub\n', 'cyan');
  
  try {
    // Get brands data
    const brands = await getBrandsData();
    
    if (!brands || brands.length === 0) {
      log('❌ No brands found. Please export brands from localStorage first.', 'red');
      log('\nTo export:', 'yellow');
      log('  1. Open export-localstorage-brands.html in your browser', 'yellow');
      log('  2. Copy the JSON output', 'yellow');
      log('  3. Save it as brands-export.json in this directory', 'yellow');
      rl.close();
      return;
    }

    log(`✅ Found ${brands.length} brand(s)`, 'green');

    // Get GitHub token
    const token = await getGitHubToken();

    // Update on GitHub
    log('\n📤 Pushing to GitHub...', 'cyan');
    const result = await updateBrandsOnGitHub(brands, token);
    
    log('✅ Successfully pushed to GitHub!', 'green');
    log(`   Commit: ${result.commit.sha}`, 'green');
    log('\n⏳ Vercel will auto-deploy in 1-2 minutes', 'yellow');
    log('   All users will see the updates shortly!\n', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    rl.close();
  }
}

main();

