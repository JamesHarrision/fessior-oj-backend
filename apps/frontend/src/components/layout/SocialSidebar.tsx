import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { UserCheck, UserPlus, Users, Trash2, X } from 'lucide-react';

export const SocialSidebar: React.FC = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'requests'>('list');

  const loadSocialData = async () => {
    try {
      const friendsRes = await api.getFriends();
      if (friendsRes.success && friendsRes.data) {
        setFriends(friendsRes.data.items || []);
      }
      const requestsRes = await api.getPendingRequests();
      if (requestsRes.success && requestsRes.data) {
        setRequests(requestsRes.data.incoming || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSocialData();
    const interval = setInterval(loadSocialData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendUsername.trim()) return;
    setMessage('');
    try {
      const res = await api.sendFriendRequest(newFriendUsername);
      if (res.success) {
        setMessage('Đã gửi yêu cầu kết bạn!');
        setNewFriendUsername('');
        loadSocialData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Không gửi được yêu cầu.');
    }
  };

  const handleAccept = async (senderId: string) => {
    try {
      const res = await api.acceptFriendRequest(senderId);
      if (res.success) loadSocialData();
    } catch (err) { console.error(err); }
  };

  const handleDecline = async (senderId: string) => {
    try {
      const res = await api.declineFriendRequest(senderId);
      if (res.success) loadSocialData();
    } catch (err) { console.error(err); }
  };

  const handleRemove = async (friendId: string) => {
    if (!window.confirm('Xóa bạn bè này khỏi danh sách?')) return;
    try {
      const res = await api.removeFriend(friendId);
      if (res.success) loadSocialData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="w-[280px] min-h-[400px] bg-washi border border-charcoal p-4 flex flex-col gap-4">
      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-charcoal pb-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer
            ${activeTab === 'list'
              ? 'text-linen bg-charcoal/40'
              : 'text-stone hover:text-linen hover:bg-charcoal/20'
            }
          `}
        >
          <Users size={14} />
          Bạn bè ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer
            ${activeTab === 'requests'
              ? 'text-linen bg-charcoal/40'
              : 'text-stone hover:text-linen hover:bg-charcoal/20'
            }
          `}
        >
          Yêu cầu ({requests.length})
        </button>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* ── Add Friend ── */}
          <form onSubmit={handleSendRequest} className="flex gap-2">
            <input
              type="text"
              value={newFriendUsername}
              onChange={(e) => setNewFriendUsername(e.target.value)}
              placeholder="Nhập username kết bạn..."
              className="flex-1 bg-ink border border-charcoal px-3 py-2 text-sm text-linen placeholder-stone outline-none focus:border-vermilion transition-colors"
            />
            <button
              type="submit"
              className="flex items-center justify-center px-3 py-2 bg-washi border border-charcoal text-stone hover:text-linen hover:border-stone transition-colors cursor-pointer"
            >
              <UserPlus size={16} />
            </button>
          </form>
          {message && (
            <p className="text-xs text-vermilion font-body">{message}</p>
          )}

          {/* ── Friends List ── */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
            {friends.length === 0 ? (
              <p className="text-xs text-stone text-center py-5">Chưa có bạn bè nào.</p>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="flex items-center gap-2.5 p-2 border border-transparent hover:border-charcoal hover:bg-ink/50 transition-colors">
                  <img
                    src={friend.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.username}`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-charcoal shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm font-semibold text-linen truncate">
                      {friend.username}
                    </div>
                    <div className="font-display text-[11px] text-stone">
                      {friend.elo_rating} ELO
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${friend.online ? 'bg-vermilion' : 'bg-charcoal'}`} />
                  <button
                    onClick={() => handleRemove(friend.id)}
                    className="p-1 text-stone hover:text-vermilion transition-colors cursor-pointer"
                    title="Hủy kết bạn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* ── Requests List ── */
        <div className="flex flex-col gap-2">
          {requests.length === 0 ? (
            <p className="text-xs text-stone text-center py-5">Không có lời mời kết bạn nào.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id || req.sender_id} className="flex justify-between items-center p-2.5 border border-charcoal bg-ink/30">
                <span className="font-body text-sm text-linen">
                  {req.sender?.username || 'User'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAccept(req.sender_id || req.sender?.id)}
                    className="p-1.5 text-vermilion hover:bg-vermilion/10 transition-colors cursor-pointer"
                    title="Chấp nhận"
                  >
                    <UserCheck size={14} />
                  </button>
                  <button
                    onClick={() => handleDecline(req.sender_id || req.sender?.id)}
                    className="p-1.5 text-stone hover:text-linen transition-colors cursor-pointer"
                    title="Từ chối"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SocialSidebar;
