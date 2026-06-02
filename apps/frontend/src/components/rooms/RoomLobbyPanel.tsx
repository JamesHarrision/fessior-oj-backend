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
    <div className="room-lobby-container glass-card">
      <div className="lobby-header">
        <h3>
          Phòng Đấu Tùy Chỉnh:{' '}
          <span className="room-code-badge">{activeRoom.room_code}</span>
        </h3>
        <button onClick={onLeaveRoom} className="btn-leave glass-button">
          <LogOut size={16} /> {isCreator ? 'Giải tán phòng' : 'Rời phòng'}
        </button>
      </div>

      <div className="lobby-players">
        <div className="player-box glass-card creator-box">
          <span className="player-badge">CHỦ PHÒNG</span>
          <h4>{activeRoom.creator?.username || user?.username}</h4>
          <span className="player-elo">
            ELO: {activeRoom.creator?.elo_rating || user?.elo_rating}
          </span>
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
        <p>
          <strong>Độ khó đề bài:</strong> {activeRoom.difficulty || 'Mọi độ khó'}
        </p>
        <p>
          <strong>Thời gian giới hạn:</strong> {activeRoom.time_limit || 2000} ms
        </p>
        {isCreator && activeRoom.opponent_id && (
          <button
            onClick={() => onStartMatch(activeRoom.room_code)}
            className="btn-start-match glass-button"
          >
            <Play size={18} /> Bắt đầu Duel!
          </button>
        )}
      </div>
    </div>
  );
};
