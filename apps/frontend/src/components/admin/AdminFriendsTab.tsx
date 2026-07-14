import React, { useEffect, useState } from 'react';
import { UserCheck, UserX, UserPlus, Users } from 'lucide-react';
import { api } from '../../services/api';
import { AdminCard, AdminHeader, AdminButton, AdminInput, AdminFormGroup, AdminListRow, AdminBadge } from './ui/AdminUI';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left side: Send Friend Request and pending requests */}
      <div className="flex flex-col gap-6">
        <AdminCard>
          <AdminHeader>Gửi Yêu Cầu Kết Bạn (Simulate)</AdminHeader>
          <form onSubmit={handleSendRequest} className="flex flex-col gap-4 mt-2">
            <AdminFormGroup label="User ID người nhận">
              <AdminInput
                type="text"
                value={receiverId}
                onChange={e => setReceiverId(e.target.value)}
                placeholder="Nhập ID người chơi khác..."
                required
              />
            </AdminFormGroup>
            <AdminButton type="submit" className="mt-2">
              <UserPlus size={14} /> Gửi yêu cầu kết bạn
            </AdminButton>
          </form>
        </AdminCard>

        <AdminCard>
          <AdminHeader>Yêu Cầu Kết Bạn Đang Chờ</AdminHeader>
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-stone text-sm">Đang tải...</p>
            ) : pending.length === 0 ? (
              <p className="text-stone text-sm">Không có yêu cầu kết bạn nào đang chờ.</p>
            ) : (
              pending.map((p, idx) => {
                const pId = p.id || p._id || p.senderId || p.sender?.id;
                return (
                  <AdminListRow key={pId || idx}>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-sm text-linen font-body">
                        ID: {pId?.slice(-8) || p.sender?.username || 'User'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <AdminButton variant="icon-edit" onClick={() => handleAccept(pId)} title="Chấp nhận" className="!text-emerald-400 !bg-emerald-400/10 hover:!bg-emerald-400/20 border border-emerald-400/20">
                        <UserCheck size={14} />
                      </AdminButton>
                      <AdminButton variant="icon-delete" onClick={() => handleDecline(pId)} title="Từ chối">
                        <UserX size={14} />
                      </AdminButton>
                    </div>
                  </AdminListRow>
                );
              })
            )}
          </div>
        </AdminCard>
      </div>

      {/* Right side: Friends List */}
      <AdminCard>
        <AdminHeader>
          <Users size={16} className="text-blue-400" /> Danh Sách Bạn Bè ({friends.length})
        </AdminHeader>
        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-stone text-sm">Đang tải danh sách bạn bè...</p>
          ) : friends.length === 0 ? (
            <p className="text-stone text-sm">Bạn chưa có kết nối bạn bè nào.</p>
          ) : (
            friends.map((f, idx) => {
              const fId = f.id || f._id || f.friendId || f.friend?.id;
              return (
                <AdminListRow key={fId || idx}>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-sm text-linen font-body">
                      {f.friend?.username || f.username || `User: ${fId?.slice(-8)}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <AdminBadge>
                        ELO: {f.friend?.elo_rating || f.elo_rating || 1000}
                      </AdminBadge>
                    </div>
                  </div>

                  <AdminButton variant="icon-delete" onClick={() => handleRemove(fId)} title="Hủy kết bạn">
                    <UserX size={14} />
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

