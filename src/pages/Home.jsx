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

  // Function to load brands - brands.json is the source of truth (deployed data)
  const loadBrands = () => {
    // Always use brands.json as the primary source of truth
    // This ensures all users see the same data that's deployed
    const baseBrands = brandsData.brands || [];
    
    // Only merge localStorage if it has additional brands (for local development)
    // In production, brands.json should always be the authoritative source
    const storedBrands = localStorage.getItem('cryptoBrands');
    
    if (storedBrands) {
      try {
        const localBrands = JSON.parse(storedBrands);
        // Only merge if localStorage has more brands than brands.json
        // This allows local testing while keeping brands.json as source of truth
        if (localBrands.length > baseBrands.length) {
          const baseIds = new Set(baseBrands.map(b => b.id));
          const extraBrands = localBrands.filter(b => !baseIds.has(b.id));
          setBrands([...baseBrands, ...extraBrands]);
          return;
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
    
    // Always default to brands.json (the deployed source of truth)
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

  // Poll for brands.json updates (when GitHub sync updates the deployed data)
  // Note: In production, brands.json is updated via GitHub sync, then Vercel redeploys
  // This polling ensures the page updates when new data is deployed
  useEffect(() => {
    const interval = setInterval(() => {
      // Always check brands.json as the source of truth
      const baseBrands = brandsData.brands || [];
      const currentBrandsStr = JSON.stringify(brands);
      const baseBrandsStr = JSON.stringify(baseBrands);
      
      // Update if brands.json has changed (after deployment)
      if (currentBrandsStr !== baseBrandsStr) {
        setBrands(baseBrands);
      }
    }, 2000); // Check every 2 seconds for updates (less frequent since it's deployment-based)
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

