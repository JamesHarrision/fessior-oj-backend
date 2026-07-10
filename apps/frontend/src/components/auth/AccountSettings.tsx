import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Key, Smartphone, Globe, Trash2, LogOut, RefreshCw, User, Mail, Award, Flame, Coins, ShieldAlert } from 'lucide-react';
import './AccountSettings.css';

export const AccountSettings: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  
  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [sessionSuccess, setSessionSuccess] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [revokeAllLoading, setRevokeAllLoading] = useState(false);

  // Profile Refresh State
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    setSessionError('');
    try {
      const res = await api.getSessions();
      if (res.success && res.data) {
        setSessions(res.data.sessions || []);
      }
    } catch (err: any) {
      setSessionError(err.message || 'Không thể tải danh sách phiên hoạt động.');
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRefreshProfile = async () => {
    setProfileLoading(true);
    try {
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPassSuccess('Đổi mật khẩu thành công! Tất cả các phiên khác đã được đăng xuất.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Refresh sessions list
        fetchSessions();
      }
    } catch (err: any) {
      setPassError(err.message || 'Lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setActionLoadingId(sessionId);
    setSessionError('');
    setSessionSuccess('');
    try {
      const res = await api.revokeSession(sessionId);
      if (res.success) {
        setSessionSuccess('Đã hủy phiên hoạt động thành công.');
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (err: any) {
      setSessionError(err.message || 'Không thể hủy phiên hoạt động này.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?')) {
      return;
    }
    setRevokeAllLoading(true);
    setSessionError('');
    setSessionSuccess('');
    try {
      const res = await api.revokeAllSessions();
      if (res.success) {
        setSessionSuccess('Đã hủy toàn bộ các phiên hoạt động khác thành công.');
        fetchSessions();
      }
    } catch (err: any) {
      setSessionError(err.message || 'Không thể hủy toàn bộ các phiên khác.');
    } finally {
      setRevokeAllLoading(false);
    }
  };

  // Helper to parse User Agent into friendly text
  const getFriendlyUserAgent = (ua: string) => {
    if (!ua) return 'Thiết bị không xác định';
    const uaLower = ua.toLowerCase();
    
    let os = 'OS không xác định';
    if (uaLower.includes('windows')) os = 'Windows';
    else if (uaLower.includes('macintosh') || uaLower.includes('mac os')) os = 'macOS';
    else if (uaLower.includes('linux')) os = 'Linux';
    else if (uaLower.includes('android')) os = 'Android';
    else if (uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS';

    let browser = 'Trình duyệt không xác định';
    if (uaLower.includes('chrome') && !uaLower.includes('edg') && !uaLower.includes('opr')) browser = 'Chrome';
    else if (uaLower.includes('firefox')) browser = 'Firefox';
    else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'Safari';
    else if (uaLower.includes('edg')) browser = 'Edge';
    else if (uaLower.includes('opera') || uaLower.includes('opr')) browser = 'Opera';

    return `${browser} trên ${os}`;
  };

  return (
    <div className="account-settings-container">
      {/* 1. Profile Overview Section */}
      <div className="settings-section-card glass-panel animate-fade-in">
        <div className="section-card-header">
          <div className="header-icon-wrapper blue">
            <User size={20} />
          </div>
          <div className="header-text">
            <h3>Thông Tin Tài Khoản</h3>
            <p>Thông tin cá nhân và xếp hạng hiện tại</p>
          </div>
          <button 
            onClick={handleRefreshProfile} 
            disabled={profileLoading} 
            className="btn-refresh-profile"
            title="Làm mới thông tin"
          >
            <RefreshCw size={14} className={profileLoading ? 'spin' : ''} />
          </button>
        </div>

        {user && (
          <div className="profile-grid">
            <div className="profile-detail-item">
              <span className="detail-label"><User size={14} /> Tên người dùng</span>
              <span className="detail-value">{user.username}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label"><Mail size={14} /> Email đăng ký</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label"><Award size={14} /> Điểm số ELO</span>
              <span className="detail-value elo-highlight">{user.elo_rating} ELO</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label"><Flame size={14} /> Chuỗi ngày giải bài</span>
              <span className="detail-value streak-highlight">
                {user.streak_count} ngày (Kỷ lục: {user.max_streak})
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label"><Coins size={14} /> Vai trò</span>
              <span className={`detail-value role-badge ${user.role.toLowerCase()}`}>
                {user.role === 'ADMIN' ? '🛡️ Quản trị viên' : 'Lập trình viên'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Change Password Section */}
      <div className="settings-section-card glass-panel animate-fade-in delay-1">
        <div className="section-card-header">
          <div className="header-icon-wrapper orange">
            <Key size={20} />
          </div>
          <div className="header-text">
            <h3>Đổi Mật Khẩu</h3>
            <p>Cập nhật mật khẩu để bảo vệ tài khoản</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="settings-form">
          <div className="settings-form-row">
            <div className="settings-input-group">
              <label>Mật khẩu hiện tại</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="settings-field-input"
                required
              />
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-input-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="settings-field-input"
                required
              />
            </div>

            <div className="settings-input-group">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="settings-field-input"
                required
              />
            </div>
          </div>

          {passError && <div className="alert-message error-msg">{passError}</div>}
          {passSuccess && <div className="alert-message success-msg">{passSuccess}</div>}

          <button type="submit" disabled={passLoading} className="btn-action-primary blue">
            {passLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>

      {/* 3. Session Manager Section */}
      <div className="settings-section-card glass-panel animate-fade-in delay-2">
        <div className="section-card-header">
          <div className="header-icon-wrapper purple">
            <Smartphone size={20} />
          </div>
          <div className="header-text">
            <h3>Quản Lý Phiên Đăng Nhập</h3>
            <p>Kiểm soát các thiết bị và trình duyệt đang kết nối tài khoản của bạn</p>
          </div>
          {sessions.length > 1 && (
            <button 
              onClick={handleRevokeAllSessions} 
              disabled={revokeAllLoading}
              className="btn-revoke-all-sessions"
            >
              <ShieldAlert size={14} />
              {revokeAllLoading ? 'Đang xử lý...' : 'Đăng xuất tất cả thiết bị khác'}
            </button>
          )}
        </div>

        {sessionError && <div className="alert-message error-msg">{sessionError}</div>}
        {sessionSuccess && <div className="alert-message success-msg">{sessionSuccess}</div>}

        {sessionsLoading ? (
          <div className="loading-sessions-spinner">
            <RefreshCw size={24} className="spin text-blue" />
            <p>Đang quét các phiên đăng nhập hoạt động...</p>
          </div>
        ) : sessions.length === 0 ? (
          <p className="no-sessions-txt">Không tìm thấy thông tin phiên hoạt động.</p>
        ) : (
          <div className="sessions-list">
            <div className="sessions-warning-tip">
              <ShieldAlert size={14} className="text-yellow" />
              <span>Nếu bạn hủy phiên hoạt động của thiết bị hiện tại, bạn sẽ đăng xuất ngay lập tức.</span>
            </div>

            {sessions.map((session) => {
              const friendlyUA = getFriendlyUserAgent(session.user_agent);
              const isMobile = session.user_agent?.toLowerCase().includes('mobile') || 
                               session.user_agent?.toLowerCase().includes('android') ||
                               session.user_agent?.toLowerCase().includes('iphone');
              const dateCreated = new Date(session.created_at).toLocaleString();
              const dateLastUsed = session.last_used_at ? new Date(session.last_used_at).toLocaleString() : 'N/A';

              return (
                <div key={session.id} className="session-item-row">
                  <div className="session-device-icon">
                    {isMobile ? <Smartphone size={22} className="text-blue" /> : <Globe size={22} className="text-teal" />}
                  </div>
                  
                  <div className="session-info-details">
                    <h4 className="device-name">{friendlyUA}</h4>
                    <div className="session-meta-row">
                      <span className="meta-badge ip-badge">IP: {session.ip_address || '127.0.0.1'}</span>
                      <span className="meta-badge date-badge">Đăng nhập: {dateCreated}</span>
                      <span className="meta-badge activity-badge">Hoạt động cuối: {dateLastUsed}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={actionLoadingId === session.id}
                    className="btn-revoke-single-session"
                    title="Đăng xuất thiết bị này"
                  >
                    {actionLoadingId === session.id ? (
                      <RefreshCw size={14} className="spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Global Logout Section */}
      <div className="settings-section-card glass-panel logout-section-card animate-fade-in delay-3">
        <div className="logout-card-content">
          <div className="logout-text">
            <h3>Đăng Xuất Khỏi Hệ Thống</h3>
            <p>Kết thúc phiên làm việc hiện tại và bảo mật thiết bị</p>
          </div>
          <button onClick={logout} className="btn-global-logout">
            <LogOut size={16} /> Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};
