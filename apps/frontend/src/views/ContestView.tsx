import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Calendar, Award, RefreshCw, Trophy } from 'lucide-react';
import { ContestScoreboard } from '../components/contest/ContestScoreboard';
import { useAuth } from '../context/AuthContext';

export const ContestView: React.FC = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState<any[]>([]);
  const [activeLeaderboardData, setActiveLeaderboardData] = useState<any>(null);
  const [activeContestId, setActiveContestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Polling for scoreboard every 15 seconds if active
  useEffect(() => {
    if (!activeContestId) return;

    const fetchLb = async () => {
      try {
        setIsRefreshing(true);
        const res = await api.getContestLeaderboard(activeContestId);
        if (res.success) {
          setActiveLeaderboardData(res.data);
        }
      } catch (err) {
        console.error('Error fetching leaderboard', err);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Initial fetch handled by click handler, this just sets up polling
    const interval = setInterval(fetchLb, 15000); // 15 seconds polling

    return () => clearInterval(interval);
  }, [activeContestId]);

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
    setMessage('');
    try {
      const res = await api.getContestLeaderboard(contestId);
      if (res.success) {
        setActiveLeaderboardData(res.data);
        setActiveContestId(contestId);
      }
    } catch (err: any) {
      setMessage(err.message || 'Không thể xem bảng xếp hạng giải đấu này.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 lg:p-8">
      {/* Header */}
      <div className="bg-washi border border-charcoal p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-ink p-3 border border-charcoal">
            <Trophy size={32} className="text-vermilion" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-linen uppercase tracking-wider">Giải Đấu Lập Trình</h2>
            <p className="font-body text-sm text-stone mt-1">Tham gia thi đấu xếp hạng, nâng cao kỹ năng và khẳng định đẳng cấp</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-vermilion/10 border-l-4 border-vermilion p-4 text-linen font-body text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-charcoal border-t-vermilion" />
        </div>
      ) : activeLeaderboardData ? (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-ink/50 p-3 border border-charcoal">
            <div className="flex items-center gap-2 text-stone text-xs uppercase font-display tracking-wider">
              {isRefreshing && <RefreshCw size={14} className="animate-spin text-vermilion" />}
              {isRefreshing ? 'Đang cập nhật...' : 'Tự động cập nhật mỗi 15s'}
            </div>
            <button
              onClick={() => {
                setActiveLeaderboardData(null);
                setActiveContestId(null);
              }}
              className="text-xs uppercase font-display font-bold tracking-wider text-linen bg-charcoal px-4 py-2 hover:bg-stone transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
          <ContestScoreboard
            leaderboardData={activeLeaderboardData}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contests.length === 0 ? (
            <div className="col-span-full bg-ink border border-charcoal border-dashed p-12 text-center">
              <p className="font-body text-stone text-sm">Hiện tại không có giải đấu nào đang mở.</p>
            </div>
          ) : (
            contests.map((contest) => {
              const startTime = new Date(contest.start_time);
              
              let status = contest.status || 'UPCOMING';
              let statusColor = 'text-stone border-stone';
              
              if (status === 'ONGOING') {
                statusColor = 'text-vermilion border-vermilion bg-vermilion/10';
              } else if (status === 'UPCOMING' || status === 'REGISTRATION') {
                statusColor = 'text-green-500 border-green-500 bg-green-500/10';
              } else {
                statusColor = 'text-stone border-charcoal bg-ink';
              }

              const durationMinutes = Math.round((new Date(contest.end_time).getTime() - startTime.getTime()) / 60000);
              const isRegistered = contest.registrations?.some((r: any) => r.user_id === user?.id);

              return (
                <div key={contest.id} className="bg-washi border border-charcoal p-6 flex flex-col gap-5 hover:border-stone transition-colors group">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-lg font-bold text-linen group-hover:text-vermilion transition-colors">{contest.title}</h3>
                    <span className={`font-display text-[10px] uppercase font-bold tracking-widest px-2 py-1 border ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 font-body text-sm text-stone bg-ink/50 p-3 border border-charcoal">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-linen" /> Bắt đầu: <span className="text-linen">{startTime.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-linen" /> Thời lượng: <span className="text-linen">{durationMinutes} phút</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 flex items-center justify-end gap-3 border-t border-charcoal">
                    {isRegistered && <span className="text-xs font-display text-vermilion uppercase tracking-wider font-bold">Đã đăng ký</span>}
                    
                    {!isRegistered && (status === 'UPCOMING' || status === 'REGISTRATION') && (
                      <button onClick={() => handleRegister(contest.id)} className="bg-vermilion text-linen px-5 py-2 font-display text-xs font-bold uppercase tracking-wider hover:bg-vermilion-hover transition-colors">
                        Đăng ký ngay
                      </button>
                    )}
                    
                    <button onClick={() => handleViewLeaderboard(contest.id)} className="border border-charcoal text-linen px-5 py-2 font-display text-xs font-bold uppercase tracking-wider hover:border-stone transition-colors">
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
