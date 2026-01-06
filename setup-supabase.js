// Script to help set up Supabase project and get credentials
const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const SUPABASE_EMAIL = 'koushik.tech2003@gmail.com';
const SUPABASE_PASSWORD = 'V#I3u0M1HZHFNY';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

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

async function setupSupabase() {
  log('\n🚀 Setting up Supabase Integration\n', 'cyan');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    
    log('📝 Step 1: Logging into Supabase...', 'cyan');
    await page.goto('https://supabase.com/dashboard', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Check if already logged in or need to login
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('sign-in')) {
      log('   Logging in...', 'yellow');
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      await page.type('input[type="email"], input[name="email"]', SUPABASE_EMAIL, { delay: 50 });
      await page.type('input[type="password"], input[name="password"]', SUPABASE_PASSWORD, { delay: 50 });
      await page.click('button[type="submit"], button:has-text("Sign in")');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    }
    
    log('✅ Logged into Supabase!', 'green');
    
    // Wait a bit for dashboard to load
    await page.waitForTimeout(3000);
    
    log('\n📋 Step 2: Getting project credentials...', 'cyan');
    log('   Please select your project in the browser window.', 'yellow');
    log('   If you don\'t have a project, create one first.\n', 'yellow');
    
    // Wait for user to select project
    await question('Press Enter after selecting your project in the browser...');
    
    // Navigate to project settings
    log('\n   Navigating to project settings...', 'yellow');
    await page.waitForTimeout(2000);
    
    // Try to find settings link
    try {
      const settingsLink = await page.$('a[href*="settings"], a:has-text("Settings")');
      if (settingsLink) {
        await settingsLink.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      log('   Could not find settings link automatically', 'yellow');
    }
    
    // Navigate to API settings
    const apiUrl = page.url().includes('/settings') 
      ? page.url() + '/api'
      : page.url().replace(/\/$/, '') + '/settings/api';
    
    await page.goto(apiUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    log('\n📋 Step 3: Extracting credentials...', 'cyan');
    
    // Extract project URL and anon key
    const credentials = await page.evaluate(() => {
      const urlElement = document.querySelector('input[value*="supabase.co"], code:has-text("https://")');
      const keyElement = document.querySelector('input[value*="eyJ"], code:has-text("eyJ")');
      
      let url = null;
      let key = null;
      
      // Try to find URL
      if (urlElement) {
        url = urlElement.value || urlElement.textContent;
      } else {
        // Look for URL in page text
        const urlMatch = document.body.textContent.match(/https:\/\/[a-z0-9]+\.supabase\.co/);
        if (urlMatch) url = urlMatch[0];
      }
      
      // Try to find anon key
      if (keyElement) {
        key = keyElement.value || keyElement.textContent;
      } else {
        // Look for key in page text
        const keyMatch = document.body.textContent.match(/eyJ[a-zA-Z0-9_-]{100,}/);
        if (keyMatch) key = keyMatch[0];
      }
      
      return { url, key };
    });
    
    if (!credentials.url || !credentials.key) {
      log('\n⚠️  Could not extract credentials automatically.', 'yellow');
      log('   Please copy them manually from the browser:', 'yellow');
      log('   1. Project URL (starts with https://)', 'white');
      log('   2. Anon/Public key (starts with eyJ)', 'white');
      
      const manualUrl = await question('\nPaste your Supabase Project URL: ');
      const manualKey = await question('Paste your Supabase Anon Key: ');
      
      credentials.url = manualUrl.trim();
      credentials.key = manualKey.trim();
    }
    
    if (!credentials.url || !credentials.key) {
      throw new Error('Missing credentials');
    }
    
    log('\n✅ Credentials extracted!', 'green');
    log(`   URL: ${credentials.url.substring(0, 30)}...`, 'white');
    log(`   Key: ${credentials.key.substring(0, 20)}...`, 'white');
    
    // Save to .env.local
    log('\n📝 Step 4: Saving credentials...', 'cyan');
    const envContent = `REACT_APP_SUPABASE_URL=${credentials.url}
REACT_APP_SUPABASE_ANON_KEY=${credentials.key}
`;
    
    const envFile = path.join(__dirname, '.env.local');
    fs.writeFileSync(envFile, envContent, 'utf8');
    log(`✅ Saved to ${envFile}`, 'green');
    
    log('\n📋 Step 5: Setting up database table...', 'cyan');
    log('   Please run the SQL script in Supabase SQL Editor', 'yellow');
    log('   See SUPABASE_SETUP.md for SQL commands\n', 'yellow');
    
    log('✅ Setup complete!', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Run SQL script in Supabase to create brands table', 'white');
    log('  2. Run: node migrate-to-supabase.js (to migrate existing data)', 'white');
    log('  3. Add env vars to Vercel (see SUPABASE_SETUP.md)', 'white');
    log('  4. Test the application!\n', 'white');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (browser) {
      log('\nBrowser will stay open for 10 seconds...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 10000));
      await browser.close();
    }
    rl.close();
  }
}

setupSupabase();

