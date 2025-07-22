import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="company-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-container">
            <div className="logo-circle">
              <span className="logo-text-top">ΥΑΛΟΔΥΝΑΜΙΚΗ</span>
              <span className="logo-text-bottom">ΡΟΔΟΥ</span>
              <span className="logo-k">K</span>
            </div>
          </div>
          <div className="company-info">
            <h1 className="company-name">ΥΑΛΟΔΥΝΑΜΙΚΗ ΡΟΔΟΥ</h1>
            <p className="company-tagline">Επαγγελματικές Υπηρεσίες Υαλοπινάκων</p>
          </div>
        </div>
        <div className="header-right">
          <div className="system-title">
            <h2>Σύστημα Διαχείρισης Έργων</h2>
            <p>Δημιουργία και διαχείριση έργων</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
