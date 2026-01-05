import React, { useState, useEffect, useRef } from 'react';

const SearchBar = ({ brands, onBrandSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBrands([]);
      setShowResults(false);
      return;
    }

    const filtered = brands.filter(brand => 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredBrands(filtered);
    setShowResults(filtered.length > 0);
  }, [searchTerm, brands]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBrandSelect = (brand) => {
    setSearchTerm('');
    setShowResults(false);
    if (onBrandSelect) {
      onBrandSelect(brand);
    }
  };


  return (
    <div className="search-bar" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="search by username or brand name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowResults(true)}
        />
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {showResults && filteredBrands.length > 0 && (
        <div className="search-results">
          {filteredBrands.map(brand => (
            <div
              key={brand.id}
              className="search-result-item"
              onClick={() => handleBrandSelect(brand)}
            >
              {brand.logoUrl && (
                <img src={brand.logoUrl} alt={brand.name} className="search-result-logo" />
              )}
              <div className="search-result-content">
                <div className="brand-name">{brand.name}</div>
                <div className="brand-username">{brand.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

