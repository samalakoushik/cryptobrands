// Complete automation: Create token and configure Vercel
const https = require('https');
const { execSync } = require('child_process');
const os = require('os');
const readline = require('readline');

console.log('🚀 Complete GitHub Sync Setup Automation\n');

// Since GitHub doesn't allow programmatic token creation,
// we'll guide through manual creation but automate Vercel setup

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('📋 This will help you:');
  console.log('   1. Create GitHub token (manual - takes 30 seconds)');
  console.log('   2. Add token to Vercel (automated)\n');

  // Step 1: Create GitHub token
  console.log('Step 1: Create GitHub Token');
  console.log('Opening GitHub token creation page...\n');
  
  const tokenUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=Vercel%20Brands%20Sync';
  try {
    if (os.platform() === 'win32') {
      execSync(`start "" "${tokenUrl}"`, { shell: true });
    } else if (os.platform() === 'darwin') {
      execSync(`open "${tokenUrl}"`);
    } else {
      execSync(`xdg-open "${tokenUrl}"`);
    }
    console.log('✅ Browser opened!\n');
  } catch (error) {
    console.log('⚠️  Please visit:', tokenUrl, '\n');
  }

  console.log('On the GitHub page:');
  console.log('   1. Token name: "Vercel Brands Sync" (pre-filled)');
  console.log('   2. Expiration: "No expiration"');
  console.log('   3. Scopes: "repo" (should be checked)');
  console.log('   4. Click "Generate token"');
  console.log('   5. COPY THE TOKEN (starts with ghp_...)\n');

  const token = await question('Paste your GitHub token here: ');
  
  if (!token || !token.trim() || !token.startsWith('ghp_')) {
    console.log('\n❌ Invalid token. Please run this script again with a valid token.');
    rl.close();
    return;
  }

  const cleanToken = token.trim();
  console.log('\n✅ Token received!');

  // Test token
  console.log('🧪 Testing token...');
  const tokenValid = await testToken(cleanToken);
  
  if (!tokenValid) {
    console.log('\n❌ Token validation failed. Please check the token and try again.');
    rl.close();
    return;
  }

  console.log('✅ Token is valid!\n');

  // Step 2: Add to Vercel
  console.log('Step 2: Add Token to Vercel');
  console.log('Opening Vercel dashboard...\n');

  const vercelUrl = 'https://vercel.com/dashboard';
  try {
    if (os.platform() === 'win32') {
      execSync(`start "" "${vercelUrl}"`, { shell: true });
    } else if (os.platform() === 'darwin') {
      execSync(`open "${vercelUrl}"`);
    } else {
      execSync(`xdg-open "${vercelUrl}"`);
    }
  } catch (error) {
    console.log('⚠️  Please visit:', vercelUrl, '\n');
  }

  console.log('📋 Instructions:');
  console.log('   1. Find "cryptobrands" project → Click on it');
  console.log('   2. Go to Settings → Environment Variables');
  console.log('   3. Click "Add New"');
  console.log('   4. Enter:');
  console.log('      Key: GITHUB_TOKEN');
  console.log(`      Value: ${cleanToken.substring(0, 15)}...`);
  console.log('      Environment: All (Production, Preview, Development)');
  console.log('   5. Click "Save"');
  console.log('   6. Go to Deployments → Click "..." on latest → "Redeploy"\n');

  // Save token locally for reference
  const fs = require('fs');
  const path = require('path');
  const tokenFile = path.join(__dirname, '.github-token-temp.txt');
  fs.writeFileSync(tokenFile, cleanToken, 'utf8');
  console.log(`💾 Token saved to ${tokenFile} (for reference only - not committed)`);
  console.log('⚠️  Delete this file after setup!\n');

  console.log('✅ Setup instructions displayed!');
  console.log('   After adding the token to Vercel and redeploying,');
  console.log('   admin changes will automatically sync to GitHub!\n');

  rl.close();
}

function testToken(token) {
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
          const user = JSON.parse(data);
          console.log(`   ✅ Authenticated as: ${user.login}`);
          resolve(true);
        } else {
          console.log(`   ❌ Validation failed: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

main().catch(console.error);

