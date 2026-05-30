import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Trophy, Award } from 'lucide-react';
import './RankingView.css';

export const RankingView: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.getLeaderboard();
      if (res.success && res.data) {
        setLeaderboard(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="ranking-view glass-card">
      <div className="ranking-header">
        <Trophy size={28} className="gold-glow-icon" />
        <h2>Bảng Xếp Hạng Đấu Sĩ</h2>
        <p>Top người chơi có số điểm ELO cao nhất hệ thống</p>
      </div>

      {loading ? (
        <div className="ranking-loading">Đang tải bảng xếp hạng...</div>
      ) : (
        <div className="ranking-table">
          <div className="table-header">
            <span>Hạng</span>
            <span>Đấu sĩ</span>
            <span>ELO</span>
            <span>Chuỗi thắng</span>
          </div>

          <div className="table-body">
            {leaderboard.length === 0 ? (
              <p className="no-players">Chưa có người chơi nào xếp hạng.</p>
            ) : (
              leaderboard.map((player, index) => {
                const rank = index + 1;
                return (
                  <div key={player.id} className="player-row">
                    <span className={`rank-number rank-${rank}`}>
                      {rank <= 3 ? <Award size={18} /> : rank}
                    </span>
                    <div className="player-profile-cell">
                      <img
                        src={player.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${player.username}`}
                        alt="avatar"
                        className="player-avatar-cell"
                      />
                      <span className="player-username-cell">{player.username}</span>
                    </div>
                    <span className="player-elo-cell">{player.elo_rating}</span>
                    <span className="player-streak-cell">🔥 {player.streak_count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
