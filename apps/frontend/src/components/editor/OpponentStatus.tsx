import React, { useState, useEffect } from 'react';
import { Timer, UserCheck } from 'lucide-react';
import './OpponentStatus.css';

interface OpponentStatusProps {
  opponentName: string;
  opponentAvatar: string;
  isSubmitted: boolean;
  timeLeftSeconds: number;
}

export const OpponentStatus: React.FC<OpponentStatusProps> = ({
  opponentName,
  opponentAvatar,
  isSubmitted,
  timeLeftSeconds,
}) => {
  const [secs, setSecs] = useState(timeLeftSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecs((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="opponent-status-card glass-card">
      <div className="status-header">
        <div className="section-title">
          <UserCheck size={18} className="icon-title" />
          <span>Thông tin đối thủ</span>
        </div>
        <div className="timer-wrapper">
          <Timer size={18} className="icon-timer" />
          <span>Thời gian: {formatTime(secs)}</span>
        </div>
      </div>

      <div className="status-body">
        <div className="opponent-profile">
          <img src={opponentAvatar} alt={opponentName} className="opponent-avatar-small" />
          <div className="profile-details">
            <span className="opponent-label">Trạng thái:</span>
            <span className={`opponent-verdict ${isSubmitted ? 'submitted' : 'pending'}`}>
              {isSubmitted ? 'Đã nộp bài' : 'Chưa nộp'}
            </span>
          </div>
        </div>

        <div className="progress-comparison">
          <div className="progress-labels">
            <span className="user-score">Bạn: 0%</span>
            <span className="opponent-score">{opponentName}: 100%</span>
          </div>
          <div className="bar-wrapper">
            <div className="user-bar" style={{ width: '0%' }}></div>
            <div className="opponent-bar" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
