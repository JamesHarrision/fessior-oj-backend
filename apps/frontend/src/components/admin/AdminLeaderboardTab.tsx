import React, { useEffect, useState } from 'react';
import { RefreshCw, Star, Zap } from 'lucide-react';
import { api } from '../../services/api';
import type { IUser } from '@ocj/types';

export const AdminLeaderboardTab: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.getLeaderboard();
      if (res.success) {
        setLeaderboard(res.data?.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="problems-tab-grid" style={{ gridTemplateColumns: '1fr' }}>
      <div className="prob-admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '16px' }}>
          <h3 style={{ borderBottom: 'none', paddingBottom: 0 }}>Bảng Xếp Hạng ELO Toàn Hệ Thống</h3>
          <button onClick={fetchLeaderboard} className="btn-prob-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
            <RefreshCw size={12} className={loading ? 'spin' : ''} /> Làm mới
          </button>
        </div>

        <div className="prob-list-scroll" style={{ maxHeight: '600px' }}>
          {loading ? (
            <p>Đang tải bảng xếp hạng...</p>
          ) : leaderboard.length === 0 ? (
            <p style={{ color: '#64748b' }}>Chưa có dữ liệu xếp hạng.</p>
          ) : (
            leaderboard.map((user, idx) => (
              <div key={user.id || idx} className="prob-item-row" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : '#64748b',
                    width: '30px'
                  }}>
                    #{idx + 1}
                  </span>
                  
                  <div className="prob-item-details">
                    <span className="prob-item-title" style={{ fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {user.username}
                      {idx === 0 && <Star size={14} fill="#fbbf24" color="#fbbf24" />}
                    </span>
                    <div className="prob-item-meta">
                      <span className="prob-tag-pill" style={{ fontSize: '0.72rem' }}>
                        ID: {user.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={14} style={{ color: '#f59e0b' }} />
                  <span className="diff-pill diff-easy" style={{ fontSize: '0.88rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '4px 12px', borderRadius: '12px', fontWeight: 700 }}>
                    {user.elo_rating ?? user.eloRating ?? 1000} ELO
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
