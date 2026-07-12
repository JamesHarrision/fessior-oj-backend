import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { PlayerCard } from '../components/match/PlayerCard';
import { FindingCircle } from '../components/match/FindingCircle';
import { RoomBrowser } from '../components/match/RoomBrowser';
import { SocialSidebar } from '../components/layout/SocialSidebar';
import { RecentMatchesWidget } from '../components/match/RecentMatchesWidget';
import { LeaderboardPreviewWidget } from '../components/match/LeaderboardPreviewWidget';
import { ContestBannerWidget } from '../components/match/ContestBannerWidget';
import { WaitingRoom } from '../components/match/WaitingRoom';

/* =====================================================
   MatchFindingView — Ink & Vermillion Lobby
   ===================================================== */

interface MatchFindingViewProps {
  onStartMatch: (matchData: any) => void;
}

export const MatchFindingView: React.FC<MatchFindingViewProps> = ({ onStartMatch }) => {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [searchDuration, setSearchDuration] = useState(0);
  const [opponent, setOpponent] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [customRoom, setCustomRoom] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchDuration(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  useEffect(() => {
    socketService.onQueueStatus((data) => {
      if (data.status === 'QUEUED') {
        setIsSearching(true);
        setOpponent(null);
        setMatchData(null);
      } else if (data.status === 'IDLE') {
        setIsSearching(false);
      }
    });

    socketService.onMatchFound((data) => {
      setIsSearching(false);
      setMatchData(data);
      const rival = data.player1.userId === user?.id ? data.player2 : data.player1;
      setOpponent({
        name: rival.username,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${rival.username}`,
        elo: rival.elo,
        winRate: 'Đang đấu',
        isOpponent: true,
      });
    });
  }, [user]);

  const handleToggleSearch = () => {
    if (isSearching) {
      socketService.leaveQueue();
    } else {
      setOpponent(null);
      setMatchData(null);
      socketService.joinQueue();
    }
  };

  const handleJoinCustomRoom = (room: any) => {
    setCustomRoom(room);
  };

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* ── Lobby Arena: Host + Circle + Opponent (all same card style, equal height) ── */}
      <div className="flex items-stretch justify-center gap-6 lg:gap-8 flex-col lg:flex-row">
        {/* Host */}
        <PlayerCard
          name={user?.username || 'Bạn'}
          avatar={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'You'}`}
          elo={user?.elo_rating || 1000}
          winRate={`Streak: ${user?.streak_count || 0}`}
        />

        {/* Center Circle — now in matching card wrapper */}
        <FindingCircle
          isSearching={isSearching}
          onToggleSearch={handleToggleSearch}
          searchDuration={searchDuration}
        />

        {/* Opponent */}
        {opponent ? (
          <PlayerCard
            name={opponent.name}
            avatar={opponent.avatar}
            elo={opponent.elo}
            winRate={opponent.winRate}
            isOpponent={true}
          />
        ) : (
          <PlayerCard
            name=""
            avatar=""
            elo={0}
            winRate="-"
            isOpponent={true}
            isSearching={isSearching}
          />
        )}
      </div>

      {/* VS reveal when opponent found (outside 3-col, centered) */}
      {matchData && opponent && (
        <div className="flex justify-center -mt-4">
          <button
            onClick={() => onStartMatch(matchData)}
            className="font-display text-xl font-bold uppercase tracking-wide bg-vermilion text-linen px-10 py-3 hover:bg-vermilion-hover transition-colors cursor-pointer animate-vs-grow"
          >
            BẮT ĐẦU
          </button>
        </div>
      )}

      {/* ── Banner: Contest ── */}
      <div className="w-full max-w-[1200px] mx-auto">
        <ContestBannerWidget />
      </div>

      {/* ── Data row: Recent Matches + Leaderboard ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[1200px] mx-auto">
        <RecentMatchesWidget />
        <LeaderboardPreviewWidget />
      </div>

      {/* ── Secondary: Rooms + Social ── */}
      <div className="flex justify-between gap-5 w-full max-w-[1200px] mx-auto">
        <RoomBrowser onJoinRoom={handleJoinCustomRoom} />
        <SocialSidebar />
      </div>

      {customRoom && (
        <WaitingRoom 
          room={customRoom} 
          onClose={() => setCustomRoom(null)} 
        />
      )}
    </div>
  );
};
