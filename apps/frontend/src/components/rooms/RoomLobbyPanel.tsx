import React from 'react';
import { LogOut, Play, Users, Trophy } from 'lucide-react';
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
  const participants = activeRoom.participants || [];
  const maxParticipants = activeRoom.max_participants || 10;
  const canStart = isCreator && participants.length >= 2;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 lg:p-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Players Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-ink border border-charcoal px-4 py-3">
            <h4 className="font-display text-xs font-bold text-linen uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-vermilion" /> 
              Người chơi ({participants.length}/{maxParticipants})
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {participants.map(p => {
              const pUser = p.user;
              const isRoomCreator = activeRoom.creator_id === p.user_id;
              const isMe = user?.id === p.user_id;
              return (
                <div key={p.id} className={`bg-ink border p-4 text-center flex flex-col items-center justify-center gap-2 relative ${isMe ? 'border-vermilion' : 'border-charcoal'}`}>
                  {isRoomCreator && (
                    <span className="absolute top-2 left-2 font-display text-[8px] font-bold text-vermilion uppercase tracking-widest border border-vermilion/30 px-1.5 py-0.5 bg-vermilion/10">
                      Chủ phòng
                    </span>
                  )}
                  <h4 className="font-body text-lg font-bold text-linen mt-4 truncate w-full px-2">
                    {pUser?.username} {isMe && <span className="text-stone font-normal text-sm">(Bạn)</span>}
                  </h4>
                  <span className="font-mono text-xs text-stone">ELO: {pUser?.elo_rating}</span>
                </div>
              );
            })}
            
            {/* Empty Slots */}
            {Array.from({ length: maxParticipants - participants.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-ink/50 border border-charcoal border-dashed p-4 flex flex-col items-center justify-center opacity-50 min-h-[120px]">
                <div className="w-6 h-6 rounded-full border-2 border-charcoal border-t-stone animate-spin mb-2"></div>
                <span className="font-body text-xs text-stone">Đang chờ...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Rules & Config */}
        <div className="flex flex-col gap-6">
          <div className="bg-ink border border-charcoal p-6 flex flex-col gap-4">
            <h4 className="font-display text-xs font-bold text-vermilion uppercase tracking-wider flex items-center gap-2">
              <Trophy size={16} /> Thể thức: Winner takes all
            </h4>
            <div className="font-body text-sm text-stone space-y-2 leading-relaxed">
              <p>1. Người nộp bài đúng (AC) đầu tiên sẽ chiến thắng chung cuộc.</p>
              <p>2. Toàn bộ người chơi còn lại sẽ bị tính thua và bị trừ <strong className="text-linen">20 ELO</strong> mỗi người.</p>
              <p>3. Người thắng cuộc sẽ được cộng <strong className="text-green-400">tổng số ELO bị trừ của TẤT CẢ những người thua</strong>.</p>
              <p className="italic text-xs opacity-70 mt-4 border-t border-charcoal pt-4">VD: Phòng 5 người, 1 thắng 4 thua. 4 người thua bị trừ 20 ELO. Người thắng được cộng 80 ELO.</p>
            </div>
          </div>

          <div className="bg-washi border border-charcoal p-6 flex flex-col gap-4">
            <h4 className="font-display text-xs font-bold text-stone uppercase tracking-wider">Cấu hình trận</h4>
            <p className="font-body text-sm text-linen">
              <span className="text-stone">Độ khó:</span> <span className="font-bold">{activeRoom.difficulty || 'Mọi độ khó'}</span>
            </p>
            <p className="font-body text-sm text-linen">
              <span className="text-stone">Thời gian giới hạn:</span> {activeRoom.time_limit || 2000} ms
            </p>

            {isCreator ? (
              <button
                onClick={() => onStartMatch(activeRoom.room_code)}
                disabled={!canStart}
                className="mt-4 bg-vermilion text-linen font-display text-[13px] font-bold uppercase tracking-wider px-8 py-4 hover:bg-vermilion-hover transition-colors flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={20} /> Bắt đầu Match
              </button>
            ) : (
              <div className="mt-4 border border-charcoal bg-ink text-stone font-display text-[11px] font-bold uppercase tracking-wider px-4 py-3 text-center">
                Đang chờ chủ phòng bắt đầu...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
