import React from 'react';
import { Timer } from 'lucide-react';

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
}

export const ContestScoreboard: React.FC<ContestScoreboardProps> = ({ leaderboardData }) => {
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
    <div className="bg-washi border border-charcoal flex flex-col min-h-[400px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body text-sm text-stone border-collapse">
          <thead>
            <tr className="bg-ink border-b border-charcoal">
              <th className="px-4 py-3 font-display font-bold uppercase tracking-wider text-linen text-center w-16">Hạng</th>
              <th className="px-4 py-3 font-display font-bold uppercase tracking-wider text-linen">Đấu thủ</th>
              <th className="px-4 py-3 font-display font-bold uppercase tracking-wider text-linen text-center w-20">ELO</th>
              <th className="px-4 py-3 font-display font-bold uppercase tracking-wider text-linen text-center w-24">Đã giải</th>
              <th className="px-4 py-3 font-display font-bold uppercase tracking-wider text-linen text-center w-32">Tổng điểm</th>
              <th className="px-4 py-3 font-display font-bold uppercase tracking-wider text-linen text-center w-32">Thời gian phạt</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-stone font-display text-sm">
                  Chưa có dữ liệu xếp hạng. Hãy gửi bài giải để cập nhật!
                </td>
              </tr>
            ) : (
              leaderboardData.map((row, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;
                
                let rowBg = 'bg-transparent';
                let rankStyle = 'text-stone';
                
                if (isFirst) {
                  rowBg = 'bg-[#FFD700]/5 border-l-2 border-[#FFD700]';
                  rankStyle = 'bg-[#FFD700] text-ink';
                } else if (isSecond) {
                  rowBg = 'bg-[#C0C0C0]/5 border-l-2 border-[#C0C0C0]';
                  rankStyle = 'bg-[#C0C0C0] text-ink';
                } else if (isThird) {
                  rowBg = 'bg-[#CD7F32]/5 border-l-2 border-[#CD7F32]';
                  rankStyle = 'bg-[#CD7F32] text-ink';
                } else {
                  rowBg = 'border-l-2 border-transparent hover:bg-ink/30 transition-colors';
                }

                return (
                  <tr key={row.userId} className={`border-b border-charcoal/50 last:border-b-0 ${rowBg}`}>
                    <td className="px-4 py-3 text-center font-display font-bold">
                      {isFirst || isSecond || isThird ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${rankStyle}`}>
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="text-stone">{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.username}`}
                          alt="avatar"
                          className="w-8 h-8 bg-charcoal border border-stone/30"
                        />
                        <span className={`font-bold ${isFirst ? 'text-[#FFD700]' : 'text-linen'}`}>{row.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{row.elo}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 bg-ink border border-charcoal font-display text-xs text-linen">
                        {row.solvedCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-display font-bold text-vermilion">
                      {row.score}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-display text-xs text-stone">
                        <Timer size={12} />
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
