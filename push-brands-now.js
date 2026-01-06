// Quick script to push localStorage brands to GitHub
// This will extract brands from browser and push to GitHub

const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'samalakoushik';
const REPO_NAME = 'cryptobrands';
const FILE_PATH = 'src/data/brands.json';
const BRANCH = 'main';
const GITHUB_EMAIL = 'koushik.tech2003@gmail.com';
const GITHUB_PASSWORD = 'tL#K6O^dPTt4m3';

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
 * Get GitHub token (create if needed)
 */
async function getOrCreateToken(browser) {
  const tokenFile = path.join(__dirname, '.github-token-temp.txt');
  if (fs.existsSync(tokenFile)) {
    const token = fs.readFileSync(tokenFile, 'utf8').trim();
    if (token.startsWith('ghp_')) {
      log('✅ Using existing GitHub token', 'green');
      return token;
    }
  }

  log('🔑 Creating GitHub token...', 'cyan');
  const page = await browser.newPage();
  
  try {
    await page.goto('https://github.com/login', { waitUntil: 'networkidle2' });
    await page.type('#login_field', GITHUB_EMAIL, { delay: 50 });
    await page.type('#password', GITHUB_PASSWORD, { delay: 50 });
    await page.click('input[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    await page.goto('https://github.com/settings/tokens/new?scopes=repo&description=Vercel%20Brands%20Sync', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[name="oauth_access[description]"]');
    
    const noteInput = await page.$('input[name="oauth_access[description]"]');
    if (noteInput) {
      await noteInput.click({ clickCount: 3 });
      await noteInput.type('Vercel Brands Sync', { delay: 50 });
    }
    
    const noExpiration = await page.$('input[value="0"][name="oauth_access[expires_at]"]');
    if (noExpiration) await noExpiration.click();
    
    const repoCheckbox = await page.$('input[value="repo"]');
    if (repoCheckbox) {
      const isChecked = await page.evaluate(el => el.checked, repoCheckbox);
      if (!isChecked) await repoCheckbox.click();
    }
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    const token = await page.evaluate(() => {
      const codeBlock = document.querySelector('code, input[readonly]');
      if (codeBlock) return codeBlock.textContent || codeBlock.value;
      const pageText = document.body.textContent;
      const match = pageText.match(/ghp_[a-zA-Z0-9]{36,}/);
      return match ? match[0] : null;
    });
    
    if (token && token.startsWith('ghp_')) {
      fs.writeFileSync(tokenFile, token, 'utf8');
      log('✅ Token created and saved', 'green');
      return token;
    }
    
    throw new Error('Could not extract token');
  } finally {
    await page.close();
  }
}

/**
 * Get brands from admin page localStorage
 */
async function getBrandsFromBrowser(browser) {
  log('📦 Extracting brands from browser...', 'cyan');
  const page = await browser.newPage();
  
  try {
    // Go to admin page (or any page on the site)
    await page.goto('https://cryptobrands.vercel.app/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Get brands from localStorage
    const brands = await page.evaluate(() => {
      const stored = localStorage.getItem('cryptoBrands');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    });
    
    if (brands && brands.length > 0) {
      log(`✅ Found ${brands.length} brand(s) in localStorage`, 'green');
      return brands;
    }
    
    log('⚠️  No brands in localStorage, checking brands.json...', 'yellow');
    // Fallback to reading from file
    const brandsFile = path.join(__dirname, 'src', 'data', 'brands.json');
    if (fs.existsSync(brandsFile)) {
      const data = JSON.parse(fs.readFileSync(brandsFile, 'utf8'));
      return data.brands || [];
    }
    
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Update brands.json on GitHub
 */
function updateGitHub(token, brands) {
  return new Promise((resolve, reject) => {
    // Get current SHA
    const getOptions = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.request(getOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let sha = null;
        if (res.statusCode === 200) {
          sha = JSON.parse(data).sha;
        } else if (res.statusCode !== 404) {
          reject(new Error(`Failed to get file: ${res.statusCode}`));
          return;
        }

        // Update file
        const content = JSON.stringify({ brands }, null, 2);
        const encoded = Buffer.from(content).toString('base64');

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

        const req = https.request(updateOptions, (updateRes) => {
          let updateData = '';
          updateRes.on('data', (chunk) => { updateData += chunk; });
          updateRes.on('end', () => {
            if (updateRes.statusCode === 200 || updateRes.statusCode === 201) {
              resolve(JSON.parse(updateData));
            } else {
              reject(new Error(`Failed: ${updateRes.statusCode} ${updateData}`));
            }
          });
        });

        req.on('error', reject);
        req.write(JSON.stringify({
          message: 'Update brands.json: Push local brands to GitHub',
          content: encoded,
          branch: BRANCH,
          sha: sha
        }));
        req.end();
      });
    }).on('error', reject).end();
  });
}

/**
 * Main
 */
async function main() {
  log('\n🚀 Pushing Local Brands to GitHub\n', 'cyan');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });

    // Get brands from browser
    const brands = await getBrandsFromBrowser(browser);
    
    if (!brands || brands.length === 0) {
      log('❌ No brands found!', 'red');
      log('Please add brands in the admin dashboard first.', 'yellow');
      await browser.close();
      return;
    }

    log(`\n📋 Found ${brands.length} brand(s):`, 'cyan');
    brands.slice(0, 5).forEach((b, i) => {
      log(`   ${i + 1}. ${b.name} (@${b.username})`, 'white');
    });
    if (brands.length > 5) {
      log(`   ... and ${brands.length - 5} more`, 'white');
    }

    // Get or create token
    const token = await getOrCreateToken(browser);

    // Push to GitHub
    log('\n📤 Pushing to GitHub...', 'cyan');
    const result = await updateGitHub(token, brands);
    
    log('\n✅ Successfully pushed to GitHub!', 'green');
    log(`   Commit: ${result.commit.sha.substring(0, 7)}`, 'green');
    log(`   Message: ${result.commit.message}`, 'green');
    log('\n⏳ Vercel will auto-deploy in 1-2 minutes', 'yellow');
    log('   All users will see the updates shortly!\n', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (browser) {
      log('\nBrowser will stay open for 5 seconds...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await browser.close();
    }
  }
}

main();

