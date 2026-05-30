import React, { useState, useEffect } from 'react';
import { PlayerCard } from '../components/match/PlayerCard';
import { FindingCircle } from '../components/match/FindingCircle';
import { ChatInput } from '../components/match/ChatInput';
import './MatchFindingView.css';

interface MatchFindingViewProps {
  onStartMatch: () => void;
}

export const MatchFindingView: React.FC<MatchFindingViewProps> = ({ onStartMatch }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchDuration, setSearchDuration] = useState(0);
  const [matchFound, setMatchFound] = useState(true); // Default to Figma state showing opponent

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

  const handleToggleSearch = () => {
    if (isSearching) {
      setIsSearching(false);
    } else {
      setMatchFound(false);
      setIsSearching(true);
      
      // Simulate finding a match in 5 seconds
      setTimeout(() => {
        setIsSearching(false);
        setMatchFound(true);
      }, 5000);
    }
  };

  return (
    <div className="match-finding-view">
      <div className="match-lobby-container">
        {/* Host Player (Left) */}
        <PlayerCard
          name="Anh Khoi"
          avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=AnhKhoi"
          elo={1650}
          winRate="54.2%"
        />

        {/* Match Circle (Middle) */}
        <FindingCircle
          isSearching={isSearching}
          onToggleSearch={handleToggleSearch}
          searchDuration={searchDuration}
        />

        {/* Opponent Player (Right) */}
        <div className="opponent-wrapper">
          <PlayerCard
            name="Bảy gạo bạc"
            avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=BayGao"
            elo={1660}
            winRate="Đã ẩn"
            isOpponent={true}
            isSearching={isSearching}
          />
          
          {matchFound && !isSearching && (
            <button className="start-btn animate-pulse-slow" onClick={onStartMatch}>
              Bắt đầu
            </button>
          )}
        </div>
      </div>

      {/* Bot Chatbar (Bottom) */}
      <div className="lobby-footer">
        <ChatInput onSendMessage={(msg) => console.log('User sent:', msg)} />
      </div>
    </div>
  );
};
