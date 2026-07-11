import React, { useEffect, useState } from 'react';
import { Trophy, Clock, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

/* =====================================================
   ContestBannerWidget — Show upcoming or ongoing contest
   ===================================================== */

export const ContestBannerWidget: React.FC = () => {
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.getContests();
        if (res.success && res.data && res.data.length > 0) {
          // Find first ongoing or upcoming contest
          const active = res.data.find((c: any) => c.status === 'ONGOING' || c.status === 'UPCOMING');
          if (active) setContest(active);
        }
      } catch (e) {
        console.error('Error fetching contests:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading || !contest) return null;

  return (
    <Link to={`/contest/${contest.id}`} className="block w-full mb-6">
      <div className="bg-ink border border-vermilion/50 relative overflow-hidden group hover:border-vermilion transition-colors">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-vermilion/20 to-transparent pointer-events-none" />
        
        <div className="p-4 md:p-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-vermilion/10 border border-vermilion flex items-center justify-center">
              <Trophy size={24} className="text-vermilion group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                  contest.status === 'ONGOING' ? 'bg-vermilion text-linen animate-pulse' : 'bg-washi text-stone border border-charcoal'
                }`}>
                  {contest.status === 'ONGOING' ? 'Đang diễn ra' : 'Sắp diễn ra'}
                </span>
                <span className="font-mono text-xs text-stone flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(contest.start_time).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-linen">{contest.title}</h3>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-vermilion font-display text-xs font-bold uppercase tracking-wider group-hover:translate-x-2 transition-transform">
            Tham gia ngay <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
};
