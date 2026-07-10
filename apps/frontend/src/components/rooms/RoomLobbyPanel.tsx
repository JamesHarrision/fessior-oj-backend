import React from 'react';
import { LogOut, Play } from 'lucide-react';
import type { ICustomRoom, IUser } from '@ocj/types';

interface RoomLobbyPanelProps {
  activeRoom: ICustomRoom;
  user: IUser | null;
  onLeaveRoom: () => void;
  onStartMatch: (code: string) => void;
}

export const RoomLobbyPanel: React.FC<RoomLobbyPanelProps> = ({
  activeRoom,
  user,
  onLeaveRoom,
  onStartMatch,
}) => {
  const isCreator = activeRoom.creator_id === user?.id;

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto w-full p-4 lg:p-8">
      {/* Header */}
      <div className="bg-washi border border-charcoal p-6 flex justify-between items-center">
        <div>
          <h3 className="font-display text-sm font-bold text-stone uppercase tracking-wider">Phòng đấu tùy chỉnh</h3>
          <div className="mt-2 text-3xl font-mono font-bold text-vermilion tracking-[0.2em]">{activeRoom.room_code}</div>
        </div>
        <button 
          onClick={onLeaveRoom} 
          className="border border-charcoal text-linen font-display text-[11px] font-bold uppercase tracking-wider px-4 py-2 hover:border-vermilion hover:text-vermilion transition-colors flex items-center gap-2"
        >
          <LogOut size={16} /> {isCreator ? 'Giải tán phòng' : 'Rời phòng'}
        </button>
      </div>

      {/* Players */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div className="md:col-span-2 bg-ink border border-charcoal p-6 text-center h-full flex flex-col justify-center gap-2">
          <span className="font-display text-[10px] font-bold text-vermilion uppercase tracking-[0.1em] border border-vermilion/30 px-2 py-1 mx-auto bg-vermilion/10">Chủ phòng</span>
          <h4 className="font-body text-xl font-bold text-linen mt-2">{activeRoom.creator?.username || user?.username}</h4>
          <span className="font-mono text-sm text-stone">ELO: {activeRoom.creator?.elo_rating || user?.elo_rating}</span>
        </div>

        <div className="md:col-span-1 flex justify-center py-4">
          <span className="font-display text-4xl font-bold text-stone italic opacity-30">VS</span>
        </div>

        <div className="md:col-span-2 bg-ink border border-charcoal p-6 text-center h-full flex flex-col justify-center gap-2 relative overflow-hidden">
          {activeRoom.opponent_id ? (
            <>
              <span className="font-display text-[10px] font-bold text-green-500 uppercase tracking-[0.1em] border border-green-500/30 px-2 py-1 mx-auto bg-green-500/10">Đối thủ</span>
              <h4 className="font-body text-xl font-bold text-linen mt-2">{activeRoom.opponent?.username || 'Đang tải...'}</h4>
              <span className="font-mono text-sm text-stone">ELO: {activeRoom.opponent?.elo_rating}</span>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-70">
              <div className="w-8 h-8 rounded-full border-2 border-charcoal border-t-stone animate-spin"></div>
              <p className="font-body text-sm text-stone">Đang chờ đối thủ...</p>
            </div>
          )}
        </div>
      </div>

      {/* Config */}
      <div className="bg-ink border border-charcoal p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <h4 className="font-display text-xs font-bold text-stone uppercase tracking-wider">Cấu hình trận đấu</h4>
          <p className="font-body text-sm text-linen">
            <span className="text-stone">Độ khó:</span> <span className="font-bold">{activeRoom.difficulty || 'Mọi độ khó'}</span>
          </p>
          <p className="font-body text-sm text-linen">
            <span className="text-stone">Thời gian giới hạn:</span> {activeRoom.time_limit || 2000} ms
          </p>
        </div>
        {isCreator && activeRoom.opponent_id && (
          <button
            onClick={() => onStartMatch(activeRoom.room_code)}
            className="bg-vermilion text-linen font-display text-[13px] font-bold uppercase tracking-wider px-8 py-4 hover:bg-vermilion-hover transition-colors flex items-center gap-2 shadow-lg"
          >
            <Play size={20} /> Bắt đầu Duel!
          </button>
        )}
      </div>
    </div>
  );
};
