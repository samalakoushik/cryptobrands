import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BrandDetail = ({ brands }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const brand = brands.find(b => b.id === parseInt(id));

  if (!brand) {
    return (
      <div className="container">
        <div className="empty-state">Brand not found</div>
      </div>
    );
  }

  const GOLD_COST = 1000;
  const BADGE_COST = 50;
  const badgeTotal = brand.affiliateBadges * BADGE_COST;
  const totalSpend = GOLD_COST + badgeTotal;

  return (
    <div className="brand-detail">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Home
      </button>
      
      <div className="detail-header">
        {brand.logoUrl && (
          <div className="detail-logo-container">
            <img src={brand.logoUrl} alt={brand.name} className="detail-logo" />
          </div>
        )}
        <h1 className="detail-title">{brand.name}</h1>
        <div className="detail-username">{brand.username}</div>
        {brand.xProfileLink && (
          <a 
            href={brand.xProfileLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="x-link"
          >
            View on X →
          </a>
        )}
      </div>

      <div className="cost-breakdown">
        <div className="cost-item">
          <span className="cost-label">Gold subscription:</span>
          <span className="cost-value">${GOLD_COST.toLocaleString()}</span>
        </div>
        <div className="cost-item">
          <span className="cost-label">
            {brand.affiliateBadges} affiliate badge{brand.affiliateBadges !== 1 ? 's' : ''}:
          </span>
          <span className="cost-value">${badgeTotal.toLocaleString()}</span>
        </div>
        <div className="cost-item total-cost">
          <span className="cost-label">Total spend:</span>
          <span className="cost-value">${totalSpend.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default BrandDetail;

