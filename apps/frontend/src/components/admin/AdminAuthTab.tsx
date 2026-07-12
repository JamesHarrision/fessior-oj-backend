import React, { useEffect, useState } from 'react';
import { Shield, Key, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export const AdminAuthTab: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAuthInfo = async () => {
    setLoading(true);
    try {
      const profileRes = await api.getMe();
      if (profileRes.success) setProfile(profileRes.data);

      const sessionRes = await api.getSessions();
      if (sessionRes.success) setSessions(sessionRes.data?.sessions || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthInfo();
  }, []);

  const handleRevokeSession = async (sid: string) => {
    if (!window.confirm('Hủy bỏ phiên làm việc này?')) return;
    try {
      const res = await api.revokeSession(sid);
      if (res.success) {
        setSessions(prev => prev.filter(s => s.id !== sid));
        alert('Đã hủy phiên làm việc.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy phiên');
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Hủy bỏ tất cả phiên làm việc khác?')) return;
    try {
      const res = await api.revokeAllSessions();
      if (res.success) {
        alert('Đã hủy tất cả các phiên khác.');
        fetchAuthInfo();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy toàn bộ phiên');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setStatusMsg('Đổi mật khẩu thành công!');
        setNewPassword('');
        setCurrentPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  return (
    <div className="problems-tab-grid">
      {/* Left side: Profile and Password Change */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="prob-admin-card">
          <h3>Thông Tin Quản Trị Viên</h3>
          {profile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <div><strong>Tài khoản:</strong> {profile.username}</div>
              <div><strong>Email:</strong> {profile.email}</div>
              <div><strong>Vai trò:</strong> <span className="diff-pill diff-easy">{profile.role}</span></div>
              <div><strong>ELO hiện tại:</strong> {profile.elo_rating}</div>
            </div>
          ) : (
            <p>Đang tải thông tin cá nhân...</p>
          )}
        </div>

        <div className="prob-admin-card">
          <h3>Đổi Mật Khẩu Quản Trị</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="prob-form-group">
              <label><Key size={14} /> Mật khẩu hiện tại</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="prob-admin-input"
                required
              />
            </div>
            <div className="prob-form-group">
              <label><Key size={14} /> Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="prob-admin-input"
                required
              />
            </div>
            <button type="submit" className="btn-prob-primary">Cập nhật mật khẩu</button>
          </form>
          {statusMsg && <p style={{ color: '#34d399', fontSize: '0.85rem', marginTop: '8px' }}>{statusMsg}</p>}
          {errorMsg && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '8px' }}>{errorMsg}</p>}
        </div>
      </div>

      {/* Right side: Session List */}
      <div className="prob-admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
          <h3 style={{ borderBottom: 'none', paddingBottom: 0 }}>Danh Sách Phiên Đăng Nhập</h3>
          {sessions.length > 1 && (
            <button onClick={handleRevokeAll} className="btn-action-icon delete" title="Đăng xuất khỏi toàn bộ thiết bị khác">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="prob-list-scroll">
          {loading ? (
            <p>Đang tải...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: '#64748b' }}>Không tìm thấy phiên làm việc nào.</p>
          ) : (
            sessions.map((s, idx) => (
              <div key={s.id || idx} className="prob-item-row">
                <div className="prob-item-details">
                  <span className="prob-item-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={14} style={{ color: s.isCurrent ? '#34d399' : '#64748b' }} />
                    Session ID: {s.id?.slice(-8) || idx} {s.isCurrent && '(Hiện tại)'}
                  </span>
                  <div className="prob-item-meta">
                    <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                      IP: {s.ipAddress || '127.0.0.1'}
                    </span>
                    <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                      HĐH: {s.device || 'Windows Chrome'}
                    </span>
                  </div>
                </div>

                {!s.isCurrent && (
                  <button onClick={() => handleRevokeSession(s.id)} className="btn-action-icon delete" title="Thu hồi phiên">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

