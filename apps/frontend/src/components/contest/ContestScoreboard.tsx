import React from 'react';
import { Timer, Trophy } from 'lucide-react';
import './ContestScoreboard.css';

interface ScoreboardRow {
  userId: string;
  username: string;
  elo: number;
  avatarUrl?: string;
  score: number;
  timePenalty: number;
  solvedCount: number;
}

interface ContestScoreboardProps {
  leaderboardData: ScoreboardRow[];
  onBack: () => void;
}

export const ContestScoreboard: React.FC<ContestScoreboardProps> = ({ leaderboardData, onBack }) => {
  const formatPenalty = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="contest-scoreboard glass-card animate-fade-in">
      <div className="scoreboard-header">
        <div className="title-section">
          <Trophy className="trophy-gold" size={24} />
          <h3>Bảng Xếp Hạng Giải Đấu</h3>
        </div>
        <button onClick={onBack} className="back-btn glass-button">
          Quay lại danh sách
        </button>
      </div>

      <div className="scoreboard-table-wrapper">
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th className="cell-center">Hạng</th>
              <th>Đấu thủ</th>
              <th className="cell-center">ELO</th>
              <th className="cell-center">Đã giải</th>
              <th className="cell-center">Tổng điểm</th>
              <th className="cell-center">Thời gian phạt</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-scoreboard">
                  Chưa có dữ liệu xếp hạng. Hãy gửi bài giải để cập nhật!
                </td>
              </tr>
            ) : (
              leaderboardData.map((row, idx) => {
                const isPodium = idx < 3;
                const medalColors = ['gold', 'silver', 'bronze'];
                
                return (
                  <tr key={row.userId} className={`scoreboard-row ${isPodium ? `podium-${medalColors[idx]}` : ''}`}>
                    <td className="cell-center rank-cell">
                      {isPodium ? (
                        <span className={`medal-badge ${medalColors[idx]}`}>{idx + 1}</span>
                      ) : (
                        idx + 1
                      )}
                    </td>
                    <td className="user-cell">
                      <img
                        src={row.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.username}`}
                        alt="avatar"
                        className="scoreboard-avatar"
                      />
                      <span className="scoreboard-username">{row.username}</span>
                    </td>
                    <td className="cell-center elo-cell">{row.elo}</td>
                    <td className="cell-center solved-cell">
                      <span className="solved-badge">{row.solvedCount}</span>
                    </td>
                    <td className="cell-center score-cell bold">{row.score} pts</td>
                    <td className="cell-center penalty-cell">
                      <div className="penalty-wrapper">
                        <Timer size={12} className="text-muted" />
                        <span>{formatPenalty(row.timePenalty)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ContestScoreboard;
