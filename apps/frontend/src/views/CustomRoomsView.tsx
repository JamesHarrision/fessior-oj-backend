import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, Users, ArrowRight, X, LogOut, Play } from 'lucide-react';
import './CustomRoomsView.css';

interface CustomRoomsViewProps {
  onStartCustomMatch: (matchId: string, problemId: string) => void;
}

export const CustomRoomsView: React.FC<CustomRoomsViewProps> = ({ onStartCustomMatch }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [loading, setLoading] = useState(false);

  const fetchActiveRooms = () => {
    api.getActiveRooms().then(res => {
      if (res.success && res.data) setRooms(res.data);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchActiveRooms();
    const interval = setInterval(fetchActiveRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  // Setup room sockets
  useEffect(() => {
    if (!activeRoom) return;

    socketService.joinCustomRoom(activeRoom.room_code);

    socketService.onConfigUpdated((updatedRoom) => {
      setActiveRoom(updatedRoom);
    });

    socketService.onPlayerLeft(({ userId }) => {
      setActiveRoom((prev: any) => {
        if (!prev) return null;
        return { ...prev, opponent_id: null, opponent: null };
      });
      fetchActiveRooms();
    });

    socketService.onRoomDeleted(() => {
      alert('Chủ phòng đã giải tán phòng.');
      setActiveRoom(null);
      fetchActiveRooms();
    });

    socketService.onMatchStarted(({ matchId, problemId }) => {
      socketService.leaveCustomRoom(activeRoom.room_code);
      onStartCustomMatch(matchId, problemId);
    });

    return () => {
      if (activeRoom) socketService.leaveCustomRoom(activeRoom.room_code);
    };
  }, [activeRoom]);

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await api.createRoom({ difficulty });
      if (res.success && res.data) {
        setActiveRoom(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (codeToJoin?: string) => {
    const targetCode = codeToJoin || roomCodeInput;
    if (!targetCode) return;
    setLoading(true);
    try {
      const res = await api.joinRoom({ roomCode: targetCode });
      if (res.success && res.data) {
        // joinRoom returns { room, matchId }
        setActiveRoom(res.data.room);
        if (res.data.matchId) {
          onStartCustomMatch(res.data.matchId, res.data.room.problem_id || '');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Không thể vào phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!activeRoom) return;
    try {
      if (activeRoom.creator_id === user?.id) {
        await api.request(`/rooms/${activeRoom.id}`, { method: 'DELETE' });
      } else {
        await api.leaveRoom({ roomId: activeRoom.id });
      }
      setActiveRoom(null);
      fetchActiveRooms();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (activeRoom) {
    const isCreator = activeRoom.creator_id === user?.id;
    return (
      <div className="room-lobby-container glass-card">
        <div className="lobby-header">
          <h3>Phòng Đấu Tùy Chỉnh: <span className="room-code-badge">{activeRoom.room_code}</span></h3>
          <button onClick={handleLeaveRoom} className="btn-leave glass-button">
            <LogOut size={16} /> {isCreator ? 'Giải tán phòng' : 'Rời phòng'}
          </button>
        </div>

        <div className="lobby-players">
          <div className="player-box glass-card creator-box">
            <span className="player-badge">CHỦ PHÒNG</span>
            <h4>{activeRoom.creator?.username || user?.username}</h4>
            <span className="player-elo">ELO: {activeRoom.creator?.elo_rating || user?.elo_rating}</span>
          </div>

          <div className="versus-badge">VS</div>

          <div className="player-box glass-card opponent-box">
            {activeRoom.opponent_id ? (
              <>
                <span className="player-badge opponent">ĐỐI THỦ</span>
                <h4>{activeRoom.opponent?.username || 'Đang tải...'}</h4>
                <span className="player-elo">ELO: {activeRoom.opponent?.elo_rating}</span>
              </>
            ) : (
              <div className="waiting-placeholder">
                <div className="pulse-loader"></div>
                <p>Đang chờ đối thủ tham gia...</p>
              </div>
            )}
          </div>
        </div>

        <div className="lobby-config glass-card">
          <h4>Cấu hình trận đấu</h4>
          <p><strong>Độ khó đề bài:</strong> {activeRoom.difficulty || 'Mọi độ khó'}</p>
          <p><strong>Thời gian giới hạn:</strong> {activeRoom.time_limit || 2000} ms</p>
          {isCreator && activeRoom.opponent_id && (
            <button 
              onClick={() => handleJoinRoom(activeRoom.room_code)} 
              className="btn-start-match glass-button"
            >
              <Play size={18} /> Bắt đầu Duel!
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rooms-view-container">
      <div className="rooms-header glass-card">
        <div className="title-row">
          <Shield className="header-icon" size={24} />
          <h2>Đấu Trường Tùy Chỉnh (Custom Arena)</h2>
        </div>
        <p className="subtitle">Tạo phòng chơi riêng tư để so tài thuật toán trực tiếp cùng bạn bè.</p>
      </div>

      <div className="room-actions-grid">
        <div className="action-card glass-card">
          <h3>Tạo phòng đấu mới</h3>
          <div className="form-group">
            <label>Độ khó bài tập:</label>
            <select value={difficulty} onChange={(e: any) => setDifficulty(e.target.value)} className="glass-select">
              <option value="EASY">Dễ (Easy)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="HARD">Khó (Hard)</option>
            </select>
          </div>
          <button onClick={handleCreateRoom} disabled={loading} className="btn-action glass-button">
            <Plus size={18} /> {loading ? 'Đang tạo...' : 'Tạo phòng'}
          </button>
        </div>

        <div className="action-card glass-card">
          <h3>Tham gia bằng mã phòng</h3>
          <div className="form-group">
            <label>Nhập mã phòng 6 ký tự:</label>
            <input
              type="text"
              placeholder="Ví dụ: AB12CD"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              className="glass-input"
            />
          </div>
          <button onClick={() => handleJoinRoom()} disabled={loading || !roomCodeInput} className="btn-action glass-button">
            Tham gia <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="active-rooms-list glass-card">
        <div className="list-title">
          <Users size={18} />
          <h3>Phòng chơi đang mở</h3>
        </div>
        <div className="rooms-table-wrap">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Mã phòng</th>
                <th>Chủ phòng</th>
                <th>Độ khó</th>
                <th>Người chơi</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">Không có phòng chơi tùy chỉnh nào đang đợi. Hãy tự tạo một phòng!</td>
                </tr>
              ) : (
                rooms.map(r => (
                  <tr key={r.id}>
                    <td className="code-font bold">{r.room_code}</td>
                    <td>{r.creator?.username}</td>
                    <td><span className={`diff-pill diff-${r.difficulty?.toLowerCase() || 'easy'}`}>{r.difficulty || 'ANY'}</span></td>
                    <td>1 / 2</td>
                    <td>
                      <button onClick={() => handleJoinRoom(r.room_code)} className="btn-join-row glass-button">
                        Tham gia
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CustomRoomsView;
