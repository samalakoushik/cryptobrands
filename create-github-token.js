// Script to help create GitHub token and configure Vercel
const https = require('https');
const readline = require('readline');

console.log('🔐 GitHub Token Setup\n');

// Note: GitHub doesn't allow programmatic token creation via API
// We need to guide the user through the web interface
// But we can help them verify and use it once created

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📋 Step 1: Create GitHub Token');
console.log('Opening GitHub token creation page...\n');

// Open browser to token creation
const { execSync } = require('child_process');
const os = require('os');

const tokenUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=Vercel%20Brands%20Sync';

try {
  if (os.platform() === 'win32') {
    execSync(`start ${tokenUrl}`, { shell: true });
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
console.log('1. Token name: "Vercel Brands Sync" (already filled)');
console.log('2. Expiration: Choose "No expiration"');
console.log('3. Scopes: "repo" should be checked');
console.log('4. Click "Generate token"');
console.log('5. COPY THE TOKEN (starts with ghp_...)\n');

rl.question('Paste your GitHub token here (or press Enter to skip): ', (token) => {
  if (!token || !token.trim()) {
    console.log('\n⚠️  No token provided. You can add it manually to Vercel later.');
    console.log('See FINAL_SETUP_INSTRUCTIONS.md for manual steps.\n');
    rl.close();
    return;
  }

  const cleanToken = token.trim();
  
  if (!cleanToken.startsWith('ghp_')) {
    console.log('\n❌ Invalid token format. Token should start with "ghp_"');
    rl.close();
    return;
  }

  console.log('\n✅ Token received!');
  console.log('\n📋 Step 2: Add to Vercel');
  console.log('Opening Vercel dashboard...\n');

  // Open Vercel dashboard
  const vercelUrl = 'https://vercel.com/dashboard';
  try {
    if (os.platform() === 'win32') {
      execSync(`start ${vercelUrl}`, { shell: true });
    } else if (os.platform() === 'darwin') {
      execSync(`open "${vercelUrl}"`);
    } else {
      execSync(`xdg-open "${vercelUrl}"`);
    }
  } catch (error) {
    console.log('⚠️  Please visit:', vercelUrl, '\n');
  }

  console.log('In Vercel dashboard:');
  console.log('1. Find "cryptobrands" project → Click on it');
  console.log('2. Go to Settings → Environment Variables');
  console.log('3. Click "Add New"');
  console.log('4. Enter:');
  console.log('   Key: GITHUB_TOKEN');
  console.log(`   Value: ${cleanToken.substring(0, 10)}...`);
  console.log('   Environment: All (Production, Preview, Development)');
  console.log('5. Click "Save"');
  console.log('6. Go to Deployments → Click "..." on latest → "Redeploy"\n');

  // Save token to a file for reference (not committed)
  const fs = require('fs');
  const path = require('path');
  const tokenFile = path.join(__dirname, '.github-token.txt');
  fs.writeFileSync(tokenFile, cleanToken, 'utf8');
  console.log(`💾 Token saved to ${tokenFile} (not committed to git)`);
  console.log('⚠️  Delete this file after setup!\n');

  // Test the token
  console.log('🧪 Testing token...\n');
  testGitHubToken(cleanToken);

  rl.close();
});

function testGitHubToken(token) {
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

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        const user = JSON.parse(data);
        console.log(`✅ Token is valid! Authenticated as: ${user.login}`);
        console.log('\n🎉 Setup complete! After adding to Vercel and redeploying,');
        console.log('   admin changes will automatically sync to GitHub!\n');
      } else {
        console.log(`❌ Token validation failed: ${res.statusCode}`);
        console.log('Response:', data);
        console.log('\n⚠️  Please check that the token has "repo" scope.\n');
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error testing token: ${error.message}\n`);
  });

  req.end();
}

