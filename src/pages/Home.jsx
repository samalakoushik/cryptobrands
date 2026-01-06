import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import BrandCard from '../components/BrandCard';
import BrandModal from '../components/BrandModal';
import brandsData from '../data/brands.json';

const Home = () => {
  const [brands, setBrands] = useState([]);
  const [sortBy, setSortBy] = useState('spend-high');
  const [showAll, setShowAll] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setScrollDirection] = useState('down');
  const [isFixed, setIsFixed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Function to load and merge brands from brands.json and localStorage
  const loadBrands = () => {
    const baseBrands = brandsData.brands || [];
    const storedBrands = localStorage.getItem('cryptoBrands');
    
    if (storedBrands) {
      try {
        const localBrands = JSON.parse(storedBrands);
        // If localStorage has data, use it (it includes all brands including new ones added via admin)
        // This ensures admin additions are immediately visible
        if (localBrands.length > 0) {
          setBrands(localBrands);
          return;
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
    
    // Fallback to baseBrands if no localStorage data
    setBrands(baseBrands);
  };

  // Initial load
  useEffect(() => {
    loadBrands();
  }, []);

  // Listen for storage changes (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cryptoBrands') {
        loadBrands();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Poll for localStorage changes (same-tab updates - when admin adds/edits brands)
  useEffect(() => {
    const interval = setInterval(() => {
      const storedBrands = localStorage.getItem('cryptoBrands');
      if (storedBrands) {
        try {
          const parsed = JSON.parse(storedBrands);
          // Only update if data actually changed
          const currentBrandsStr = JSON.stringify(brands);
          const newBrandsStr = JSON.stringify(parsed);
          if (currentBrandsStr !== newBrandsStr) {
            setBrands(parsed);
          }
        } catch (error) {
          // Ignore parse errors
        }
      } else {
        // If localStorage was cleared, reload from base
        const baseBrands = brandsData.brands || [];
        const currentBrandsStr = JSON.stringify(brands);
        const baseBrandsStr = JSON.stringify(baseBrands);
        if (currentBrandsStr !== baseBrandsStr) {
          setBrands(baseBrands);
        }
      }
    }, 500); // Check every 500ms for updates
    return () => clearInterval(interval);
  }, [brands]);


  // Scroll detection for button text and fixed header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const searchContainer = document.querySelector('.search-container');
      const searchContainerBottom = searchContainer ? searchContainer.getBoundingClientRect().bottom + window.scrollY : 0;
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      // Check if we've scrolled past search bar
      if (currentScrollY > searchContainerBottom + 50) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const sortedBrands = [...brands].sort((a, b) => {
    const GOLD_COST = 1000;
    const BADGE_COST = 50;
    const totalA = GOLD_COST + (a.affiliateBadges * BADGE_COST);
    const totalB = GOLD_COST + (b.affiliateBadges * BADGE_COST);

    switch (sortBy) {
      case 'spend-high':
        return totalB - totalA;
      case 'spend-low':
        return totalA - totalB;
      case 'a-z':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="container">
      <h1 className="page-title">Crypto Brands' X Affiliate Spends</h1>
      
      <div className="search-container">
        <SearchBar 
          brands={brands} 
          onBrandSelect={(brand) => {
            setSelectedBrand(brand);
            setIsModalOpen(true);
          }}
        />
      </div>

      <div className="created-by">
        Created by <a href="https://x.com/0xkoushik" target="_blank" rel="noopener noreferrer" className="creator-link">0xkoushik</a>
      </div>

      <div className={`controls-row ${isFixed ? 'fixed-header' : ''}`}>
        <div className="controls-wrapper">
          <div className="sort-controls">
            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="spend-high">Highest Spend</option>
              <option value="spend-low">Lowest Spend</option>
              <option value="a-z">A-Z</option>
            </select>
          </div>
          {sortedBrands.length > 3 && showAll && (
            <div className="view-more-container">
              <button className="view-more-button" onClick={() => setShowAll(false)}>
                See Less
              </button>
            </div>
          )}
        </div>
      </div>

      {sortedBrands.length === 0 ? (
        <div className="empty-state">
          No brands added yet.
        </div>
      ) : (
        <>
          <div className="brands-grid">
            {(showAll ? sortedBrands : sortedBrands.slice(0, 3)).map(brand => (
              <BrandCard 
                key={brand.id} 
                brand={brand} 
                onOpenModal={(brand) => {
                  setSelectedBrand(brand);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
          {sortedBrands.length > 3 && !showAll && (
            <div className="see-more-bottom-container">
              <button className="view-more-button" onClick={() => setShowAll(true)}>
                See More
              </button>
            </div>
          )}
        </>
      )}

      <BrandModal
        brand={selectedBrand}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBrand(null);
        }}
      />
    </div>
  );
};

export default Home;

