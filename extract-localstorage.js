// Run this in browser console on localhost to extract localStorage data
// Open browser console (F12) and paste this code

(function() {
  const storedBrands = localStorage.getItem('cryptoBrands');
  
  if (!storedBrands) {
    console.log('No brand data found in localStorage.');
    return;
  }
  
  try {
    const brands = JSON.parse(storedBrands);
    const jsonData = JSON.stringify({ brands }, null, 2);
    
    // Display in console
    console.log('=== BRAND DATA ===');
    console.log(jsonData);
    console.log('==================');
    console.log('\nCopy the JSON above and paste it into src/data/brands.json');
    
    // Also create downloadable file
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brands-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('\n✅ File downloaded! Check your Downloads folder.');
  } catch (error) {
    console.error('Error extracting data:', error);
  }
})();

