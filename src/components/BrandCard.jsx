import React from 'react';

const BrandCard = ({ brand, onOpenModal }) => {
  const GOLD_COST = 1000;
  const BADGE_COST = 50;
  const totalSpend = GOLD_COST + (brand.affiliateBadges * BADGE_COST);

  const handleClick = () => {
    onOpenModal(brand);
  };

  return (
    <div className="brand-card" data-brand-id={brand.id}>
      <div className="brand-card-header" onClick={handleClick}>
        {brand.logoUrl && (
          <div className="brand-logo-container">
            <img src={brand.logoUrl} alt={brand.name} className="brand-logo" />
          </div>
        )}
        <div className="brand-card-content">
          <div className="brand-name">{brand.name}</div>
          <div className="brand-username">{brand.username}</div>
          <div className="brand-stats">
            <div className="stat-item">
              <span className="stat-label">Affiliate Badges:</span>
              <span className="stat-value">{brand.affiliateBadges}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Spend:</span>
              <span className="stat-value">${totalSpend.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="expand-icon">
          View More
        </div>
      </div>
    </div>
  );
};

export default BrandCard;

