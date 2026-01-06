// Utility to sync brands to GitHub via API
export const syncBrandsToGitHub = async (brands, action = '') => {
  try {
    const response = await fetch('/api/update-brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brands,
        action,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to sync to GitHub');
    }

    return {
      success: true,
      message: data.message || 'Successfully synced to GitHub',
    };
  } catch (error) {
    console.error('Error syncing to GitHub:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync to GitHub',
    };
  }
};

