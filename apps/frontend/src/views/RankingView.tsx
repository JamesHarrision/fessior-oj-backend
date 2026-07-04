import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { PageHeader, SkeletonBlock, EmptyState } from '@ocj/ui';
import { Pagination } from 'antd';
import { useAuth } from '../context/AuthContext';

/* =====================================================
   RankingView — Full leaderboard page
   Ink & Vermillion: mono table, no glow, no gold,
   no tier-badge confusion, current user highlight,
   sort by ELO / Solved / Streak
   ===================================================== */

interface PlayerRow {
  rank: number;
  userId: string;
  username: string;
  eloRating: number;
  solvedCount: number;
  streakCount: number;
  avatarUrl?: string;
}

type SortBy = 'eloRating' | 'solvedCount' | 'streakCount';

const PAGE_SIZE = 20;

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: 'eloRating', label: 'ELO' },
  { key: 'solvedCount', label: 'Bài giải' },
  { key: 'streakCount', label: 'Chuỗi thắng' },
];

export const RankingView: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('eloRating');

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

        // Sort locally
        all.sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));
        all.forEach((p, i) => (p.rank = i + 1));

        setPlayers(all);
      }
    } catch (e) {
      setError('Không tải được bảng xếp hạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(players.length / PAGE_SIZE);
  const paginated = players.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const currentUserId = user?.id ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <PageHeader
        title="Bảng Xếp Hạng"
        subtitle="Top người chơi có thành tích cao nhất hệ thống"
        extra={
          <div className="flex bg-charcoal/30 p-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => { setSortBy(opt.key); setPage(1); }}
                className={`
                  px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
                  ${sortBy === opt.key
                    ? 'bg-vermilion text-linen'
                    : 'text-stone hover:text-linen'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-washi border border-charcoal p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonBlock width={36} height={18} />
              <SkeletonBlock width={28} height={28} rounded />
              <SkeletonBlock width="40%" height={14} />
              <div className="ml-auto">
                <SkeletonBlock width={60} height={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="border border-vermilion bg-washi p-5">
          <p className="font-body text-sm text-linen">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 font-display text-xs font-bold uppercase text-vermilion hover:text-vermilion-hover cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && players.length === 0 && (
        <EmptyState
          title="Chưa có người chơi nào"
          description="Bảng xếp hạng sẽ hiển thị khi có người chơi đầu tiên tham gia đấu trường."
        />
      )}

      {/* ── Table ── */}
      {!loading && !error && players.length > 0 && (
        <div className="bg-washi border border-charcoal overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[56px_1fr_100px_90px] border-b border-charcoal px-4 py-3 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-stone">
            <span>Hạng</span>
            <span>Đấu sĩ</span>
            <span className="text-right">ELO</span>
            <span className="text-right">Streak</span>
          </div>

          {/* Body */}
          <div>
            {paginated.map((p, idx) => {
              const absoluteRank = (page - 1) * PAGE_SIZE + idx + 1;
              const isTop3 = absoluteRank <= 3;
              const isCurrentUser = p.userId === currentUserId;
              const isThirdRow = absoluteRank === 3;

              return (
                <React.Fragment key={p.userId || absoluteRank}>
                  <div
                    className={`
                      grid grid-cols-[56px_1fr_100px_90px] items-center px-4 py-3 border-b border-charcoal/40 last:border-b-0 transition-colors
                      ${isCurrentUser
                        ? 'border-l-[3px] border-l-vermilion bg-washi/80'
                        : 'hover:bg-charcoal/20'
                      }
                    `}
                  >
                    {/* Rank */}
                    <span className={`font-display font-bold tabular-nums ${isTop3 ? 'text-lg text-linen' : 'text-sm text-stone'}`}>
                      {absoluteRank}
                    </span>

                    {/* Player */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.avatarUrl
                          ? p.avatarUrl.startsWith('http') ? p.avatarUrl : `${window.location.origin}${p.avatarUrl}`
                          : `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`
                        }
                        alt=""
                        className="w-7 h-7 rounded-full border border-charcoal shrink-0 bg-ink/30"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`;
                        }}
                      />
                      <span className="font-body text-sm text-linen truncate">
                        {p.username}
                      </span>
                      {isCurrentUser && (
                        <span className="shrink-0 font-display text-[9px] font-bold uppercase tracking-wider text-vermilion px-1.5 py-0.5 border border-vermilion/30">
                          {isTop3 ? `BẠN · TOP ${absoluteRank}` : 'BẠN'}
                        </span>
                      )}
                    </div>

                    {/* ELO */}
                    <span className="font-display text-sm font-bold text-linen tabular-nums text-right">
                      {p.eloRating}
                    </span>

                    {/* Streak */}
                    <span className="font-display text-sm text-stone tabular-nums text-right">
                      {p.streakCount > 0 ? p.streakCount : '—'}
                    </span>
                  </div>

                  {/* Divider after top 3 */}
                  {isThirdRow && (
                    <div className="h-px bg-charcoal mx-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            current={page}
            total={players.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};
