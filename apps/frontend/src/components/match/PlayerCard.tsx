import React from 'react';

/* =====================================================
   PlayerCard — Ink & Vermillion
   Props unchanged: { name, avatar, elo, winRate, isOpponent?, isSearching? }
   ===================================================== */

interface PlayerCardProps {
  name: string;
  avatar: string;
  elo: number;
  winRate: string;
  isOpponent?: boolean;
  isSearching?: boolean;
}

const PlayerCardInner: React.FC<PlayerCardProps> = ({
  name,
  avatar,
  elo,
  winRate,
  isOpponent = false,
  isSearching = false,
}) => {
  /* ── Empty placeholder (no opponent yet) ── */
  if (isOpponent && !name) {
    return (
      <div className="w-[320px] h-[380px] flex flex-col items-center justify-center bg-washi border border-charcoal p-8 text-center">
        <div className="font-display text-6xl font-bold text-stone/40 mb-4">?</div>
        <div className="font-body text-sm text-stone">Chờ đối thủ</div>
      </div>
    );
  }

  /* ── Searching state ── */
  if (isSearching) {
    return (
      <div className="w-[320px] h-[380px] flex flex-col items-center justify-center bg-washi border border-dashed border-charcoal p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-charcoal/30 flex items-center justify-center mb-6">
          <span className="font-display text-3xl font-bold text-stone animate-pulse-soft">?</span>
        </div>
        <h3 className="font-display text-base font-bold text-linen mb-2">Đang tìm đối thủ...</h3>
        <p className="font-body text-xs text-stone">Đang ghép cặp ELO tương đương</p>
      </div>
    );
  }

  /* ── Normal card ── */
  const borderSide = isOpponent
    ? 'border-r-[3px] border-r-charcoal'
    : 'border-l-[3px] border-l-vermilion';

  return (
    <div className={`w-[320px] h-[380px] flex flex-col items-center justify-center bg-washi border border-charcoal ${borderSide} p-8`}>
      {/* Avatar */}
      <div className="relative w-[120px] h-[120px] mb-5">
        <img
          src={avatar}
          alt={name}
          className="w-[120px] h-[120px] rounded-full object-cover border-[3px] border-charcoal bg-ink/30"
        />
      </div>

      {/* Name */}
      <h2 className="font-display text-xl font-bold text-linen mb-8 truncate max-w-full">
        {name}
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="bg-charcoal/20 border border-charcoal p-3 flex flex-col items-center">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-stone mb-1.5">
            ELO HIỆN TẠI
          </span>
          <span className="font-display text-lg font-bold text-linen tabular-nums">
            {elo}
          </span>
        </div>
        <div className="bg-charcoal/20 border border-charcoal p-3 flex flex-col items-center">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-stone mb-1.5">
            {isOpponent ? 'TRẠNG THÁI' : 'CHUỖI THẮNG'}
          </span>
          <span className="font-display text-lg font-bold text-linen">
            {winRate}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PlayerCard = React.memo(PlayerCardInner);
