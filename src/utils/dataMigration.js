// Utility to migrate localStorage data to initial brands.json
// This helps sync local data to the live site

export const exportLocalStorageData = () => {
  const storedBrands = localStorage.getItem('cryptoBrands');
  if (storedBrands) {
    try {
      const brands = JSON.parse(storedBrands);
      const jsonString = JSON.stringify({ brands }, null, 2);
      
      // Create a downloadable file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'brands-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Brand data exported! Copy the contents to src/data/brands.json');
      return brands;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }
  return null;
};

export const importBrandsData = (brandsArray) => {
  if (Array.isArray(brandsArray)) {
    localStorage.setItem('cryptoBrands', JSON.stringify(brandsArray));
    return true;
  }
  return false;
};

