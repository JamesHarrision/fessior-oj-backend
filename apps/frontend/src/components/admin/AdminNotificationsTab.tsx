import React, { useEffect, useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export const AdminNotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New Notification form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('INFO');
  const [targetUserId, setTargetUserId] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createNotification({
        title,
        content,
        type,
        userId: targetUserId.trim() ? targetUserId.trim() : undefined
      });
      if (res.success) {
        alert('Tạo thông báo thành công!');
        setTitle('');
        setContent('');
        setTargetUserId('');
        fetchNotifications();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi thông báo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa thông báo này?')) return;
    try {
      const res = await api.deleteNotification(id);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa thông báo');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead && !n.read).map(n => n.id || n._id);
    if (unreadIds.length === 0) return;
    try {
      const res = await api.markNotificationsAsRead();
      if (res.success) {
        fetchNotifications();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đánh dấu đã đọc');
    }
  };

  return (
    <div className="problems-tab-grid">
      {/* Left side: Create new Notification */}
      <form onSubmit={handleCreate} className="prob-admin-card">
        <h3>Tạo Thông Báo Hệ Thống</h3>
        <div className="prob-form-group">
          <label>Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="prob-admin-input"
            placeholder="Thông báo bảo trì, cập nhật..."
            required
          />
        </div>

        <div className="prob-form-group">
          <label>Nội dung</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="prob-admin-textarea"
            placeholder="Nội dung chi tiết của thông báo..."
            rows={4}
            required
          />
        </div>

        <div className="prob-form-grid-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="prob-form-group">
            <label>Loại thông báo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="prob-admin-select"
            >
              <option value="INFO">Thông tin (Info)</option>
              <option value="ALERT">Cảnh báo (Alert)</option>
              <option value="MATCH">Trận đấu (Match)</option>
            </select>
          </div>

          <div className="prob-form-group">
            <label>ID Người Nhận (Để trống nếu gửi cho tất cả)</label>
            <input
              type="text"
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              placeholder="Tùy chọn: User ID..."
              className="prob-admin-input"
            />
          </div>
        </div>

        <button type="submit" className="btn-prob-primary">
          <Plus size={14} /> Gửi thông báo
        </button>
      </form>

      {/* Right side: Notification Inbox */}
      <div className="prob-admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
          <h3 style={{ borderBottom: 'none', paddingBottom: 0 }}>Hộp Thư Thông Báo</h3>
          {notifications.some(n => !n.isRead && !n.read) && (
            <button onClick={handleMarkAllRead} className="prob-tag-pill" style={{ cursor: 'pointer', borderColor: '#34d399', color: '#34d399', fontSize: '0.7rem' }}>
              Đọc Tất Cả
            </button>
          )}
        </div>

        <div className="prob-list-scroll">
          {loading ? (
            <p>Đang tải thông báo...</p>
          ) : notifications.length === 0 ? (
            <p style={{ color: '#64748b' }}>Hộp thư của bạn hiện đang trống.</p>
          ) : (
            notifications.map((n, idx) => {
              const nId = n.id || n._id;
              const isUnread = !n.isRead && !n.read;
              return (
                <div key={nId || idx} className="prob-item-row" style={{ borderLeft: isUnread ? '3px solid #3b82f6' : 'none' }}>
                  <div className="prob-item-details">
                    <span className="prob-item-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bell size={12} style={{ color: isUnread ? '#3b82f6' : '#64748b' }} />
                      {n.title}
                    </span>
                    <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {n.content}
                    </p>
                    <div className="prob-item-meta">
                      <span className="prob-tag-pill" style={{ fontSize: '0.68rem' }}>
                        {n.type}
                      </span>
                      <span className="prob-tag-pill" style={{ fontSize: '0.68rem' }}>
                        {new Date(n.createdAt || n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleDelete(nId)} className="btn-action-icon delete" title="Xóa thông báo">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};


