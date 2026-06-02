import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, ArrowRight } from 'lucide-react';
import { ActiveRoomsTable } from '../components/rooms/ActiveRoomsTable';
import { RoomLobbyPanel } from '../components/rooms/RoomLobbyPanel';
import type { ICustomRoom } from '@ocj/types';
import './CustomRoomsView.css';

interface CustomRoomsViewProps {
  onStartCustomMatch: (matchId: string, problemId: string) => void;
}

export const CustomRoomsView: React.FC<CustomRoomsViewProps> = ({ onStartCustomMatch }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ICustomRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ICustomRoom | null>(null);
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

    socketService.onPlayerLeft(() => {
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
        await api.deleteRoom(activeRoom.id);
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
    return (
      <RoomLobbyPanel
        activeRoom={activeRoom}
        user={user}
        onLeaveRoom={handleLeaveRoom}
        onStartMatch={handleJoinRoom}
      />
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

      <ActiveRoomsTable rooms={rooms} onJoinRoom={handleJoinRoom} />
    </div>
  );
};

export default CustomRoomsView;
