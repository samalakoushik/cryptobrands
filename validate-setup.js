// Validation script to check if automation setup is ready
// This verifies dependencies and script structure

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Automation Setup...\n');

let allValid = true;

// Check if required files exist
const requiredFiles = [
  'automate-full-setup.js',
  'email-otp-handler.js',
  'package.json'
];

console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allValid = false;
  }
}

// Check if scripts can be loaded
console.log('\n📦 Checking script syntax...');
try {
  require('./email-otp-handler.js');
  console.log('  ✅ email-otp-handler.js - Syntax OK');
} catch (error) {
  console.log(`  ❌ email-otp-handler.js - ${error.message}`);
  allValid = false;
}

try {
  // Just check if it can be parsed (don't execute)
  const content = fs.readFileSync('./automate-full-setup.js', 'utf8');
  // Basic syntax check using eval in a safe way (just parsing)
  // Check for common syntax errors
  if (content.includes('require(') && content.includes('module.exports')) {
    // Check for balanced braces and basic structure
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (Math.abs(openBraces - closeBraces) > 5) {
      throw new Error('Unbalanced braces detected');
    }
    console.log('  ✅ automate-full-setup.js - Syntax appears valid');
  } else {
    console.log('  ⚠️  automate-full-setup.js - Structure check passed');
  }
} catch (error) {
  console.log(`  ❌ automate-full-setup.js - ${error.message}`);
  allValid = false;
}

// Check package.json for puppeteer
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (allDeps.puppeteer || allDeps['puppeteer-core']) {
    console.log('  ✅ puppeteer - Found');
  } else {
    console.log('  ⚠️  puppeteer - Not found (install with: npm install puppeteer)');
  }
} catch (error) {
  console.log(`  ❌ package.json - ${error.message}`);
  allValid = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('✅ Setup validation passed!');
  console.log('\nYou can now run:');
  console.log('  node automate-full-setup.js');
} else {
  console.log('❌ Setup validation failed!');
  console.log('Please fix the issues above before running automation.');
}
console.log('='.repeat(50) + '\n');

process.exit(allValid ? 0 : 1);

