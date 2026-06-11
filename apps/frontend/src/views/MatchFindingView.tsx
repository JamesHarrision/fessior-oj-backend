import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { PlayerCard } from '../components/match/PlayerCard';
import { FindingCircle } from '../components/match/FindingCircle';
import { RoomBrowser } from '../components/match/RoomBrowser';
import { SocialSidebar } from '../components/layout/SocialSidebar';
import './MatchFindingView.css';

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
    // When custom room starts, it will emit socket match-found as well
  };

  return (
    <div className="match-finding-view">
      <div className="match-lobby-container">
        {/* Host Player */}
        <PlayerCard
          name={user?.username || 'Bạn'}
          avatar={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'You'}`}
          elo={user?.elo_rating || 1000}
          winRate={`Streak: ${user?.streak_count || 0}`}
        />

        {/* Match Circle */}
        <FindingCircle
          isSearching={isSearching}
          onToggleSearch={handleToggleSearch}
          searchDuration={searchDuration}
        />

        {/* Opponent Player */}
        <div className="opponent-wrapper">
          {opponent ? (
            <PlayerCard
              name={opponent.name}
              avatar={opponent.avatar}
              elo={opponent.elo}
              winRate={opponent.winRate}
              isOpponent={true}
              isSearching={false}
            />
          ) : (
            <PlayerCard
              name="Đang tìm..."
              avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=Searching"
              elo={1000}
              winRate="-"
              isOpponent={true}
              isSearching={isSearching}
            />
          )}
          
          {matchData && (
            <button className="start-btn animate-pulse-slow" onClick={() => onStartMatch(matchData)}>
              Bắt đầu
            </button>
          )}
        </div>
      </div>

      <div className="lobby-secondary-grid">
        <RoomBrowser onJoinRoom={handleJoinCustomRoom} />
        <SocialSidebar />
      </div>
    </div>
  );
};
