import React, { useEffect, useState } from 'react';
import { RefreshCw, Star, Zap } from 'lucide-react';
import { api } from '../../services/api';
import type { IUser } from '@ocj/types';
import { AdminCard, AdminButton, AdminListRow, AdminBadge } from './ui/AdminUI';

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
    <div className="w-full max-w-4xl mx-auto">
      <AdminCard>
        <div className="flex justify-between items-center border-b border-charcoal/50 pb-4 mb-4">
          <h3 className="font-display font-semibold text-linen text-lg m-0">Bảng Xếp Hạng ELO Toàn Hệ Thống</h3>
          <AdminButton variant="secondary" onClick={fetchLeaderboard} className="px-3">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </AdminButton>
        </div>

        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-stone text-sm">Đang tải bảng xếp hạng...</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-stone text-sm">Chưa có dữ liệu xếp hạng.</p>
          ) : (
            leaderboard.map((user, idx) => (
              <AdminListRow key={user.id || idx} className="py-3 px-4 items-center">
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold w-8 ${
                    idx === 0 ? 'text-yellow-400' : 
                    idx === 1 ? 'text-slate-300' : 
                    idx === 2 ? 'text-amber-600' : 'text-stone'
                  }`}>
                    #{idx + 1}
                  </span>
                  
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm text-linen font-body flex items-center gap-2">
                      {user.username}
                      {idx === 0 && <Star size={14} fill="currentColor" className="text-yellow-400" />}
                    </span>
                    <div className="flex items-center">
                      <span className="text-[11px] text-stone uppercase tracking-wider font-semibold">
                        ID: {user.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  <AdminBadge color="yellow" className="bg-amber-500/10 border-amber-500/20 text-amber-500 px-3 py-1 text-sm font-bold">
                    {user.elo_rating ?? user.eloRating ?? 1000} ELO
                  </AdminBadge>
                </div>
              </AdminListRow>
            ))
          )}
        </div>
      </AdminCard>
    </div>
  );
};
