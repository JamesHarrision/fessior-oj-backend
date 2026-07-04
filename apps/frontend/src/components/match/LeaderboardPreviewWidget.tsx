import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Crown } from 'lucide-react';

/* =====================================================
   LeaderboardPreviewWidget — Top 5 + user rank
   Ink & Vermillion: rank badge shapes, ELO mono
   ===================================================== */

interface LeaderRow {
  rank: number;
  username: string;
  elo: number;
}

export const LeaderboardPreviewWidget: React.FC = () => {
  const [top5, setTop5] = useState<LeaderRow[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getLeaderboard();
        if (res.success && res.data) {
          const all = res.data?.items ?? res.data ?? [];
          const top = all.slice(0, 5).map((e: any) => ({
            rank: e.rank ?? all.indexOf(e) + 1,
            username: e.username ?? '???',
            elo: e.elo ?? e.eloRating ?? 0,
          }));
          setTop5(top);

          // Try to find current user's rank
          const currentUserEntry = all.find((e: any) => e.isCurrentUser);
          if (currentUserEntry) {
            setUserRank(currentUserEntry.rank ?? all.indexOf(currentUserEntry) + 1);
          }
        }
      } catch (e) {
        setError('Không tải được bảng xếp hạng.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-washi border border-charcoal p-4 flex flex-col gap-3 min-h-[200px]">
      <h3 className="font-display text-xs font-bold uppercase tracking-[0.12em] text-stone">
        Bảng xếp hạng
      </h3>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="font-body text-xs text-stone animate-pulse-soft">Đang tải...</div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-body text-xs text-stone">{error}</p>
        </div>
      ) : top5.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-body text-xs text-stone">Chưa có dữ liệu xếp hạng.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {top5.map((row) => (
            <div
              key={row.rank}
              className="flex items-center gap-3 py-1.5 border-b border-charcoal/50 last:border-b-0"
            >
              <span className="font-display text-xs font-bold text-stone tabular-nums w-6 text-right shrink-0">
                {row.rank <= 3 ? (
                  <Crown
                    size={14}
                    className={`inline ${row.rank === 1
                        ? 'text-amber-400'
                        : row.rank === 2
                          ? 'text-stone'
                          : 'text-amber-700'
                      }`}
                  />
                ) : (
                  row.rank
                )}
              </span>
              <span className="font-body text-sm text-linen truncate flex-1">
                {row.username}
              </span>
              <span className="font-display text-xs font-bold text-linen tabular-nums shrink-0">
                {row.elo}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* User rank footer */}
      {userRank != null && (
        <div className="border-t border-charcoal pt-2.5 mt-auto">
          <span className="font-body text-xs text-stone">
            Bạn đang{' '}
            <span className="font-display font-bold text-vermilion">#{userRank}</span>
          </span>
        </div>
      )}
    </div>
  );
};
