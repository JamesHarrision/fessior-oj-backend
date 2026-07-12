import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Users, LogIn } from 'lucide-react';
import { DifficultyBadge } from '@ocj/ui';

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
      const res = await api.joinRoom({ room_code: roomCodeInput });
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
    <div className="bg-washi border border-charcoal p-4 flex-1 flex-col gap-4 min-h-[400px]">
      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <Users size={18} className="text-stone" />
        <h3 className="font-display text-base font-bold text-linen">Phòng đấu tùy chọn</h3>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col gap-3">
        {/* Join by code */}
        <form onSubmit={handleJoinByCode} className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã phòng..."
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
            className="flex-1 bg-ink border border-charcoal px-3 py-2 text-sm text-linen placeholder-stone outline-none focus:border-vermilion transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-vermilion text-linen font-display text-xs font-bold uppercase tracking-wider hover:bg-vermilion-hover disabled:opacity-60 transition-colors cursor-pointer"
          >
            <LogIn size={14} />
            Tham gia
          </button>
        </form>

        {/* Create room */}
        <div className="flex gap-2">
          <select
            value={createDifficulty}
            onChange={(e) => setCreateDifficulty(e.target.value)}
            className="bg-ink border border-charcoal px-3 py-2 text-sm text-linen outline-none cursor-pointer focus:border-vermilion transition-colors"
          >
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Khó</option>
          </select>
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-charcoal text-linen font-display text-xs font-bold uppercase tracking-wider hover:border-stone disabled:opacity-60 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Tạo phòng
          </button>
        </div>
      </div>

      {message && (
        <p className="font-body text-xs text-vermilion">{message}</p>
      )}

      {/* ── Room grid ── */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 overflow-y-auto max-h-[240px]">
        {rooms.length === 0 ? (
          <p className="col-span-full text-xs text-stone text-center py-10">
            Hiện không có phòng đấu nào đang chờ.
          </p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="bg-ink/30 border border-charcoal p-4 flex flex-col gap-3 hover:border-stone transition-colors">
              <div className="flex justify-between items-center">
                <span className="font-display text-sm font-bold text-linen">{room.code}</span>
                <DifficultyBadge difficulty={room.difficulty} size="small" />
              </div>
              <div className="flex flex-col gap-1 font-body text-[11px] text-stone">
                <span>Chủ phòng: {room.hostName}</span>
                <span>{room.playersCount}/2 người chơi</span>
              </div>
              <button
                onClick={() => onJoinRoom(room)}
                className="w-full py-2 border border-charcoal text-linen font-display text-[10px] font-bold uppercase tracking-wider hover:border-vermilion transition-colors cursor-pointer"
              >
                Vào phòng
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
