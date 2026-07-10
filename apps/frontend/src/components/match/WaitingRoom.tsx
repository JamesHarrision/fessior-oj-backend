import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, X, Play, LogOut, UserMinus } from 'lucide-react';
import { PlayerCard } from './PlayerCard';

interface WaitingRoomProps {
  room: any;
  onClose: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ room, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opponent, setOpponent] = useState<any>(room.opponent || null);
  const [error, setError] = useState('');

  const isHost = user?.id === room.creator_id;

  useEffect(() => {
    // Join the custom room socket channel if not already handled globally
    // We expect the server to emit PLAYER_JOINED, PLAYER_KICKED, MATCH_STARTED
    (socketService as any).onPlayerJoined?.((data: any) => {
      // Fetch opponent details or just use ID for now (ideally BE sends user details)
      setOpponent({ id: data.userId, username: 'Đối thủ', elo: '?' });
    });

    (socketService as any).onPlayerKicked?.((data: any) => {
      if (data.userId === user?.id) {
        alert('Bạn đã bị chủ phòng đuổi khỏi phòng.');
        onClose();
      } else {
        setOpponent(null);
      }
    });

    socketService.onPlayerLeft((data) => {
      if (data.userId !== user?.id) {
        setOpponent(null);
      }
    });

    socketService.onRoomDeleted(() => {
      alert('Chủ phòng đã hủy phòng đấu.');
      onClose();
    });

    socketService.onMatchStarted((data) => {
      navigate(`/match/${data.matchId}`);
    });

    return () => {
      // Clean up event listeners if needed
    };
  }, [user, navigate, onClose]);

  const handleStart = async () => {
    setError('');
    try {
      await api.startMatch(room.id);
    } catch (err: any) {
      setError(err.message || 'Không thể bắt đầu trận đấu');
    }
  };

  const handleKick = async () => {
    if (!opponent) return;
    setError('');
    try {
      await api.kickPlayer(room.id, opponent.id || opponent.userId);
      setOpponent(null);
    } catch (err: any) {
      setError(err.message || 'Không thể đuổi người chơi');
    }
  };

  const handleLeave = async () => {
    try {
      if (isHost) {
        await api.deleteRoom(room.id);
      } else {
        await api.leaveRoom(room.id);
      }
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-washi border border-charcoal w-full max-w-3xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-charcoal">
          <div className="flex items-center gap-2">
            <Users className="text-vermilion" size={24} />
            <h2 className="font-display text-xl font-bold text-linen uppercase tracking-wider">
              Phòng Chờ — {room.room_code || room.code}
            </h2>
          </div>
          <button onClick={handleLeave} className="text-stone hover:text-vermilion transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Players */}
        <div className="p-8 flex flex-col md:flex-row justify-center items-center gap-8 min-h-[300px]">
          {/* Host */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-display text-xs font-bold text-vermilion tracking-wider uppercase border border-vermilion/30 px-2 py-1">
              Chủ Phòng
            </span>
            <PlayerCard
              name={isHost ? (user?.username || 'Bạn') : 'Host'}
              avatar={`https://api.dicebear.com/7.x/adventurer/svg?seed=${isHost ? user?.username : room.creator_id}`}
              elo={isHost ? (user?.elo_rating || 1200) : 1200}
              winRate="-"
            />
          </div>

          <span className="font-display text-3xl font-bold text-charcoal px-4">VS</span>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-3">
            {opponent ? (
              <>
                <span className="font-display text-xs font-bold text-stone tracking-wider uppercase border border-charcoal px-2 py-1">
                  Đấu Thủ
                </span>
                <PlayerCard
                  name={opponent.username || 'Đối thủ'}
                  avatar={`https://api.dicebear.com/7.x/adventurer/svg?seed=${opponent.username || 'Opponent'}`}
                  elo={opponent.elo || 1200}
                  winRate="-"
                  isOpponent
                />
                {isHost && (
                  <button
                    onClick={handleKick}
                    className="flex items-center gap-1.5 text-xs text-vermilion border border-vermilion hover:bg-vermilion hover:text-linen px-3 py-1.5 transition-colors mt-2 uppercase font-display tracking-wider"
                  >
                    <UserMinus size={14} /> Kích xuất
                  </button>
                )}
              </>
            ) : (
              <div className="w-[200px] h-[280px] border border-dashed border-charcoal flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-charcoal border-t-vermilion animate-spin" />
                <span className="font-display text-xs text-stone tracking-wider uppercase">Đang chờ đối thủ...</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="px-6 py-2 bg-vermilion/10 border-t border-b border-vermilion/30 text-center text-vermilion font-body text-sm">
            {error}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-charcoal bg-ink/50">
          <button
            onClick={handleLeave}
            className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-stone hover:text-linen transition-colors border border-charcoal px-4 py-2 hover:border-stone"
          >
            <LogOut size={16} /> Rời phòng
          </button>

          {isHost && (
            <button
              onClick={handleStart}
              disabled={!opponent}
              className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider bg-vermilion text-linen px-8 py-2.5 hover:bg-vermilion-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-vermilion"
            >
              <Play size={18} /> Bắt đầu trận
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
