import React from 'react';
import './PlayerCard.css';

interface PlayerCardProps {
  name: string;
  avatar: string;
  elo: number;
  winRate: string;
  isOpponent?: boolean;
  isSearching?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  avatar,
  elo,
  winRate,
  isOpponent = false,
  isSearching = false,
}) => {
  return (
    <div className={`player-card glass-card ${isOpponent ? 'opponent' : 'host'} ${isSearching ? 'searching' : ''}`}>
      {isSearching ? (
        <div className="searching-container">
          <div className="pulse-avatar">?</div>
          <h3>Đang tìm đối thủ...</h3>
          <p className="searching-subtext">Đang ghép cặp ELO tương đương</p>
        </div>
      ) : (
        <div className="player-info">
          <div className="avatar-wrapper">
            <img src={avatar} alt={name} className="player-avatar" />
            <div className="glow-ring"></div>
          </div>
          
          <h2 className="player-name">{name}</h2>
          
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">ELO HIỆN TẠI</span>
              <span className="stat-value elo">{elo}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">TỶ LỆ THẮNG</span>
              <span className="stat-value winrate">{winRate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
