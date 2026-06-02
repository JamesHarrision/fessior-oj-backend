import React from 'react';

interface MatchResultModalProps {
  matchResult: any;
  user: any;
  opponent: any;
  onClose: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  matchResult,
  user,
  opponent,
  onClose,
}) => {
  const isWinner = matchResult.winnerId === user?.id;
  const userEloUpdate = matchResult.eloUpdates[user?.id || ''];
  const opponentEloUpdate = opponent ? matchResult.eloUpdates[opponent.userId || opponent.id || ''] : null;

  return (
    <div className="match-result-overlay">
      <div className="result-modal glass-card">
        <h2>{isWinner ? '🏆 CHIẾN THẮNG!' : '💀 THẤT BẠI'}</h2>
        <p className="result-subtitle">Kết quả trận đấu PvP Arena</p>

        <div className="elo-changes">
          <div className="elo-box">
            <span className="player-label">{user?.username}</span>
            <span className="elo-value">
              {userEloUpdate?.elo || 1000}{' '}
              <span className="elo-diff plus">
                (+{userEloUpdate?.change || 0})
              </span>
            </span>
          </div>
          {opponent && (
            <div className="elo-box">
              <span className="player-label">{opponent.username}</span>
              <span className="elo-value">
                {opponentEloUpdate?.elo || 1000}{' '}
                <span className="elo-diff minus">
                  ({opponentEloUpdate?.change || 0})
                </span>
              </span>
            </div>
          )}
        </div>

        <button className="close-result-btn" onClick={onClose}>
          Quay lại sảnh
        </button>
      </div>
    </div>
  );
};
