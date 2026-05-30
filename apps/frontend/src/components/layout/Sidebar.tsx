import React from 'react';
import { Home, GitFork, Map, Trophy, BookOpen, Wrench, Sparkles } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const items = [
    { id: 'match', icon: Home, label: 'Lobby' },
    { id: 'contest', icon: GitFork, label: 'Contests' },
    { id: 'ranking', icon: Map, label: 'Map' },
    { id: 'shop', icon: Trophy, label: 'Shop' },
    { id: 'editor', icon: BookOpen, label: 'Problems' },
    { id: 'ai', icon: Sparkles, label: 'AI Assistant' },
    { id: 'settings', icon: Wrench, label: 'Tools' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-icons">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id || (currentView === 'editor' && item.id === 'editor');
          return (
            <button
              key={item.id}
              className={`sidebar-icon-btn ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
              title={item.label}
            >
              <IconComponent size={22} />
              {isActive && <span className="active-indicator" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
