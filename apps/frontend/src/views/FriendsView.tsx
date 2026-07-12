import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { UsersRound, UserPlus, UserCheck, UserMinus, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FriendsView: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [newsfeed, setNewsfeed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'newsfeed'>('friends');
  const [addUsername, setAddUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const friendsRes = await api.getFriends();
      const reqRes = await api.getPendingRequests();
      const newsRes = await api.getNews();
      if (friendsRes.success) setFriends(friendsRes.data);
      if (reqRes.success) setRequests(reqRes.data);
      if (newsRes.success && newsRes.data) setNewsfeed(newsRes.data.items || newsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim()) return;
    if (addUsername === user?.username) {
      setMessage('Không thể tự kết bạn với chính mình!');
      return;
    }
    setMessage('');
    try {
      const res = await api.sendFriendRequest(addUsername);
      if (res.success) {
        setMessage(`Đã gửi lời mời kết bạn đến ${addUsername}`);
        setAddUsername('');
        loadData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Lỗi khi gửi lời mời.');
    }
  };

  const handleRespond = async (userId: string, action: 'accept' | 'reject') => {
    setMessage('');
    try {
      let res;
      if (action === 'accept') res = await api.acceptFriendRequest(userId);
      else res = await api.declineFriendRequest(userId);
      
      if (res.success) {
        setMessage(action === 'accept' ? 'Đã chấp nhận kết bạn!' : 'Đã từ chối kết bạn.');
        loadData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Lỗi khi xử lý yêu cầu.');
    }
  };

  const handleRemove = async (friendId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy kết bạn?')) return;
    setMessage('');
    try {
      const res = await api.removeFriend(friendId);
      if (res.success) {
        setMessage('Đã hủy kết bạn.');
        loadData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Lỗi khi hủy kết bạn.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 lg:p-8">
      {/* Header */}
      <div className="bg-washi border border-charcoal p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-ink p-3 border border-charcoal">
            <UsersRound size={32} className="text-vermilion" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-linen uppercase tracking-wider">Cộng Đồng</h2>
            <p className="font-body text-sm text-stone mt-1">Kết bạn, xem hồ sơ và thi đấu cùng những người chơi khác</p>
          </div>
        </div>
      </div>

      {/* Tabs & Add Friend */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-charcoal pb-4">
        <div className="flex gap-4">
          <button
            className={`px-6 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'friends'
                ? 'text-vermilion border-vermilion'
                : 'text-stone border-transparent hover:text-linen hover:border-charcoal'
            }`}
            onClick={() => { setActiveTab('friends'); setMessage(''); }}
          >
            Bạn bè ({friends.length})
          </button>
          <button
            className={`px-6 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors border-b-2 relative ${
              activeTab === 'requests'
                ? 'text-vermilion border-vermilion'
                : 'text-stone border-transparent hover:text-linen hover:border-charcoal'
            }`}
            onClick={() => { setActiveTab('requests'); setMessage(''); }}
          >
            Lời mời 
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-vermilion text-linen text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {requests.length}
              </span>
            )}
          </button>
          <button
            className={`px-6 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'newsfeed'
                ? 'text-vermilion border-vermilion'
                : 'text-stone border-transparent hover:text-linen hover:border-charcoal'
            }`}
            onClick={() => { setActiveTab('newsfeed'); setMessage(''); }}
          >
            Tin Tức
          </button>
        </div>

        <form onSubmit={handleSendRequest} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Nhập tên người dùng..."
            value={addUsername}
            onChange={(e) => setAddUsername(e.target.value)}
            className="bg-ink border border-charcoal px-4 py-2 text-sm text-linen outline-none focus:border-vermilion transition-colors min-w-[200px]"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-vermilion text-linen px-4 py-2 font-display text-xs font-bold uppercase tracking-wider hover:bg-vermilion-hover transition-colors"
          >
            <UserPlus size={14} /> Thêm
          </button>
        </form>
      </div>

      {message && (
        <div className="bg-ink/50 border-l-4 border-vermilion p-4 text-linen font-body text-sm border-y border-r border-y-charcoal border-r-charcoal">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-charcoal border-t-vermilion" />
        </div>
      ) : (
        <div className={`grid ${activeTab === 'newsfeed' ? 'grid-cols-1 max-w-3xl mx-auto w-full' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
          {activeTab === 'friends' ? (
            friends.length === 0 ? (
              <div className="col-span-full bg-ink border border-charcoal border-dashed p-12 text-center">
                <p className="font-body text-stone text-sm">Bạn chưa có người bạn nào. Hãy kết bạn để cùng thi đấu nhé!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="bg-washi border border-charcoal p-5 flex items-center gap-4 hover:border-stone transition-colors group">
                  <img
                    src={friend.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.username}`}
                    alt="avatar"
                    className="w-12 h-12 bg-ink border border-charcoal group-hover:border-vermilion transition-colors"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-base font-bold text-linen group-hover:text-vermilion transition-colors">{friend.username}</h3>
                    <p className="font-body text-xs text-stone">ELO: {friend.elo_rating}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(friend.id)}
                    title="Hủy kết bạn"
                    className="text-stone hover:text-vermilion p-2 transition-colors"
                  >
                    <UserX size={18} />
                  </button>
                </div>
              ))
            )
          ) : activeTab === 'requests' ? (
            requests.length === 0 ? (
              <div className="col-span-full bg-ink border border-charcoal border-dashed p-12 text-center">
                <p className="font-body text-stone text-sm">Không có lời mời kết bạn nào đang chờ xử lý.</p>
              </div>
            ) : (
              requests.map((req) => {
                // req.requester holds the user info
                const user = req.requester;
                return (
                  <div key={req.id} className="bg-washi border border-charcoal p-5 flex flex-col gap-4 border-l-4 border-l-vermilion">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                        alt="avatar"
                        className="w-10 h-10 bg-ink border border-charcoal"
                      />
                      <div>
                        <h3 className="font-display text-base font-bold text-linen">{user.username}</h3>
                        <p className="font-body text-xs text-stone">ELO: {user.elo_rating}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleRespond(user.id, 'accept')}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-vermilion text-linen py-2 font-display text-[10px] font-bold uppercase tracking-wider hover:bg-vermilion-hover transition-colors"
                      >
                        <UserCheck size={14} /> Chấp nhận
                      </button>
                      <button
                        onClick={() => handleRespond(user.id, 'reject')}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-ink text-stone py-2 border border-charcoal font-display text-[10px] font-bold uppercase tracking-wider hover:border-stone hover:text-linen transition-colors"
                      >
                        <UserMinus size={14} /> Từ chối
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : activeTab === 'newsfeed' ? (
            <div className="flex flex-col gap-4">
              {newsfeed.length === 0 ? (
                <div className="bg-ink border border-charcoal border-dashed p-12 text-center">
                  <p className="font-body text-stone text-sm">Chưa có bản tin nào.</p>
                </div>
              ) : (
                newsfeed.map((news) => (
                  <div key={news.id} className="bg-washi border border-charcoal p-6 border-l-4 border-l-vermilion">
                    <div className="flex items-center gap-3 mb-3">
                      {news.author?.role === 'ADMIN' ? (
                        <div className="bg-vermilion p-2 text-linen">
                          <UsersRound size={16} />
                        </div>
                      ) : (
                        <img src={news.author?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${news.author?.username}`} alt={news.author?.username} className="w-8 h-8 border border-charcoal bg-washi" />
                      )}
                      <div>
                        <h3 className="font-display font-bold text-linen text-sm">
                          {news.author?.role === 'ADMIN' ? 'Hệ Thống OCJ' : news.author?.username}
                        </h3>
                        <p className="font-body text-xs text-stone">{new Date(news.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    <h4 className="font-display text-lg font-bold text-linen mb-2">{news.title}</h4>
                    <p className="font-body text-sm text-stone whitespace-pre-wrap">{news.content}</p>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
