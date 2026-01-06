// Complete Automation Script for GitHub Token & Vercel Setup
// Automates the entire setup process using Puppeteer

const puppeteer = require('puppeteer');
const https = require('https');
const { waitForOTP, validateOTP, rl } = require('./email-otp-handler');
const fs = require('fs');
const path = require('path');

// Configuration
const GITHUB_EMAIL = 'koushik.tech2003@gmail.com';
const GITHUB_PASSWORD = 'tL#K6O^dPTt4m3';
const VERCEL_EMAIL = 'koushik.tech2003@gmail.com';
const VERCEL_PROJECT_NAME = 'cryptobrands';
const REPO_OWNER = 'samalakoushik';
const REPO_NAME = 'cryptobrands';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Validate GitHub token via API
 */
function validateGitHubToken(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const user = JSON.parse(data);
            logSuccess(`Token validated! Authenticated as: ${user.login}`);
            resolve({ valid: true, user: user.login });
          } catch (e) {
            resolve({ valid: false, error: 'Failed to parse response' });
          }
        } else {
          resolve({ valid: false, error: `Status: ${res.statusCode}` });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ valid: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ valid: false, error: 'Request timeout' });
    });

    req.end();
  });
}

/**
 * Retry wrapper for async operations
 */
async function retryOperation(operation, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const delay = options.delay || 2000;
  const operationName = options.name || 'Operation';
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) {
        logError(`${operationName} failed after ${maxRetries} attempts: ${error.message}`);
        throw error;
      }
      logWarning(`${operationName} failed (attempt ${i + 1}/${maxRetries}): ${error.message}`);
      logInfo(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Wait for element with retry logic and multiple strategies
 */
async function waitForElement(page, selector, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const timeout = options.timeout || 30000;
  const visible = options.visible !== false;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (visible) {
        await page.waitForSelector(selector, { timeout, visible: true });
      } else {
        await page.waitForSelector(selector, { timeout });
      }
      return true;
    } catch (error) {
      if (i === maxRetries - 1) {
        // Try alternative selectors if provided
        if (options.alternatives && Array.isArray(options.alternatives)) {
          for (const altSelector of options.alternatives) {
            try {
              await page.waitForSelector(altSelector, { timeout: 5000 });
              logInfo(`Found element using alternative selector: ${altSelector}`);
              return true;
            } catch (e) {
              // Continue to next alternative
            }
          }
        }
        logError(`Element not found: ${selector}`);
        logInfo('Current page URL:', page.url());
        throw new Error(`Element not found after ${maxRetries} attempts: ${selector}`);
      }
      logWarning(`Retrying to find ${selector}... (${i + 1}/${maxRetries})`);
      await page.waitForTimeout(2000);
    }
  }
  return false;
}

/**
 * Safe click with retry
 */
async function safeClick(page, selector, options = {}) {
  return retryOperation(async () => {
    await waitForElement(page, selector, options);
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    await element.click();
    return true;
  }, { name: `Click ${selector}`, maxRetries: options.maxRetries || 3 });
}

/**
 * Safe type with retry
 */
async function safeType(page, selector, text, options = {}) {
  return retryOperation(async () => {
    await waitForElement(page, selector, options);
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    await element.click({ clickCount: 3 }); // Select all existing text
    await element.type(text, { delay: options.delay || 50 });
    return true;
  }, { name: `Type into ${selector}`, maxRetries: options.maxRetries || 3 });
}

/**
 * Step 1: Create GitHub Personal Access Token
 */
async function createGitHubToken(browser) {
  logStep('1', 'Creating GitHub Personal Access Token');
  
  const page = await browser.newPage();
  
  try {
    // Navigate to login
    logInfo('Navigating to GitHub login...');
    await page.goto('https://github.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Fill login form with retry
    logInfo('Filling login credentials...');
    await safeType(page, '#login_field', GITHUB_EMAIL, { 
      alternatives: ['input[name="login"]', 'input[type="text"]'],
      maxRetries: 5 
    });
    await safeType(page, '#password', GITHUB_PASSWORD, { 
      alternatives: ['input[name="password"]', 'input[type="password"]'],
      maxRetries: 5 
    });
    
    // Submit form with retry
    logInfo('Submitting login form...');
    await safeClick(page, 'input[type="submit"]', {
      alternatives: ['button[type="submit"]', 'button:has-text("Sign in")'],
      maxRetries: 3
    });
    
    // Wait for navigation with timeout handling
    try {
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation timeout')), 35000))
      ]);
    } catch (error) {
      logWarning('Navigation timeout, checking current state...');
      await page.waitForTimeout(2000);
    }
    
    // Check if login was successful
    const currentUrl = page.url();
    const pageContent = await page.content();
    
    if (currentUrl.includes('login') || currentUrl.includes('session') || pageContent.includes('Incorrect username or password')) {
      logError('Login failed. Possible reasons:');
      logError('  - Incorrect email or password');
      logError('  - Account requires 2FA (not supported in this automation)');
      logError('  - Account is locked or suspended');
      throw new Error('GitHub login failed - please verify credentials');
    }
    
    logSuccess('Successfully logged into GitHub!');
    
    // Navigate to token creation page with retry
    logInfo('Navigating to token creation page...');
    const tokenUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=Vercel%20Brands%20Sync';
    
    await retryOperation(async () => {
      await page.goto(tokenUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitForElement(page, 'input[name="oauth_access[description]"]', { 
        timeout: 15000,
        alternatives: ['input[type="text"]', 'input[name*="description"]']
      });
    }, { name: 'Navigate to token creation page', maxRetries: 3 });
    
    // Fill token details
    logInfo('Filling token form...');
    const noteInput = await page.$('input[name="oauth_access[description]"]');
    if (noteInput) {
      await noteInput.click({ clickCount: 3 });
      await noteInput.type('Vercel Brands Sync', { delay: 50 });
    }
    
    // Select "No expiration"
    try {
      const expirationRadios = await page.$$('input[type="radio"][name="oauth_access[expires_at]"]');
      if (expirationRadios.length > 0) {
        // Look for "No expiration" option (value="0" or similar)
        const noExpiration = await page.$('input[value="0"][name="oauth_access[expires_at]"]');
        if (noExpiration) {
          await noExpiration.click();
          logInfo('Selected "No expiration"');
        }
      }
    } catch (e) {
      logWarning('Could not set expiration automatically');
    }
    
    // Ensure "repo" scope is checked
    try {
      const repoCheckbox = await page.$('input[value="repo"]');
      if (repoCheckbox) {
        const isChecked = await page.evaluate(el => el.checked, repoCheckbox);
        if (!isChecked) {
          await repoCheckbox.click();
          logInfo('Checked "repo" scope');
        }
      }
    } catch (e) {
      logWarning('Could not verify repo scope');
    }
    
    // Generate token with retry
    logInfo('Clicking "Generate token" button...');
    await safeClick(page, 'button[type="submit"]', {
      alternatives: [
        'button:has-text("Generate")',
        'button:has-text("Generate token")',
        'form button[type="submit"]'
      ],
      maxRetries: 3
    });
    
    // Wait for token to be generated with timeout handling
    logInfo('Waiting for token generation...');
    try {
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Token generation timeout')), 35000))
      ]);
    } catch (error) {
      logWarning('Navigation timeout after clicking generate, checking page...');
      await page.waitForTimeout(3000);
      // Continue - token might still be on page
    }
    
    // Extract token from page
    logInfo('Extracting token from page...');
    const token = await page.evaluate(() => {
      // Token is typically in a code block or input field
      const codeBlock = document.querySelector('code, input[readonly]');
      if (codeBlock) {
        return codeBlock.textContent || codeBlock.value;
      }
      // Alternative: look for text starting with ghp_
      const pageText = document.body.textContent;
      const match = pageText.match(/ghp_[a-zA-Z0-9]{36,}/);
      return match ? match[0] : null;
    });
    
    if (!token || !token.startsWith('ghp_')) {
      logError('Could not extract token from page automatically');
      logWarning('This might happen if:');
      logWarning('  - The page structure changed');
      logWarning('  - Token was already generated and page redirected');
      logWarning('  - There was an error during token generation');
      logInfo('\nPlease check the browser window and:');
      logInfo('  1. Look for the token on the page (starts with ghp_)');
      logInfo('  2. Or check if there was an error message');
      logInfo('  3. If token is visible, copy it manually\n');
      
      const readline = require('readline');
      const manualRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        manualRl.question('Paste GitHub token (starts with ghp_) or press Enter to retry: ', async (manualToken) => {
          manualRl.close();
          const trimmed = manualToken.trim();
          if (trimmed && trimmed.startsWith('ghp_')) {
            resolve(trimmed);
          } else {
            // Retry extraction
            logInfo('Retrying token extraction...');
            await page.waitForTimeout(2000);
            const retryToken = await page.evaluate(() => {
              const codeBlock = document.querySelector('code, input[readonly]');
              if (codeBlock) {
                return codeBlock.textContent || codeBlock.value;
              }
              const pageText = document.body.textContent;
              const match = pageText.match(/ghp_[a-zA-Z0-9]{36,}/);
              return match ? match[0] : null;
            });
            
            if (retryToken && retryToken.startsWith('ghp_')) {
              resolve(retryToken);
            } else {
              throw new Error('Could not extract token. Please run the script again or create token manually.');
            }
          }
        });
      });
    }
    
    logSuccess(`Token extracted: ${token.substring(0, 15)}...`);
    
    // Validate token
    logInfo('Validating token...');
    const validation = await validateGitHubToken(token);
    if (!validation.valid) {
      logError(`Token validation failed: ${validation.error}`);
      throw new Error('Token validation failed');
    }
    
    return token;
    
  } catch (error) {
    logError(`Error creating GitHub token: ${error.message}`);
    logError('Stack trace:', error.stack);
    logWarning('Troubleshooting tips:');
    logWarning('  1. Check if GitHub login page structure changed');
    logWarning('  2. Verify credentials are correct');
    logWarning('  3. Check if account requires 2FA (not supported)');
    logWarning('  4. Try creating token manually at: https://github.com/settings/tokens/new');
    throw error;
  } finally {
    // Don't close page - let user see what happened
    logInfo('GitHub token creation page will remain open for verification');
  }
}

/**
 * Step 2: Add token to Vercel
 */
async function addTokenToVercel(browser, githubToken) {
  logStep('2', 'Adding GitHub Token to Vercel');
  
  const page = await browser.newPage();
  
  try {
    // Navigate to Vercel login
    logInfo('Navigating to Vercel login...');
    await page.goto('https://vercel.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Fill email with retry
    logInfo('Filling email...');
    await safeType(page, 'input[type="email"]', VERCEL_EMAIL, {
      alternatives: [
        'input[name="email"]',
        'input[placeholder*="email" i]',
        'input[type="text"]'
      ],
      maxRetries: 5
    });
    
    // Click continue/submit with retry
    logInfo('Submitting email...');
    try {
      await safeClick(page, 'button[type="submit"]', {
        alternatives: [
          'button:has-text("Continue")',
          'button:has-text("Log in")',
          'button:has-text("Next")',
          '[data-testid*="submit"]'
        ],
        maxRetries: 3
      });
    } catch (error) {
      logWarning('Could not find submit button, trying Enter key...');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
    }
    
    // Wait for OTP page
    logInfo('Waiting for OTP verification page...');
    await page.waitForTimeout(3000);
    
    // Check if we're on OTP page
    const currentUrl = page.url();
    const pageContent = await page.content();
    
    if (pageContent.includes('verification') || pageContent.includes('code') || currentUrl.includes('verify')) {
      logInfo('OTP verification required');
      
      // Wait for OTP input field
      await waitForElement(page, 'input[type="text"], input[type="number"], input[name*="code"], input[name*="otp"]', { timeout: 10000 });
      
      // Get OTP from user
      const otp = await waitForOTP(120000); // 2 minute timeout
      
      if (!validateOTP(otp)) {
        throw new Error('Invalid OTP format');
      }
      
      logInfo('Entering OTP...');
      const otpInput = await page.$('input[type="text"], input[type="number"], input[name*="code"], input[name*="otp"]');
      if (otpInput) {
        await otpInput.click({ clickCount: 3 });
        await otpInput.type(otp, { delay: 100 });
      }
      
      // Submit OTP
      const verifyButton = await page.$('button[type="submit"], button:has-text("Verify"), button:has-text("Continue")');
      if (verifyButton) {
        await verifyButton.click();
      } else {
        await page.keyboard.press('Enter');
      }
      
      // Wait for navigation after OTP
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      logSuccess('OTP verified successfully!');
    }
    
    // Navigate to project settings
    logInfo('Navigating to project settings...');
    await page.goto(`https://vercel.com/${VERCEL_PROJECT_NAME}/settings/environment-variables`, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });
    
    // Wait a bit for page to load
    await page.waitForTimeout(3000);
    
    // Check if environment variable already exists
    const pageText = await page.evaluate(() => document.body.textContent);
    if (pageText.includes('GITHUB_TOKEN')) {
      logWarning('GITHUB_TOKEN already exists. Checking if update is needed...');
      // Could add logic to update existing variable here
    }
    
    // Click "Add New" button
    logInfo('Clicking "Add New" button...');
    const addButton = await page.$('button:has-text("Add"), button:has-text("Add New"), a:has-text("Add")');
    if (addButton) {
      await addButton.click();
      await page.waitForTimeout(2000);
    } else {
      // Try alternative selectors
      const altButton = await page.$('[data-testid*="add"], [aria-label*="Add"]');
      if (altButton) {
        await altButton.click();
        await page.waitForTimeout(2000);
      } else {
        logWarning('Could not find "Add" button automatically. Please add manually.');
        logInfo('The browser will stay open for you to complete this step.');
        await page.waitForTimeout(60000); // Wait 1 minute for manual completion
      }
    }
    
    // Fill environment variable form
    logInfo('Filling environment variable form...');
    
    // Key field
    const keyInput = await page.$('input[name*="key"], input[placeholder*="Key"], input[placeholder*="Name"]');
    if (keyInput) {
      await keyInput.click({ clickCount: 3 });
      await keyInput.type('GITHUB_TOKEN', { delay: 50 });
    }
    
    // Value field
    const valueInput = await page.$('input[name*="value"], input[type="password"], textarea[name*="value"]');
    if (valueInput) {
      await valueInput.click({ clickCount: 3 });
      await valueInput.type(githubToken, { delay: 50 });
    }
    
    // Select "All" environments (if checkbox/radio exists)
    try {
      const envCheckboxes = await page.$$('input[type="checkbox"][name*="environment"]');
      for (const checkbox of envCheckboxes) {
        const isChecked = await page.evaluate(el => el.checked, checkbox);
        if (!isChecked) {
          await checkbox.click();
        }
      }
    } catch (e) {
      logWarning('Could not set environments automatically');
    }
    
    // Save
    logInfo('Saving environment variable...');
    const saveButton = await page.$('button[type="submit"]:has-text("Save"), button:has-text("Add")');
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(3000);
      logSuccess('Environment variable saved!');
    } else {
      logWarning('Could not find save button. Please save manually.');
      await page.waitForTimeout(30000); // Wait 30 seconds for manual save
    }
    
    // Navigate to deployments and trigger redeploy
    logInfo('Navigating to deployments...');
    await page.goto(`https://vercel.com/${VERCEL_PROJECT_NAME}`, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // Try to find and click redeploy
    logInfo('Looking for redeploy option...');
    const redeployButton = await page.$('button:has-text("Redeploy"), [aria-label*="Redeploy"]');
    if (redeployButton) {
      await redeployButton.click();
      await page.waitForTimeout(2000);
      logSuccess('Redeploy triggered!');
    } else {
      logWarning('Could not find redeploy button automatically.');
      logInfo('Please manually redeploy from the Deployments tab.');
      logInfo('The browser will stay open for 30 seconds...');
      await page.waitForTimeout(30000);
    }
    
    logSuccess('Vercel setup completed!');
    
  } catch (error) {
    logError(`Error setting up Vercel: ${error.message}`);
    logError('Stack trace:', error.stack);
    logWarning('Troubleshooting tips:');
    logWarning('  1. Check if Vercel login page structure changed');
    logWarning('  2. Verify OTP code was entered correctly');
    logWarning('  3. Check if project name is correct: ' + VERCEL_PROJECT_NAME);
    logWarning('  4. Try completing setup manually in the browser');
    logWarning('  5. The browser will stay open for manual completion');
    throw error;
  } finally {
    // Don't close page - let user verify
    logInfo('Vercel setup page will remain open for verification');
  }
}

/**
 * Main automation function
 */
async function main() {
  log('\n🚀 Starting Complete Automation Setup\n', 'bright');
  log('This will:', 'cyan');
  log('  1. Create GitHub Personal Access Token', 'white');
  log('  2. Add token to Vercel Environment Variables', 'white');
  log('  3. Trigger Vercel redeploy\n', 'white');
  
  let browser;
  let githubToken = null;
  
  try {
    // Launch browser
    logInfo('Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],
      slowMo: 100 // Slow down operations for visibility
    });
    
    logSuccess('Browser launched!\n');
    
    // Step 1: Create GitHub token
    githubToken = await createGitHubToken(browser);
    
    // Save token to file for reference
    const tokenFile = path.join(__dirname, '.github-token-temp.txt');
    fs.writeFileSync(tokenFile, githubToken, 'utf8');
    logInfo(`Token saved to ${tokenFile} (for reference only - not committed)`);
    logWarning('Delete this file after setup is complete!\n');
    
    // Step 2: Add to Vercel
    await addTokenToVercel(browser, githubToken);
    
    log('\n✅ Setup Complete!\n', 'bright');
    log('Next steps:', 'cyan');
    log('  1. Verify the environment variable in Vercel dashboard', 'white');
    log('  2. Wait for Vercel to redeploy (1-2 minutes)', 'white');
    log('  3. Test by adding a brand in the admin dashboard', 'white');
    log('  4. Delete .github-token-temp.txt file\n', 'white');
    
  } catch (error) {
    logError(`\n❌ Automation failed: ${error.message}`);
    logError('\nError details:', error.stack);
    logWarning('\nThe browser will stay open for manual completion if needed.');
    logInfo('\nManual steps if automation failed:');
    logInfo('  1. GitHub Token: https://github.com/settings/tokens/new?scopes=repo');
    logInfo('  2. Vercel Env Var: https://vercel.com/' + VERCEL_PROJECT_NAME + '/settings/environment-variables');
    logInfo('  3. Add GITHUB_TOKEN with the token value');
    logInfo('  4. Redeploy the project\n');
    
    if (githubToken) {
      logInfo('Your GitHub token (save this):');
      logInfo(githubToken.substring(0, 20) + '...');
      logWarning('Full token saved in .github-token-temp.txt\n');
    }
  } finally {
    // Keep browser open for user to verify
    logInfo('\nBrowser will remain open. Press Ctrl+C when done to close.\n');
    
    // Don't close browser automatically - let user verify everything
    // await browser.close();
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  log('\n\n⚠️  Interrupted by user', 'yellow');
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  rl.close();
  process.exit(0);
});

// Run main function
main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  rl.close();
  process.exit(1);
});

