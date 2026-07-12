import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Users, LogIn, ArrowRight } from 'lucide-react';
import { DifficultyBadge } from '@ocj/ui';
import { Link } from 'react-router-dom';

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
    <div className="bg-washi border border-charcoal p-4 flex-1 flex flex-col gap-4 min-h-[400px]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-stone" />
          <h3 className="font-display text-base font-bold text-linen">Phòng đấu tùy chọn</h3>
        </div>
        <Link to="/custom-rooms" className="text-[10px] font-bold text-stone hover:text-vermilion transition-colors uppercase tracking-wider flex items-center gap-1">
          Xem tất cả <ArrowRight size={12} />
        </Link>
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

      {/* ── Room Table ── */}
      <div className="overflow-y-auto max-h-[240px] border border-charcoal">
        {rooms.length === 0 ? (
          <p className="text-xs text-stone text-center py-10 bg-ink/30">
            Hiện không có phòng đấu nào đang chờ.
          </p>
        ) : (
          <table className="w-full text-left border-collapse bg-ink/30">
            <thead>
              <tr className="border-b border-charcoal bg-charcoal/50">
                <th className="py-2.5 px-3 text-[10px] font-bold text-stone uppercase tracking-wider">Mã phòng</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-stone uppercase tracking-wider">Độ khó</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-stone uppercase tracking-wider">Chủ phòng</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-stone uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-charcoal/20 transition-colors">
                  <td className="py-2.5 px-3 font-display text-sm font-bold text-linen">{room.room_code}</td>
                  <td className="py-2.5 px-3"><DifficultyBadge difficulty={room.difficulty} size="small" /></td>
                  <td className="py-2.5 px-3 font-body text-xs text-stone">
                    {room.creator?.username || 'Ẩn danh'} ({room.participants?.length || 1}/{room.max_participants || 2})
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onJoinRoom(room)}
                      className="px-3 py-1.5 bg-washi border border-charcoal text-linen font-display text-[10px] font-bold uppercase tracking-wider hover:border-vermilion hover:text-vermilion transition-colors cursor-pointer"
                    >
                      Vào
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
