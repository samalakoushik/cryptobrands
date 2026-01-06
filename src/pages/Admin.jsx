import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLogin from '../components/AdminLogin';
import brandsData from '../data/brands.json';
import { getBrands, addBrand, updateBrand, deleteBrand, subscribeToBrands } from '../utils/brandsService';
import { syncBrandsToGitHub } from '../utils/githubSync';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    affiliateBadges: '',
    xProfileLink: '',
    logoUrl: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);

  // Load brands - try Supabase first, fallback to brands.json + localStorage
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const data = await getBrands(); // This will fallback to brands.json if Supabase not configured
        setBrands(data || []);
        
        // If using brands.json, also check localStorage for additional brands
        if (data && data.length > 0) {
          const storedBrands = localStorage.getItem('cryptoBrands');
          if (storedBrands) {
            try {
              const localBrands = JSON.parse(storedBrands);
              if (localBrands.length > data.length) {
                // Merge: use data as base, add extras from localStorage
                const dataIds = new Set(data.map(b => b.id));
                const extraBrands = localBrands.filter(b => !dataIds.has(b.id));
                setBrands([...data, ...extraBrands]);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      } catch (error) {
        console.error('Error loading brands:', error);
        // Fallback to brands.json + localStorage
        const baseBrands = brandsData.brands || [];
        const storedBrands = localStorage.getItem('cryptoBrands');
        
        if (storedBrands) {
          try {
            const localBrands = JSON.parse(storedBrands);
            setBrands(localBrands.length > 0 ? localBrands : baseBrands);
          } catch (e) {
            setBrands(baseBrands);
          }
        } else {
          setBrands(baseBrands);
        }
      } finally {
        setLoading(false);
      }
    };

    // Check if already authenticated
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadBrands();

      // Subscribe to real-time changes (only if Supabase configured)
      const unsubscribe = subscribeToBrands((payload) => {
        console.log('Real-time update received:', payload);
        loadBrands();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear preview if URL is manually changed
    if (name === 'logoUrl') {
      setLogoPreview(null);
    }
  };

  const compressImage = (file, maxWidth = 200, maxHeight = 200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('Image size must be less than 2MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      // Compress and convert to base64
      const compressedBase64 = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        logoUrl: compressedBase64
      }));

      // Clean up preview URL after a moment
      setTimeout(() => {
        URL.revokeObjectURL(previewUrl);
      }, 1000);
    } catch (error) {
      alert(error.message || 'Error processing image');
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || formData.affiliateBadges === '') {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Try Supabase first
      if (editingId) {
        // Update existing brand
        try {
          await updateBrand(editingId, {
            name: formData.name.trim(),
            username: formData.username.trim(),
            affiliateBadges: formData.affiliateBadges,
            xProfileLink: formData.xProfileLink.trim() || null,
            logoUrl: formData.logoUrl.trim() || null
          });
          alert('Brand updated successfully! Changes are visible to everyone immediately.');
          
          // Reload brands
          const updatedBrands = await getBrands();
          setBrands(updatedBrands);
        } catch (supabaseError) {
          // Fallback to localStorage + GitHub sync
          const updatedBrands = brands.map(brand => 
            brand.id === editingId
              ? {
                  ...brand,
                  name: formData.name.trim(),
                  username: formData.username.trim(),
                  affiliateBadges: parseInt(formData.affiliateBadges),
                  xProfileLink: formData.xProfileLink.trim() || null,
                  logoUrl: formData.logoUrl.trim() || null
                }
              : brand
          );
          setBrands(updatedBrands);
          localStorage.setItem('cryptoBrands', JSON.stringify(updatedBrands));
          
          // Sync to GitHub
          const syncResult = await syncBrandsToGitHub(updatedBrands, `Updated brand: ${formData.name.trim()}`);
          if (syncResult.success) {
            alert('Brand updated successfully! ' + syncResult.message);
          } else {
            alert('Brand updated locally, but failed to sync to GitHub: ' + syncResult.message);
          }
        }
      } else {
        // Add new brand
        try {
          await addBrand({
            name: formData.name.trim(),
            username: formData.username.trim(),
            affiliateBadges: formData.affiliateBadges,
            xProfileLink: formData.xProfileLink.trim() || null,
            logoUrl: formData.logoUrl.trim() || null
          });
          alert('Brand added successfully! Changes are visible to everyone immediately.');
          
          // Reload brands
          const updatedBrands = await getBrands();
          setBrands(updatedBrands);
        } catch (supabaseError) {
          // Fallback to localStorage + GitHub sync
          const newBrand = {
            id: Date.now(),
            name: formData.name.trim(),
            username: formData.username.trim(),
            affiliateBadges: parseInt(formData.affiliateBadges),
            xProfileLink: formData.xProfileLink.trim() || null,
            logoUrl: formData.logoUrl.trim() || null
          };
          const updatedBrands = [...brands, newBrand];
          setBrands(updatedBrands);
          localStorage.setItem('cryptoBrands', JSON.stringify(updatedBrands));
          
          // Sync to GitHub
          const syncResult = await syncBrandsToGitHub(updatedBrands, `Added brand: ${newBrand.name}`);
          if (syncResult.success) {
            alert('Brand added successfully! ' + syncResult.message);
          } else {
            alert('Brand added locally, but failed to sync to GitHub: ' + syncResult.message);
          }
        }
      }

      // Reset form
      setFormData({
        name: '',
        username: '',
        affiliateBadges: '',
        xProfileLink: '',
        logoUrl: ''
      });
      setEditingId(null);
      setLogoPreview(null);
    } catch (error) {
      console.error('Error saving brand:', error);
      alert(`Error: ${error.message || 'Failed to save brand. Please try again.'}`);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.id);
    setFormData({
      name: brand.name,
      username: brand.username,
      affiliateBadges: brand.affiliateBadges.toString(),
      xProfileLink: brand.xProfileLink || '',
      logoUrl: brand.logoUrl || ''
    });
    // Set preview if logoUrl is a base64 image
    if (brand.logoUrl && brand.logoUrl.startsWith('data:image')) {
      setLogoPreview(brand.logoUrl);
    } else {
      setLogoPreview(null);
    }
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      username: '',
      affiliateBadges: '',
      xProfileLink: '',
      logoUrl: ''
    });
    setLogoPreview(null);
  };

  const handleDelete = async (id) => {
    const brandToDelete = brands.find(brand => brand.id === id);
    if (!brandToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${brandToDelete.name}"?`)) {
      try {
        // Try Supabase first
        try {
          await deleteBrand(id);
          alert('Brand deleted successfully! Changes are visible to everyone immediately.');
          
          // Reload brands
          const updatedBrands = await getBrands();
          setBrands(updatedBrands);
        } catch (supabaseError) {
          // Fallback to localStorage + GitHub sync
          const updatedBrands = brands.filter(brand => brand.id !== id);
          setBrands(updatedBrands);
          localStorage.setItem('cryptoBrands', JSON.stringify(updatedBrands));
          
          // Sync to GitHub
          const syncResult = await syncBrandsToGitHub(updatedBrands, `Deleted brand: ${brandToDelete.name}`);
          if (syncResult.success) {
            alert('Brand deleted successfully! ' + syncResult.message);
          } else {
            alert('Brand deleted locally, but failed to sync to GitHub: ' + syncResult.message);
          }
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert(`Error: ${error.message || 'Failed to delete brand. Please try again.'}`);
      }
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const GOLD_COST = 1000;
  const BADGE_COST = 50;

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-left">
          <Link to="/" className="back-to-home-link">← Back to Home</Link>
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          {loading && <span style={{ marginRight: '10px', color: '#888' }}>Loading...</span>}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2 className="form-section-title">
          {editingId ? 'Edit Brand' : 'Add New Brand'}
        </h2>
        <div className="form-group">
          <label className="form-label">Brand Name *</label>
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="Enter brand name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">X Username *</label>
          <input
            type="text"
            name="username"
            className="form-input"
            placeholder="@username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Number of Affiliate Badges *</label>
          <input
            type="number"
            name="affiliateBadges"
            className="form-input"
            placeholder="0"
            value={formData.affiliateBadges}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">X Profile Link (optional)</label>
          <input
            type="url"
            name="xProfileLink"
            className="form-input"
            placeholder="https://x.com/username"
            value={formData.xProfileLink}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Logo (optional)</label>
          <div className="logo-upload-container">
            <input
              type="file"
              accept="image/*"
              className="file-input"
              id="logo-upload"
              onChange={handleImageUpload}
            />
            <label htmlFor="logo-upload" className="file-input-label">
              Upload Image
            </label>
            <span className="logo-upload-or">or</span>
            <input
              type="url"
              name="logoUrl"
              className="form-input logo-url-input"
              placeholder="Enter logo URL"
              value={formData.logoUrl && !formData.logoUrl.startsWith('data:image') ? formData.logoUrl : ''}
              onChange={handleInputChange}
            />
          </div>
          {(logoPreview || (formData.logoUrl && formData.logoUrl.startsWith('data:image'))) && (
            <div className="logo-preview-container">
              <img 
                src={logoPreview || formData.logoUrl} 
                alt="Logo preview" 
                className="logo-preview"
              />
              <button
                type="button"
                className="remove-logo-button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, logoUrl: '' }));
                  setLogoPreview(null);
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-button">
            {editingId ? 'Update Brand' : 'Add Brand'}
          </button>
          {editingId && (
            <button type="button" className="cancel-button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="brands-list">
        <div className="brands-list-header">
          <h2 className="brands-list-title">Current Brands ({brands.length})</h2>
          <div className="admin-search-container">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search brands by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {filteredBrands.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? 'No brands found matching your search.' : 'No brands added yet.'}
          </div>
        ) : (
          filteredBrands.map(brand => {
            const totalSpend = GOLD_COST + (brand.affiliateBadges * BADGE_COST);
            return (
              <div key={brand.id} className="brand-list-item">
                <div className="brand-list-info">
                  {brand.logoUrl && (
                    <img src={brand.logoUrl} alt={brand.name} className="brand-list-logo" />
                  )}
                  <div className="brand-list-text">
                    <div className="brand-list-name">{brand.name}</div>
                    <div className="brand-list-details">
                      {brand.username} • {brand.affiliateBadges} badges • ${totalSpend.toLocaleString()} total
                    </div>
                  </div>
                </div>
                <div className="brand-list-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(brand)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(brand.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Admin;
