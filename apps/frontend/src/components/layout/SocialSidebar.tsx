import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { UserCheck, UserPlus, Users, Trash2, X } from 'lucide-react';
import './SocialSidebar.css';

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
      if (res.success) {
        loadSocialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (senderId: string) => {
    try {
      const res = await api.declineFriendRequest(senderId);
      if (res.success) {
        loadSocialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (friendId: string) => {
    if (!window.confirm('Xóa bạn bè này khỏi danh sách?')) return;
    try {
      const res = await api.removeFriend(friendId);
      if (res.success) {
        loadSocialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="social-sidebar glass-card">
      <div className="social-tabs">
        <button 
          onClick={() => setActiveTab('list')} 
          className={`social-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
        >
          <Users size={16} /> Bạn bè ({friends.length})
        </button>
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`social-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
        >
          Yêu cầu ({requests.length})
        </button>
      </div>

      {activeTab === 'list' ? (
        <>
          <form onSubmit={handleSendRequest} className="add-friend-form">
            <input
              type="text"
              value={newFriendUsername}
              onChange={(e) => setNewFriendUsername(e.target.value)}
              placeholder="Nhập username kết bạn..."
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
                  <div className={`status-dot ${friend.online ? 'online' : 'offline'}`} />
                  <button
                    onClick={() => handleRemove(friend.id)}
                    className="btn-remove-friend"
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
        <div className="requests-list">
          {requests.length === 0 ? (
            <p className="no-requests">Không có lời mời kết bạn nào.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id || req.sender_id} className="request-item">
                <span className="request-name">{req.sender?.username || 'User'}</span>
                <div className="request-actions">
                  <button
                    onClick={() => handleAccept(req.sender_id || req.sender?.id)}
                    className="btn-accept"
                    title="Chấp nhận"
                  >
                    <UserCheck size={14} />
                  </button>
                  <button
                    onClick={() => handleDecline(req.sender_id || req.sender?.id)}
                    className="btn-decline"
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
