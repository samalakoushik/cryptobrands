// Automated GitHub token creation using browser automation
const puppeteer = require('puppeteer');

async function createGitHubToken(username, password) {
  console.log('🚀 Starting automated GitHub token creation...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Show browser so user can see progress
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    
    console.log('📝 Step 1: Logging into GitHub...');
    await page.goto('https://github.com/login', { waitUntil: 'networkidle2' });
    
    // Fill login form
    await page.type('#login_field', username);
    await page.type('#password', password);
    await page.click('input[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Check if login was successful
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      console.log('❌ Login failed. Please check your credentials.');
      await browser.close();
      return null;
    }
    
    console.log('✅ Logged in successfully!\n');
    
    console.log('📝 Step 2: Creating personal access token...');
    // Navigate to token creation page
    await page.goto('https://github.com/settings/tokens/new?scopes=repo&description=Vercel%20Brands%20Sync', {
      waitUntil: 'networkidle2'
    });
    
    // Wait for the form to load
    await page.waitForSelector('input[name="oauth_access[description]"]', { timeout: 10000 });
    
    // Fill in token details
    const noteInput = await page.$('input[name="oauth_access[description]"]');
    if (noteInput) {
      await noteInput.click({ clickCount: 3 }); // Select existing text
      await noteInput.type('Vercel Brands Sync');
    }
    
    // Select "No expiration" or set expiration
    try {
      const noExpiration = await page.$('input[value="0"]');
      if (noExpiration) {
        await noExpiration.click();
      }
    } catch (e) {
      console.log('⚠️  Could not set expiration automatically');
    }
    
    // Check "repo" scope
    try {
      const repoCheckbox = await page.$('input[value="repo"]');
      if (repoCheckbox) {
        const isChecked = await page.evaluate(el => el.checked, repoCheckbox);
        if (!isChecked) {
          await repoCheckbox.click();
        }
      }
    } catch (e) {
      console.log('⚠️  Could not check repo scope automatically');
    }
    
    console.log('✅ Form filled!');
    console.log('\n⚠️  IMPORTANT: Please manually click "Generate token" button');
    console.log('   The browser will wait for you to complete this step...\n');
    
    // Wait for user to click generate token and copy it
    console.log('⏳ Waiting for token generation...');
    console.log('   After you click "Generate token", copy the token and paste it here:\n');
    
    // Keep browser open for user to complete
    // We'll wait for them to provide the token via command line
    
    return { browser, page };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (browser) {
      await browser.close();
    }
    return null;
  }
}

// Get credentials from command line or environment
const args = process.argv.slice(2);
let username, password;

if (args.includes('--username') && args.includes('--password')) {
  const userIndex = args.indexOf('--username');
  const passIndex = args.indexOf('--password');
  username = args[userIndex + 1];
  password = args[passIndex + 1];
} else {
  console.log('Usage: node auto-create-token.js --username YOUR_USERNAME --password YOUR_PASSWORD');
  console.log('Or set GITHUB_USERNAME and GITHUB_PASSWORD environment variables\n');
  process.exit(1);
}

if (!username || !password) {
  console.log('❌ Username and password are required');
  process.exit(1);
}

createGitHubToken(username, password).then(async (result) => {
  if (result) {
    const { browser } = result;
    console.log('\n✅ Browser automation started!');
    console.log('   Complete the token creation in the browser window.');
    console.log('   The browser will stay open for you to copy the token.\n');
    
    // Don't close browser - let user complete the process
    // User can close it manually after getting the token
  }
}).catch(console.error);

