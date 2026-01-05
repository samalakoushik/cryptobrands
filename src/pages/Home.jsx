import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import BrandCard from '../components/BrandCard';
import BrandModal from '../components/BrandModal';
import brandsData from '../data/brands.json';

const Home = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [sortBy, setSortBy] = useState('spend-high');
  const [showAll, setShowAll] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('down');
  const [isFixed, setIsFixed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const storedBrands = localStorage.getItem('cryptoBrands');
    if (storedBrands) {
      setBrands(JSON.parse(storedBrands));
    } else {
      setBrands(brandsData.brands || []);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedBrands = localStorage.getItem('cryptoBrands');
      if (storedBrands) {
        setBrands(JSON.parse(storedBrands));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Poll for localStorage changes (for same-tab updates)
  useEffect(() => {
    const interval = setInterval(() => {
      const storedBrands = localStorage.getItem('cryptoBrands');
      if (storedBrands) {
        const parsed = JSON.parse(storedBrands);
        if (JSON.stringify(parsed) !== JSON.stringify(brands)) {
          setBrands(parsed);
        }
      }
    }, 500);
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

