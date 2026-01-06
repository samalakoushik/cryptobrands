import React, { useEffect } from 'react';

const BrandModal = ({ brand, isOpen, onClose }) => {
  const GOLD_COST = 1000;
  const BADGE_COST = 50;
  const badgeTotal = brand ? brand.affiliateBadges * BADGE_COST : 0;
  const totalSpend = brand ? GOLD_COST + badgeTotal : 0;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !brand) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-header">
          {brand.logoUrl && (
            <div className="modal-logo-container">
              <img src={brand.logoUrl} alt={brand.name} className="modal-logo" />
            </div>
          )}
          <h2 className="modal-title">{brand.name}</h2>
          {brand.xProfileLink ? (
            <a 
              href={brand.xProfileLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="modal-username-link"
            >
              {brand.username} →
            </a>
          ) : (
            <div className="modal-username">{brand.username}</div>
          )}
        </div>

        <div className="modal-body">
          <div className="modal-detail-row">
            <span className="modal-detail-label">Premium Business Full Access:</span>
            <span className="modal-detail-value">${GOLD_COST.toLocaleString()}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">
              No. of Affiliate Badges:
              <span className="info-icon-wrapper">
                <span className="info-icon">i</span>
                <span className="info-tooltip">
                  each affiliate badge costs $50<br/>
                  {brand.affiliateBadges}*50$ = ${badgeTotal.toLocaleString()}
                </span>
              </span>
            </span>
            <span className="modal-detail-value">{brand.affiliateBadges}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Total Affiliate Badges Cost:</span>
            <span className="modal-detail-value">${badgeTotal.toLocaleString()}</span>
          </div>
          <div className="modal-detail-row modal-total-row">
            <span className="modal-detail-label">Total Spend:</span>
            <span className="modal-detail-value">${totalSpend.toLocaleString()}</span>
          </div>
          <div className="modal-disclaimer">
            sometimes the data may not be accurate
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandModal;

