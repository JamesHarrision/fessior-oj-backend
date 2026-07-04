import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { PlayerCard } from '../components/match/PlayerCard';
import { FindingCircle } from '../components/match/FindingCircle';
import { RoomBrowser } from '../components/match/RoomBrowser';
import { SocialSidebar } from '../components/layout/SocialSidebar';

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
    console.log('Joined Custom Room:', room);
  };

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* ── Lobby Arena: Host + Circle + Opponent ── */}
      <div className="flex items-center justify-center gap-8 lg:gap-16 flex-col lg:flex-row">
        {/* Host */}
        <PlayerCard
          name={user?.username || 'Bạn'}
          avatar={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'You'}`}
          elo={user?.elo_rating || 1000}
          winRate={`Streak: ${user?.streak_count || 0}`}
        />

        {/* Center Circle */}
        <div className="flex flex-col items-center gap-5">
          <FindingCircle
            isSearching={isSearching}
            onToggleSearch={handleToggleSearch}
            searchDuration={searchDuration}
          />

          {/* VS reveal when opponent found */}
          {matchData && opponent && (
            <button
              onClick={() => onStartMatch(matchData)}
              className="font-display text-xl font-bold uppercase tracking-wide bg-vermilion text-linen px-10 py-3 hover:bg-vermilion-hover transition-colors cursor-pointer animate-vs-grow"
            >
              BẮT ĐẦU
            </button>
          )}
        </div>

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

      {/* ── Secondary: Rooms + Social ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 w-full max-w-[1200px] mx-auto">
        <RoomBrowser onJoinRoom={handleJoinCustomRoom} />
        <SocialSidebar />
      </div>
    </div>
  );
};
