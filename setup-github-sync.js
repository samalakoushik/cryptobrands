// Automated setup script for GitHub sync
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 GitHub Sync Setup Automation\n');

// Step 1: Open browser to create GitHub token
console.log('Step 1: Opening GitHub token creation page...');
const tokenUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=Vercel%20Brands%20Sync';
try {
  if (os.platform() === 'win32') {
    execSync(`start ${tokenUrl}`, { shell: true });
  } else if (os.platform() === 'darwin') {
    execSync(`open "${tokenUrl}"`);
  } else {
    execSync(`xdg-open "${tokenUrl}"`);
  }
  console.log('✅ Browser opened to GitHub token creation page\n');
} catch (error) {
  console.log('⚠️  Could not open browser automatically. Please visit:');
  console.log(`   ${tokenUrl}\n`);
}

console.log('📋 Instructions:');
console.log('1. On the GitHub page that just opened:');
console.log('   - Token name: "Vercel Brands Sync" (already filled)');
console.log('   - Expiration: Choose "No expiration" or your preference');
console.log('   - Scopes: "repo" should be checked (already selected)');
console.log('   - Click "Generate token"');
console.log('   - ⚠️  COPY THE TOKEN (starts with ghp_...) - you won\'t see it again!\n');

console.log('2. Once you have the token, paste it here and press Enter:');
console.log('   (Or press Ctrl+C to cancel and do it manually)\n');

// Wait for user input (this won't work in automated mode, but provides instructions)
console.log('💡 Alternative: Run this command after you have the token:');
console.log('   node setup-github-sync.js --token YOUR_TOKEN_HERE\n');

// Check if token provided as argument
const args = process.argv.slice(2);
if (args.includes('--token') && args.length > 1) {
  const tokenIndex = args.indexOf('--token');
  const token = args[tokenIndex + 1];
  
  if (token && token.startsWith('ghp_')) {
    console.log('\n✅ Token received!');
    console.log('\nStep 2: Opening Vercel dashboard to add environment variable...\n');
    
    // Open Vercel environment variables page
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
      console.log('⚠️  Could not open browser. Please visit:');
      console.log(`   ${vercelUrl}\n`);
    }
    
    console.log('📋 Instructions to add token to Vercel:');
    console.log('1. In Vercel dashboard, find your "cryptobrands" project');
    console.log('2. Click on it → Settings → Environment Variables');
    console.log('3. Add new variable:');
    console.log('   - Key: GITHUB_TOKEN');
    console.log('   - Value: (your token)');
    console.log('   - Environment: All (Production, Preview, Development)');
    console.log('4. Click Save');
    console.log('5. Go to Deployments → Click "..." on latest → Redeploy\n');
    
    console.log('✅ After redeploying, the GitHub sync will work!\n');
    
    // Save token to a temporary file for reference (not committed)
    const tokenFile = path.join(__dirname, '.github-token-temp.txt');
    fs.writeFileSync(tokenFile, token, 'utf8');
    console.log(`💾 Token saved to ${tokenFile} for reference (not committed to git)`);
    console.log('⚠️  Delete this file after setup is complete!\n');
  } else {
    console.log('❌ Invalid token format. Token should start with "ghp_"');
  }
} else {
  console.log('\n⏳ Waiting for token... (or use --token flag)');
  console.log('   After you paste the token, the script will continue.\n');
}

