import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, ArrowRight, Search } from 'lucide-react';
import { ActiveRoomsTable } from '../components/rooms/ActiveRoomsTable';
import { RoomLobbyPanel } from '../components/rooms/RoomLobbyPanel';
import type { ICustomRoom } from '@ocj/types';
import { validateRoomCode } from '@ocj/validators';
import { Pagination } from '@ocj/ui';

interface CustomRoomsViewProps {
  onStartCustomMatch: (matchId: string, problemId: string) => void;
}

export const CustomRoomsView: React.FC<CustomRoomsViewProps> = ({ onStartCustomMatch }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ICustomRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ICustomRoom | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [maxParticipants, setMaxParticipants] = useState<number>(2);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchActiveRooms = () => {
    api.getActiveRooms().then(res => {
      if (res.success && res.data) setRooms(res.data);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    // Restore active room if page refreshes
    api.getCurrentRoom().then(res => {
      if (res.success && res.data) {
        const room = res.data;
        if (room.status === 'PLAYING' && room.match_id) {
          socketService.leaveCustomRoom(room.room_code);
          onStartCustomMatch(room.match_id, room.problem_id || '');
        } else {
          setActiveRoom(room);
        }
      }
    }).catch(() => {});

    // 2. Fetch initial active rooms list
    fetchActiveRooms();

    // 3. Listen to active rooms updates via socket
    socketService.joinLobby();
    socketService.onActiveRoomsUpdate((updatedRooms) => {
      setRooms(updatedRooms);
    });

    return () => {
      socketService.leaveLobby();
    };
  }, []);

  // Setup room sockets
  useEffect(() => {
    if (!activeRoom) return;

    socketService.joinCustomRoom(activeRoom.room_code);

    socketService.onConfigUpdated((updatedRoom) => {
      setActiveRoom(updatedRoom);
    });

    const refreshActiveRoom = () => {
      api.getCurrentRoom().then(res => {
        if (res.success && res.data) {
          setActiveRoom(res.data);
        } else {
          setActiveRoom(null);
        }
      }).catch(() => {});
    };

    socketService.onPlayerJoined(() => {
      refreshActiveRoom();
    });

    socketService.onPlayerLeft(() => {
      refreshActiveRoom();
    });

    socketService.onPlayerKicked((data) => {
      if (user && data.userId === user.id) {
        alert('Bạn đã bị chủ phòng kích khỏi phòng.');
        setActiveRoom(null);
      } else {
        refreshActiveRoom();
      }
    });

    socketService.onRoomDeleted(() => {
      alert('Chủ phòng đã giải tán phòng.');
      setActiveRoom(null);
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
      const res = await api.joinRoom({ room_code: targetCode });
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

  const handleStartMatch = async () => {
    if (!activeRoom) return;
    setLoading(true);
    try {
      await api.startMatch(activeRoom.id);
      // We don't need to do anything here because the socket event MATCH_STARTED 
      // will be broadcasted and caught in the useEffect, which will then trigger onStartCustomMatch.
    } catch (err: any) {
      alert(err.message || 'Lỗi bắt đầu trận đấu');
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
      // Note: socket ACTIVE_ROOMS_UPDATE will auto update the rooms list
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredRooms = React.useMemo(() => {
    return rooms.filter(r => {
      const matchSearch = !searchQuery || r.room_code.includes(searchQuery.toUpperCase());
      const matchDiff = !filterDifficulty || r.difficulty === filterDifficulty;
      return matchSearch && matchDiff;
    });
  }, [rooms, searchQuery, filterDifficulty]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDifficulty]);

  const currentRooms = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRooms.slice(startIndex, startIndex + pageSize);
  }, [filteredRooms, currentPage]);

  if (activeRoom) {
    return (
      <RoomLobbyPanel
        activeRoom={activeRoom}
        user={user}
        onLeaveRoom={handleLeaveRoom}
        onStartMatch={handleStartMatch}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 lg:p-8">
      {/* Header */}
      <div className="bg-washi border border-charcoal p-6 flex flex-col md:flex-row justify-between items-center gap-4 rounded-xl overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="bg-ink p-3 border border-charcoal rounded-xl">
            <Shield size={32} className="text-vermilion" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-linen uppercase tracking-wider">Đấu Trường Tùy Chỉnh</h2>
            <p className="font-body text-sm text-stone mt-1">Tạo phòng chơi riêng tư để so tài thuật toán trực tiếp cùng bạn bè</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Top bar: Join Room */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" size={18} />
            <input
              type="text"
              placeholder="Nhập mã phòng để tham gia hoặc tìm kiếm..."
              value={roomCodeInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setRoomCodeInput(val);
                setSearchQuery(val);
              }}
              className="w-full bg-ink border border-charcoal text-linen py-3 pl-10 pr-4 font-mono text-sm outline-none focus:border-vermilion transition-colors placeholder:text-stone/50 placeholder:font-body rounded-xl"
              maxLength={6}
            />
          </div>
          <button 
            onClick={() => handleJoinRoom()} 
            disabled={loading || !roomCodeInput}
            className="shrink-0 bg-vermilion text-linen font-display text-[12px] font-bold uppercase tracking-wider px-6 py-3 hover:bg-vermilion-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-xl"
          >
            Tham gia <ArrowRight size={16} />
          </button>
        </div>

        {/* Toolbar: Filters & Create Room */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-ink border border-charcoal p-4 rounded-xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="font-display text-[11px] font-bold text-stone uppercase tracking-wider shrink-0">Lọc:</span>
            <select 
              value={filterDifficulty} 
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-washi border border-charcoal text-linen px-3 py-2 font-body text-sm outline-none focus:border-vermilion transition-colors appearance-none cursor-pointer w-full sm:w-auto min-w-[120px] rounded-xl"
            >
              <option value="">Tất cả độ khó</option>
              <option value="EASY">Dễ (Easy)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="HARD">Khó (Hard)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto border-t border-charcoal pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4">
             <span className="font-display text-[11px] font-bold text-stone uppercase tracking-wider shrink-0 hidden sm:block">Tạo phòng:</span>
             <select 
              value={difficulty} 
              onChange={(e: any) => setDifficulty(e.target.value)}
              className="bg-washi border border-charcoal text-linen px-3 py-2 font-body text-sm outline-none focus:border-vermilion transition-colors appearance-none cursor-pointer flex-1 sm:flex-none rounded-xl"
            >
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">TB</option>
              <option value="HARD">Khó</option>
            </select>
            <select 
              value={maxParticipants} 
              onChange={(e: any) => setMaxParticipants(parseInt(e.target.value))}
              className="bg-washi border border-charcoal text-linen px-3 py-2 font-body text-sm outline-none focus:border-vermilion transition-colors appearance-none cursor-pointer flex-1 sm:flex-none rounded-xl"
            >
              {[2, 3, 4, 5, 6, 8, 10].map(n => (
                <option key={n} value={n}>{n} users</option>
              ))}
            </select>
            <button 
              onClick={handleCreateRoom} 
              disabled={loading}
              className="bg-washi border border-charcoal text-linen font-display text-[11px] font-bold uppercase tracking-wider px-4 py-2 hover:border-vermilion hover:text-vermilion transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 rounded-xl"
            >
              <Plus size={14} /> Tạo mới
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <ActiveRoomsTable rooms={currentRooms} onJoinRoom={handleJoinRoom} />
        
        {filteredRooms.length > 0 && (
          <div className="flex justify-end mt-2">
             <Pagination 
                currentPage={currentPage}
                totalItems={filteredRooms.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomRoomsView;
