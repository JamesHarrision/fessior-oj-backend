import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

/* =====================================================
   MatchResultModal — Ink & Vermillion
   Win/Loss pattern: fill vs outline (matching ELO Ticker)
   ===================================================== */

interface MatchResultModalProps {
  result: any;
  currentUserId: string;
  onClose: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  result,
  currentUserId,
  onClose,
}) => {
  const isWinner = result.winnerId === currentUserId;
  const userUpdate = result.eloUpdates?.[currentUserId];
  const opponentId = Object.keys(result.eloUpdates ?? {}).find((k) => k !== currentUserId);
  const opponentUpdate = opponentId ? result.eloUpdates?.[opponentId] : null;

  return (
    <div className="fixed inset-0 bg-ink/85 z-50 flex items-center justify-center p-4">
      <div className="bg-washi border border-charcoal p-10 text-center min-w-[360px] max-w-[420px]">
        {/* Title */}
        <h2 className={`font-display text-2xl font-bold uppercase tracking-wider mb-2 ${isWinner ? 'text-vermilion' : 'text-stone'
          }`}>
          {isWinner ? 'CHIẾN THẮNG' : 'THẤT BẠI'}
        </h2>
        <p className="font-body text-xs text-stone mb-8">Kết quả trận đấu PvP Arena</p>

        {/* ELO Changes */}
        <div className="flex justify-center gap-10 mb-8">
          {/* User */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-body text-xs text-stone uppercase tracking-wider">Bạn</span>
            <span className="font-display text-3xl font-bold text-linen tabular-nums">
              {userUpdate?.elo ?? 1000}
            </span>
            <div className={`flex items-center gap-1 font-display text-xs font-bold ${(userUpdate?.change ?? 0) >= 0 ? 'text-vermilion' : 'text-stone'
              }`}>
              {(userUpdate?.change ?? 0) >= 0 ? (
                <>
                  <ArrowUp size={12} className="text-vermilion" />
                  <span>+{userUpdate?.change ?? 0}</span>
                </>
              ) : (
                <>
                  <ArrowDown size={12} className="text-stone" />
                  <span>{userUpdate?.change ?? 0}</span>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-charcoal" />

          {/* Opponent */}
          {opponentUpdate && (
            <div className="flex flex-col items-center gap-2">
              <span className="font-body text-xs text-stone uppercase tracking-wider">Đối thủ</span>
              <span className="font-display text-3xl font-bold text-linen tabular-nums">
                {opponentUpdate.elo ?? 1000}
              </span>
              <div className={`flex items-center gap-1 font-display text-xs font-bold ${(opponentUpdate.change ?? 0) >= 0 ? 'text-vermilion' : 'text-stone'
                }`}>
                {(opponentUpdate.change ?? 0) >= 0 ? (
                  <>
                    <ArrowUp size={12} className="text-vermilion" />
                    <span>+{opponentUpdate.change ?? 0}</span>
                  </>
                ) : (
                  <>
                    <ArrowDown size={12} className="text-stone" />
                    <span>{opponentUpdate.change ?? 0}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="bg-vermilion text-linen font-display text-sm font-bold uppercase tracking-wider px-8 py-3 hover:bg-vermilion-hover transition-colors cursor-pointer"
        >
          Quay lại sảnh
        </button>
      </div>
    </div>
  );
};
