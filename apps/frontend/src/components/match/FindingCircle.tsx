import React, { useEffect, useRef } from 'react';
import { Swords } from 'lucide-react';

/* =====================================================
   FindingCircle — "The Pulse Ring"
   Ink & Vermillion signature element
   Props unchanged: { isSearching, onToggleSearch, searchDuration }
   States: idle | searching | found | timeout | cancelled
   ===================================================== */

interface FindingCircleProps {
  isSearching: boolean;
  onToggleSearch: () => void;
  searchDuration: number;
}

export const FindingCircle: React.FC<FindingCircleProps> = ({
  isSearching,
  onToggleSearch,
  searchDuration,
}) => {
  const ringRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isTimeout = searchDuration > 300; // 5 minutes

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* ── Ring ── */}
      <div
        ref={ringRef}
        className={`
          w-[250px] h-[250px] sm:w-[280px] sm:h-[280px] rounded-full border-[3px] flex items-center justify-center
          transition-all duration-400 ease
          ${isSearching
            ? 'border-vermilion ring-pulse'
            : isTimeout
              ? 'border-charcoal'
              : 'border-charcoal'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Swords icon */}
          <div className={`transition-all duration-300 ${isSearching ? 'text-vermilion' : 'text-stone'}`}>
            <Swords size={48} strokeWidth={1.5} />
          </div>

          {/* Rank / Status text */}
          {isTimeout ? (
            <div className="text-center space-y-1">
              <div className="font-display text-sm font-bold text-stone uppercase tracking-wider">
                KHÔNG TÌM THẤY
              </div>
              <div className="font-body text-xs text-stone">
                Thử lại với ELO khác?
              </div>
            </div>
          ) : isSearching ? (
            <div className="text-center space-y-1">
              <div className="font-display text-lg font-bold text-vermilion uppercase tracking-wider">
                ĐANG TÌM
              </div>
              <div className="font-display text-2xl font-bold text-vermilion tabular-nums tracking-tight">
                {formatTime(searchDuration)}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <div className="font-display text-[9px] font-bold text-stone uppercase tracking-[0.15em]">
                RANK CỦA BẠN
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-linen tracking-[-0.01em]">
                VÀNG III
              </h2>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={onToggleSearch}
            className={`
              font-display text-xs font-bold uppercase tracking-wider px-6 py-2.5 transition-all cursor-pointer
              ${isSearching
                ? 'border border-vermilion text-linen hover:bg-vermilion/10'
                : 'bg-vermilion text-linen hover:bg-vermilion-hover'
              }
            `}
          >
            {isTimeout ? 'TÌM LẠI' : isSearching ? 'HUỶ' : 'TÌM ĐỐI THỦ'}
          </button>
        </div>
      </div>
    </div>
  );
};
