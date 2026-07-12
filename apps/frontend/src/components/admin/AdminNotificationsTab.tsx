import React, { useEffect, useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { AdminCard, AdminHeader, AdminButton, AdminInput, AdminFormGroup, AdminSelect, AdminTextarea, AdminListRow, AdminBadge } from './ui/AdminUI';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left side: Create new Notification */}
      <AdminCard>
        <AdminHeader>Tạo Thông Báo Hệ Thống</AdminHeader>
        <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
          <AdminFormGroup label="Tiêu đề">
            <AdminInput
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Thông báo bảo trì, cập nhật..."
              required
            />
          </AdminFormGroup>

          <AdminFormGroup label="Nội dung">
            <AdminTextarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Nội dung chi tiết của thông báo..."
              rows={4}
              required
            />
          </AdminFormGroup>

          <div className="grid grid-cols-2 gap-4">
            <AdminFormGroup label="Loại thông báo">
              <AdminSelect
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="INFO">Thông tin (Info)</option>
                <option value="ALERT">Cảnh báo (Alert)</option>
                <option value="MATCH">Trận đấu (Match)</option>
              </AdminSelect>
            </AdminFormGroup>

            <AdminFormGroup label="ID Người Nhận (Tùy chọn)">
              <AdminInput
                type="text"
                value={targetUserId}
                onChange={e => setTargetUserId(e.target.value)}
                placeholder="User ID..."
              />
            </AdminFormGroup>
          </div>

          <AdminButton type="submit" className="mt-2">
            <Plus size={14} /> Gửi thông báo
          </AdminButton>
        </form>
      </AdminCard>

      {/* Right side: Notification Inbox */}
      <AdminCard>
        <div className="flex justify-between items-center border-b border-charcoal/50 pb-4 mb-4">
          <h3 className="font-display font-semibold text-linen text-lg m-0">Hộp Thư Thông Báo</h3>
          {notifications.some(n => !n.isRead && !n.read) && (
            <button 
              onClick={handleMarkAllRead} 
              className="text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              Đọc Tất Cả
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 max-h-[680px] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-stone text-sm">Đang tải thông báo...</p>
          ) : notifications.length === 0 ? (
            <p className="text-stone text-sm">Hộp thư của bạn hiện đang trống.</p>
          ) : (
            notifications.map((n, idx) => {
              const nId = n.id || n._id;
              const isUnread = !n.isRead && !n.read;
              return (
                <AdminListRow key={nId || idx} className={`items-start ${isUnread ? 'border-l-2 border-l-blue-500' : ''}`}>
                  <div className="flex flex-col gap-1.5 w-full">
                    <span className="font-semibold text-sm text-linen font-body flex items-center gap-2">
                      <Bell size={14} className={isUnread ? 'text-blue-500' : 'text-stone'} />
                      {n.title}
                    </span>
                    <p className="text-sm text-surface-300 leading-relaxed m-0 mb-1">
                      {n.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <AdminBadge color={n.type === 'ALERT' ? 'red' : n.type === 'MATCH' ? 'blue' : 'gray'}>
                        {n.type}
                      </AdminBadge>
                      <span className="text-[11px] text-stone">
                        {new Date(n.createdAt || n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <AdminButton variant="icon-delete" onClick={() => handleDelete(nId)} title="Xóa thông báo" className="self-start ml-2">
                    <Trash2 size={14} />
                  </AdminButton>
                </AdminListRow>
              );
            })
          )}
        </div>
      </AdminCard>
    </div>
  );
};

