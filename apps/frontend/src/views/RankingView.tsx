import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Trophy } from 'lucide-react';

interface PlayerRow {
  rank: number;
  userId: string;
  username: string;
  eloRating: number;
  solvedCount: number;
  streakCount: number;
  avatarUrl?: string;
}

const PAGE_SIZE = 20;

function getTier(elo: number) {
  if (elo >= 3000) return { name: 'Grandmaster', color: '#ef4444' };
  if (elo >= 2500) return { name: 'International Master', color: '#f97316' };
  if (elo >= 2000) return { name: 'Master', color: '#a855f7' };
  if (elo >= 1500) return { name: 'Candidate Master', color: '#3b82f6' };
  if (elo >= 1200) return { name: 'Expert', color: '#3b82f6' };
  return { name: 'Specialist', color: '#64748b' };
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="w-7 h-7 flex items-center justify-center rounded-full text-[0.82rem] font-extrabold mx-auto bg-amber-500/20 text-amber-500">{rank}</span>;
  if (rank === 2) return <span className="w-7 h-7 flex items-center justify-center rounded-full text-[0.82rem] font-extrabold mx-auto bg-slate-500/20 text-slate-400">{rank}</span>;
  if (rank === 3) return <span className="w-7 h-7 flex items-center justify-center rounded-full text-[0.82rem] font-extrabold mx-auto bg-orange-500/20 text-orange-500">{rank}</span>;
  return <span className="w-7 h-7 flex items-center justify-center rounded-full text-[0.9rem] font-semibold mx-auto text-stone">{rank}</span>;
}

function CustomPagination({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3);
    if (page > 5) pages.push("...");
    if (page > 3 && page < totalPages - 2) pages.push(page);
    if (page < totalPages - 4) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-4 font-body">
      <button 
        disabled={page <= 1} 
        onClick={() => onPage(page - 1)}
        className="px-3 py-1.5 border border-charcoal rounded-md text-stone text-sm bg-washi disabled:opacity-50 hover:border-vermilion hover:text-vermilion transition-colors"
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="text-stone px-1">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${p === page ? 'bg-vermilion text-linen border-vermilion' : 'bg-washi border-charcoal text-stone hover:border-vermilion hover:text-vermilion'}`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="px-3 py-1.5 border border-charcoal rounded-md text-stone text-sm bg-washi disabled:opacity-50 hover:border-vermilion hover:text-vermilion transition-colors"
      >
        Next
      </button>
    </div>
  );
}

export const RankingView: React.FC = () => {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getLeaderboard();
      if (res.success && res.data) {
        const all: PlayerRow[] = (res.data?.items ?? res.data ?? []).map((e: any) => ({
          rank: e.rank ?? 0,
          userId: e.userId ?? e.user_id ?? '',
          username: e.username ?? '???',
          eloRating: e.eloRating ?? e.elo ?? 0,
          solvedCount: e.solvedCount ?? e.solved_count ?? 0,
          streakCount: e.streakCount ?? e.streak ?? 0,
          avatarUrl: e.avatarUrl ?? e.avatar_url ?? undefined,
        }));

        all.sort((a, b) => b.eloRating - a.eloRating);
        all.forEach((p, i) => (p.rank = i + 1));
        setPlayers(all);
      }
    } catch (e) {
      setError('Không tải được bảng xếp hạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(players.length / PAGE_SIZE);
  const paginated = players.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-[860px] mx-auto w-full flex flex-col gap-5 py-4 pb-12 font-body bg-ink p-6 rounded-2xl">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-[1.6rem] font-bold text-linen m-0">
          <Trophy className="text-vermilion" size={28} /> Global Ranking
        </h1>
        <p className="text-[0.82rem] text-stone m-0">Top competitive programmers around the world.</p>
      </div>

      {/* ── Table ── */}
      <div className="bg-washi border border-charcoal rounded-xl overflow-hidden mt-2">
        {loading ? (
          <div className="p-12 text-center text-stone">Đang tải...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : players.length === 0 ? (
          <div className="p-12 text-center text-stone">Chưa có dữ liệu xếp hạng.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink border-b border-charcoal">
                <th className="px-4 py-3 text-left text-[0.78rem] font-bold text-stone tracking-wide w-[80px] text-center">Rank</th>
                <th className="px-4 py-3 text-left text-[0.78rem] font-bold text-stone tracking-wide">User</th>
                <th className="px-4 py-3 text-right text-[0.78rem] font-bold text-stone tracking-wide w-[100px]">Rating</th>
                <th className="px-4 py-3 text-right text-[0.78rem] font-bold text-stone tracking-wide w-[100px]">Solved</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const isTop3 = p.rank <= 3;
                const tier = getTier(p.eloRating);
                
                return (
                  <tr 
                    key={p.userId} 
                    className={`border-b border-charcoal transition-colors last:border-none ${isTop3 ? 'bg-vermilion/5 hover:bg-vermilion/10' : 'hover:bg-ink'}`}
                  >
                    <td className="px-4 py-3 align-middle text-center">
                      <RankIcon rank={p.rank} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        {p.avatarUrl ? (
                          <img
                            src={p.avatarUrl.startsWith('http') ? p.avatarUrl : `${window.location.origin}${p.avatarUrl}`}
                            alt=""
                            className="w-[34px] h-[34px] rounded-full object-cover border-[1.5px] border-charcoal shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`;
                            }}
                          />
                        ) : (
                          <div className="w-[34px] h-[34px] rounded-full bg-vermilion text-linen font-bold text-[0.85rem] flex items-center justify-center shrink-0">
                            {(p.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span 
                            className="text-[0.9rem] font-bold" 
                            style={{ color: tier.color }}
                          >
                            {p.username}
                          </span>
                          <span 
                            className="text-[0.7rem] font-semibold opacity-80"
                            style={{ color: tier.color }}
                          >
                            {tier.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <span className="text-[0.9rem] font-bold text-linen">{p.eloRating.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <span className="text-[0.88rem] text-stone">{p.solvedCount.toLocaleString()}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <CustomPagination 
          page={page} 
          total={players.length} 
          limit={PAGE_SIZE} 
          onPage={setPage} 
        />
      )}
    </div>
  );
};
