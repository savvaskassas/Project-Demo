import React from 'react';
import './Header.css';

const Header = ({ user, onLogout }) => {
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
        
        {user && (
          <div className="header-right">
            <div className="user-info">
              <div className="user-details">
                <span className="user-name">👤 {user.name}</span>
                <span className="user-role">{user.role === 'admin' ? 'Διαχειριστής' : 'Χρήστης'}</span>
              </div>
              <button className="logout-btn" onClick={onLogout}>
                🚪 Αποσύνδεση
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
