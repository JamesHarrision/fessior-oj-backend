import React, { useEffect, useState } from 'react';
import { Bell, Flame, Settings, ChevronDown, Check, Trash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './Navbar.css';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await api.markNotificationsAsRead([id]);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await api.deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="logo-container" onClick={() => onViewChange('match')}>
          <span className="logo-text">QUEU</span>
          <span className="logo-badge">ARENA</span>
        </div>
      </div>
      <nav className="navbar-center">
        {[
          { id: 'match', label: 'Lobby' },
          { id: 'custom-rooms', label: 'Custom Arena' },
          { id: 'problems', label: 'Problems' },
          { id: 'contest', label: 'Contests' },
          { id: 'ranking', label: 'Rankings' },
          { id: 'shop', label: 'Shop' },
          { id: 'submissions', label: 'Submissions' },
          { id: 'settings', label: 'Tools' },
          { id: 'tester', label: 'API Tester' },
          ...(user?.role === 'ADMIN' ? [{ id: 'admin/problems', label: 'Admin Panel' }] : []),
        ].map((item) => (
          <button
            key={item.id}
            className={`nav-link ${currentView === item.id || (item.id === 'admin/problems' && currentView.startsWith('admin')) ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="navbar-right">
        <div className="notification-wrapper">
          <button
            className="icon-btn"
            aria-label="Notifications"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-dot"></span>}
          </button>

          {showDropdown && (
            <div className="notification-dropdown glass-card">
              <div className="notif-header">
                <span>Thông báo ({unreadCount})</span>
              </div>
              <div className="notif-body">
                {notifications.length === 0 ? (
                  <p className="no-notif">Không có thông báo nào.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`notif-item ${n.is_read ? 'read' : 'unread'}`}>
                      <div className="notif-content">
                        <p className="notif-text">{n.content || n.message}</p>
                        <span className="notif-time">{new Date(n.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="notif-actions">
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            className="notif-action-btn read-btn"
                            title="Đánh dấu đã đọc"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(n.id)}
                          className="notif-action-btn delete-btn"
                          title="Xóa thông báo"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="streak-container" title="Chuỗi thắng hiện tại">
          <Flame size={20} className="streak-icon" />
          <span className="streak-number">{user?.streak_count || 0}</span>
        </div>

        <button 
          className="icon-btn" 
          aria-label="Settings"
          onClick={() => onViewChange('settings')}
        >
          <Settings size={20} />
        </button>

        <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'Guest'}`}
            alt="User Avatar"
            className="avatar-img"
          />
          <ChevronDown size={14} className="profile-arrow" />
          {showProfileMenu && (
            <div className="profile-menu glass-card">
              <div className="menu-header">
                <span className="menu-username">{user?.username}</span>
                <span className="menu-elo">{user?.elo_rating} ELO</span>
              </div>
              <button onClick={logout} className="menu-logout-btn">
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
