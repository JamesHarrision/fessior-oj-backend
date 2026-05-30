import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { UserCheck, UserPlus, Users } from 'lucide-react';
import './SocialSidebar.css';

export const SocialSidebar: React.FC = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [message, setMessage] = useState('');

  const loadFriends = async () => {
    try {
      const res = await api.getFriends();
      if (res.success && res.data) {
        setFriends(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFriends();
    const interval = setInterval(loadFriends, 10000); // Poll friends every 10s
    return () => clearInterval(interval);
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendUsername.trim()) return;
    setMessage('');
    try {
      // Find receiver ID by username
      const res = await api.sendFriendRequest(newFriendUsername);
      if (res.success) {
        setMessage('Đã gửi yêu cầu kết bạn!');
        setNewFriendUsername('');
      }
    } catch (err: any) {
      setMessage(err.message || 'Không tìm thấy người chơi này.');
    }
  };

  const handleAcceptRequest = async (senderId: string) => {
    try {
      const res = await api.respondFriendRequest(senderId, 'ACCEPT');
      if (res.success) {
        loadFriends();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="social-sidebar glass-card">
      <div className="social-header">
        <Users size={18} className="purple-glow-icon" />
        <h3>Bạn bè trực tuyến</h3>
      </div>

      <form onSubmit={handleSendRequest} className="add-friend-form">
        <input
          type="text"
          value={newFriendUsername}
          onChange={(e) => setNewFriendUsername(e.target.value)}
          placeholder="Tên bạn bè..."
          className="friend-input"
        />
        <button type="submit" className="add-friend-btn">
          <UserPlus size={16} />
        </button>
      </form>
      {message && <p className="friend-msg">{message}</p>}

      <div className="friend-list">
        {friends.length === 0 ? (
          <p className="no-friends">Chưa có bạn bè nào.</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <img
                src={friend.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.username}`}
                alt="avatar"
                className="friend-avatar"
              />
              <div className="friend-info">
                <span className="friend-name">{friend.username}</span>
                <span className="friend-elo">{friend.elo_rating} ELO</span>
              </div>
              <div className={`status-dot ${friend.is_online ? 'online' : 'offline'}`} />

              {friend.isPending && (
                <button
                  onClick={() => handleAcceptRequest(friend.id)}
                  className="accept-friend-btn"
                  title="Chấp nhận kết bạn"
                >
                  <UserCheck size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
