// Script to migrate existing brands.json data to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please run: node setup-supabase.js first');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function migrate() {
  log('\n🚀 Migrating Brands to Supabase\n', 'cyan');
  
  // Read current brands.json
  const brandsFile = path.join(__dirname, 'src', 'data', 'brands.json');
  
  if (!fs.existsSync(brandsFile)) {
    log('❌ brands.json not found!', 'red');
    process.exit(1);
  }
  
  const brandsData = JSON.parse(fs.readFileSync(brandsFile, 'utf8'));
  const brands = brandsData.brands || [];
  
  if (brands.length === 0) {
    log('⚠️  No brands found in brands.json', 'yellow');
    process.exit(0);
  }
  
  log(`📦 Found ${brands.length} brand(s) to migrate\n`, 'cyan');
  
  // Check if table exists and has data
  const { data: existingBrands, error: checkError } = await supabase
    .from('brands')
    .select('id')
    .limit(1);
  
  if (checkError && checkError.code !== 'PGRST116') {
    log('❌ Error checking table:', 'red');
    log(`   ${checkError.message}`, 'red');
    log('\n⚠️  Make sure you\'ve run the SQL script to create the brands table!', 'yellow');
    log('   See SUPABASE_SETUP.md for instructions\n', 'yellow');
    process.exit(1);
  }
  
  if (existingBrands && existingBrands.length > 0) {
    log('⚠️  Table already has data. Skipping migration.', 'yellow');
    log('   If you want to re-migrate, clear the table first.\n', 'yellow');
    process.exit(0);
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const brand of brands) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert({
          name: brand.name,
          username: brand.username,
          affiliate_badges: brand.affiliateBadges || 0,
          x_profile_link: brand.xProfileLink || null,
          logo_url: brand.logoUrl || null
        })
        .select()
        .single();
      
      if (error) {
        log(`❌ Error migrating ${brand.name}: ${error.message}`, 'red');
        errorCount++;
      } else {
        log(`✅ Migrated: ${brand.name}`, 'green');
        successCount++;
      }
    } catch (error) {
      log(`❌ Error migrating ${brand.name}: ${error.message}`, 'red');
      errorCount++;
    }
  }
  
  log('\n' + '='.repeat(50), 'cyan');
  log(`✅ Migration complete!`, 'green');
  log(`   Success: ${successCount}`, 'green');
  if (errorCount > 0) {
    log(`   Errors: ${errorCount}`, 'red');
  }
  log('='.repeat(50) + '\n', 'cyan');
  
  log('🎉 Your brands are now in Supabase!', 'green');
  log('   Changes will sync in real-time across all browsers.\n', 'green');
}

migrate().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

