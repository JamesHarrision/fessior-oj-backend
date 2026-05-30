import React from 'react';
import { Swords } from 'lucide-react';
import './FindingCircle.css';

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
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="finding-circle-container">
      <div className={`outer-glow-ring ${isSearching ? 'active' : ''}`}>
        <div className="inner-pulse-core">
          <div className="swords-icon-wrapper">
            <Swords size={48} className="swords-icon" />
          </div>
          
          <div className="rank-details">
            <span className="rank-label">RANK CỦA BẠN</span>
            <h2 className="rank-title">VÀNG III</h2>
          </div>
          
          <button 
            className={`match-action-btn ${isSearching ? 'searching' : ''}`}
            onClick={onToggleSearch}
          >
            {isSearching ? 'ĐANG TÌM TRẬN...' : 'TÌM ĐỐI THỦ'}
          </button>
        </div>
      </div>

      {isSearching && (
        <div className="search-timer-wrapper">
          <span className="timer-label">Thời gian chờ:</span>
          <span className="timer-value">{formatTime(searchDuration)}</span>
        </div>
      )}
    </div>
  );
};
