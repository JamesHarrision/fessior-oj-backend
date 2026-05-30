import React from 'react';
import { Bell, Flame, Settings, ChevronDown } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="logo-container" onClick={() => onViewChange('match')}>
          <span className="logo-text">QUEU</span>
          <span className="logo-badge">CHATBOX</span>
        </div>
      </div>

      <nav className="navbar-center">
        {['Problems', 'Contests', 'Submissions', 'Ranking', 'About', 'Report'].map((item) => (
          <button
            key={item}
            className={`nav-link ${
              (currentView === 'editor' && item === 'Problems') || 
              (currentView === 'match' && item === 'Contests')
                ? 'active'
                : ''
            }`}
            onClick={() => onViewChange(item === 'Problems' ? 'editor' : 'match')}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="navbar-right">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="streak-container">
          <Flame size={20} className="streak-icon" />
          <span className="streak-number">67</span>
        </div>

        <button className="icon-btn" aria-label="Settings">
          <Settings size={20} />
        </button>

        <div className="user-profile">
          <img
            src="https://api.dicebear.com/7.x/adventurer/svg?seed=AnhKhoi"
            alt="User Avatar"
            className="avatar-img"
          />
          <ChevronDown size={14} className="profile-arrow" />
        </div>
      </div>
    </header>
  );
};
