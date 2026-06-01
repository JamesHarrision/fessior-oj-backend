import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { GitFork, Calendar, Award } from 'lucide-react';
import './ContestView.css';
import { ContestScoreboard } from '../components/contest/ContestScoreboard';
import { useAuth } from '../context/AuthContext';

export const ContestView: React.FC = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState<any[]>([]);
  const [activeLeaderboard, setActiveLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadContests = async () => {
    try {
      const res = await api.getContests();
      if (res.success && res.data) {
        setContests(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  const handleRegister = async (contestId: string) => {
    setMessage('');
    try {
      const res = await api.registerContest(contestId);
      if (res.success) {
        setMessage('Đăng ký giải đấu thành công!');
        loadContests();
      }
    } catch (err: any) {
      setMessage(err.message || 'Lỗi khi đăng ký giải đấu.');
    }
  };

  const handleViewLeaderboard = async (contestId: string) => {
    try {
      const res = await api.getContestLeaderboard(contestId);
      if (res.success) {
        setActiveLeaderboard(res.data);
      }
    } catch (err: any) {
      setMessage(err.message || 'Không thể xem bảng xếp hạng giải đấu này.');
    }
  };

  return (
    <div className="contest-view glass-card">
      <div className="contest-header">
        <GitFork size={28} className="glow-icon-purple" />
        <h2>Giải Đấu Lập Trình (Contests)</h2>
        <p>Tham gia các giải đấu kịch tính để nâng cao kỹ năng và nhận phần thưởng lớn</p>
      </div>

      {message && <p className="contest-msg">{message}</p>}

      {loading ? (
        <div className="contest-loading">Đang tải các giải đấu...</div>
      ) : activeLeaderboard ? (
        <ContestScoreboard
          leaderboardData={activeLeaderboard}
          onBack={() => setActiveLeaderboard(null)}
        />
      ) : (
        <div className="contest-list">
          {contests.length === 0 ? (
            <p className="no-contests">Hiện tại không có giải đấu nào đang mở.</p>
          ) : (
            contests.map((contest) => {
              const now = new Date();
              const startTime = new Date(contest.start_time);
              const endTime = new Date(contest.end_time);
              
              let status = 'UPCOMING';
              if (now >= startTime && now <= endTime) {
                status = 'ONGOING';
              } else if (now > endTime) {
                status = 'PAST';
              }

              const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
              const isRegistered = contest.registrations?.some((r: any) => r.user_id === user?.id);

              return (
                <div key={contest.id} className="contest-card">
                  <div className="contest-meta">
                    <h3 className="contest-title">{contest.title}</h3>
                    <span className={`status-badge ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>
                  <div className="contest-details">
                    <span>
                      <Calendar size={14} /> Bắt đầu: {startTime.toLocaleString()}
                    </span>
                    <span>
                      <Award size={14} /> Thời lượng: {durationMinutes} phút
                    </span>
                  </div>
                  <div className="contest-actions">
                    {!isRegistered && status === 'UPCOMING' && (
                      <button onClick={() => handleRegister(contest.id)} className="register-btn">
                        Đăng ký tham gia
                      </button>
                    )}
                    {isRegistered && <span className="registered-tag">Đã đăng ký</span>}
                    <button onClick={() => handleViewLeaderboard(contest.id)} className="view-lb-btn">
                      Xem xếp hạng
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
