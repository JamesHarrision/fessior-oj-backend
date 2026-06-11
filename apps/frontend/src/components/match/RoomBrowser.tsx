import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Users, LogIn } from 'lucide-react';
import './RoomBrowser.css';

interface RoomBrowserProps {
  onJoinRoom: (roomData: any) => void;
}

export const RoomBrowser: React.FC<RoomBrowserProps> = ({ onJoinRoom }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [createDifficulty, setCreateDifficulty] = useState('EASY');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await api.getActiveRooms();
      if (res.success && res.data) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.createRoom({ difficulty: createDifficulty });
      if (res.success && res.data) {
        setMessage('Tạo phòng thành công!');
        onJoinRoom(res.data);
      }
    } catch (err: any) {
      setMessage(err.message || 'Lỗi khi tạo phòng.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await api.joinRoom({ roomCode: roomCodeInput });
      if (res.success && res.data) {
        onJoinRoom(res.data);
      }
    } catch (err: any) {
      setMessage(err.message || 'Không thể tham gia phòng này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-browser glass-card">
      <div className="browser-header">
        <Users size={20} className="glow-icon-blue" />
        <h3>Phòng đấu tùy chọn</h3>
      </div>

      <div className="browser-controls">
        <form onSubmit={handleJoinByCode} className="join-form">
          <input
            type="text"
            placeholder="Nhập mã phòng..."
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
            className="room-input"
          />
          <button type="submit" className="join-btn" disabled={loading}>
            <LogIn size={16} /> Tham gia
          </button>
        </form>

        <div className="create-section">
          <select
            value={createDifficulty}
            onChange={(e) => setCreateDifficulty(e.target.value)}
            className="difficulty-select"
          >
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Khó</option>
          </select>
          <button onClick={handleCreateRoom} className="create-room-btn" disabled={loading}>
            <Plus size={16} /> Tạo phòng
          </button>
        </div>
      </div>

      {message && <p className="browser-msg">{message}</p>}

      <div className="rooms-grid">
        {rooms.length === 0 ? (
          <p className="no-rooms">Hiện không có phòng đấu nào đang chờ.</p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-meta">
                <span className="room-code">{room.code}</span>
                <span className={`difficulty-badge ${room.difficulty.toLowerCase()}`}>
                  {room.difficulty}
                </span>
              </div>
              <div className="room-players">
                <span>Chủ phòng: {room.hostName}</span>
                <span>{room.playersCount}/2 người chơi</span>
              </div>
              <button onClick={() => onJoinRoom(room)} className="enter-room-btn">
                Vào phòng
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
