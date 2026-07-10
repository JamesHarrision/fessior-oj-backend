import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, ArrowRight } from 'lucide-react';
import { ActiveRoomsTable } from '../components/rooms/ActiveRoomsTable';
import { RoomLobbyPanel } from '../components/rooms/RoomLobbyPanel';
import type { ICustomRoom } from '@ocj/types';
import { validateRoomCode } from '@ocj/validators';

interface CustomRoomsViewProps {
  onStartCustomMatch: (matchId: string, problemId: string) => void;
}

export const CustomRoomsView: React.FC<CustomRoomsViewProps> = ({ onStartCustomMatch }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ICustomRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ICustomRoom | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [maxParticipants, setMaxParticipants] = useState<number>(2);
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
      const res = await api.createRoom({ difficulty, maxParticipants });
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
    if (!validateRoomCode(targetCode)) {
      alert('Mã phòng đấu không hợp lệ! Mã phòng phải đúng 6 ký tự, chỉ chứa chữ và số.');
      return;
    }
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
        await api.leaveRoom(activeRoom.id);
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
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 lg:p-8">
      {/* Header */}
      <div className="bg-washi border border-charcoal p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-ink p-3 border border-charcoal">
            <Shield size={32} className="text-vermilion" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-linen uppercase tracking-wider">Đấu Trường Tùy Chỉnh</h2>
            <p className="font-body text-sm text-stone mt-1">Tạo phòng chơi riêng tư để so tài thuật toán trực tiếp cùng bạn bè</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Room */}
        <div className="bg-ink border border-charcoal p-6 flex flex-col gap-4">
          <h3 className="font-display text-sm font-bold text-linen uppercase tracking-wider">Tạo phòng đấu mới</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-display text-[10px] font-bold text-stone uppercase tracking-[0.1em]">Độ khó bài tập</label>
              <select 
                value={difficulty} 
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="bg-washi border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors appearance-none cursor-pointer"
              >
                <option value="EASY">Dễ (Easy)</option>
                <option value="MEDIUM">Trung bình (Medium)</option>
                <option value="HARD">Khó (Hard)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-display text-[10px] font-bold text-stone uppercase tracking-[0.1em]">Số người (Tối đa)</label>
              <select 
                value={maxParticipants} 
                onChange={(e: any) => setMaxParticipants(parseInt(e.target.value))}
                className="bg-washi border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors appearance-none cursor-pointer"
              >
                {[2, 3, 4, 5, 6, 8, 10].map(n => (
                  <option key={n} value={n}>{n} người</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={handleCreateRoom} 
            disabled={loading}
            className="mt-2 bg-vermilion text-linen font-display text-[11px] font-bold uppercase tracking-wider px-4 py-3 hover:bg-vermilion-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> {loading ? 'Đang tạo...' : 'Tạo phòng'}
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-ink border border-charcoal p-6 flex flex-col gap-4">
          <h3 className="font-display text-sm font-bold text-linen uppercase tracking-wider">Tham gia bằng mã</h3>
          <div className="flex flex-col gap-2">
            <label className="font-display text-[10px] font-bold text-stone uppercase tracking-[0.1em]">Mã phòng (6 ký tự)</label>
            <input
              type="text"
              placeholder="VD: AB12CD"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              className="bg-washi border border-charcoal text-linen p-3 font-mono text-sm outline-none focus:border-vermilion transition-colors uppercase placeholder:text-stone/50"
              maxLength={6}
            />
          </div>
          <button 
            onClick={() => handleJoinRoom()} 
            disabled={loading || !roomCodeInput}
            className="mt-2 border border-charcoal text-linen font-display text-[11px] font-bold uppercase tracking-wider px-4 py-3 hover:border-stone hover:bg-washi transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Tham gia <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <ActiveRoomsTable rooms={rooms} onJoinRoom={handleJoinRoom} />
    </div>
  );
};

export default CustomRoomsView;
