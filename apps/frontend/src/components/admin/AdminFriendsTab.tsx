import React, { useEffect, useState } from 'react';
import { UserCheck, UserX, UserPlus, Users } from 'lucide-react';
import { api } from '../../services/api';

export const AdminFriendsTab: React.FC = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Friend request target input state
  const [receiverId, setReceiverId] = useState('');

  const fetchFriendshipData = async () => {
    setLoading(true);
    try {
      const friendsRes = await api.getFriends();
      if (friendsRes.success) {
        setFriends(friendsRes.data || []);
      }

      const pendingRes = await api.getPendingRequests();
      if (pendingRes.success) {
        setPending(pendingRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendshipData();
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId.trim()) return;
    try {
      const res = await api.sendFriendRequest(receiverId.trim());
      if (res.success) {
        alert('Đã gửi yêu cầu kết bạn!');
        setReceiverId('');
        fetchFriendshipData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi yêu cầu kết bạn');
    }
  };

  const handleAccept = async (senderId: string) => {
    try {
      const res = await api.acceptFriendRequest(senderId);
      if (res.success) {
        alert('Đã đồng ý kết bạn!');
        fetchFriendshipData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi chấp nhận kết bạn');
    }
  };

  const handleDecline = async (senderId: string) => {
    try {
      const res = await api.declineFriendRequest(senderId);
      if (res.success) {
        alert('Đã từ chối yêu cầu kết bạn.');
        fetchFriendshipData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối kết bạn');
    }
  };

  const handleRemove = async (friendId: string) => {
    if (!window.confirm('Hủy kết bạn với người dùng này?')) return;
    try {
      const res = await api.removeFriend(friendId);
      if (res.success) {
        setFriends(prev => prev.filter(f => f.id !== friendId && f.userId !== friendId && f._id !== friendId));
        alert('Đã xóa quan hệ bạn bè.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy kết bạn');
    }
  };

  return (
    <div className="problems-tab-grid">
      {/* Left side: Send Friend Request and pending requests */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="prob-admin-card">
          <h3>Gửi Yêu Cầu Kết Bạn (Simulate)</h3>
          <form onSubmit={handleSendRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="prob-form-group">
              <label>User ID người nhận</label>
              <input
                type="text"
                value={receiverId}
                onChange={e => setReceiverId(e.target.value)}
                placeholder="Nhập ID người chơi khác..."
                className="prob-admin-input"
                required
              />
            </div>
            <button type="submit" className="btn-prob-primary">
              <UserPlus size={14} /> Gửi yêu cầu kết bạn
            </button>
          </form>
        </div>

        <div className="prob-admin-card">
          <h3>Yêu Cầu Kết Bạn Đang Chờ</h3>
          <div className="prob-list-scroll" style={{ maxHeight: '300px' }}>
            {loading ? (
              <p>Đang tải...</p>
            ) : pending.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Không có yêu cầu kết bạn nào đang chờ.</p>
            ) : (
              pending.map((p, idx) => {
                const pId = p.id || p._id || p.senderId || p.sender?.id;
                return (
                  <div key={pId || idx} className="prob-item-row">
                    <div className="prob-item-details">
                      <span className="prob-item-title" style={{ fontSize: '0.85rem' }}>
                        ID: {pId?.slice(-8) || p.sender?.username || 'User'}
                      </span>
                    </div>
                    <div className="action-btn-container">
                      <button onClick={() => handleAccept(pId)} className="btn-action-icon edit" title="Chấp nhận">
                        <UserCheck size={12} style={{ color: '#34d399' }} />
                      </button>
                      <button onClick={() => handleDecline(pId)} className="btn-action-icon delete" title="Từ chối">
                        <UserX size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right side: Friends List */}
      <div className="prob-admin-card">
        <h3><Users size={16} style={{ color: '#60a5fa', marginRight: '6px', verticalAlign: 'middle' }} /> Danh Sách Bạn Bè ({friends.length})</h3>
        <div className="prob-list-scroll">
          {loading ? (
            <p>Đang tải danh sách bạn bè...</p>
          ) : friends.length === 0 ? (
            <p style={{ color: '#64748b' }}>Bạn chưa có kết nối bạn bè nào.</p>
          ) : (
            friends.map((f, idx) => {
              const fId = f.id || f._id || f.friendId || f.friend?.id;
              return (
                <div key={fId || idx} className="prob-item-row">
                  <div className="prob-item-details">
                    <span className="prob-item-title">
                      {f.friend?.username || f.username || `User: ${fId?.slice(-8)}`}
                    </span>
                    <div className="prob-item-meta">
                      <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                        ELO: {f.friend?.elo_rating || f.elo_rating || 1000}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleRemove(fId)} className="btn-action-icon delete" title="Hủy kết bạn">
                    <UserX size={14} />
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


