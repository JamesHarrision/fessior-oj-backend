import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Beaker, Trophy, BookOpen, Crown, Flame, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const HomeView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  useEffect(() => {
    const checkActiveMatch = async () => {
      try {
        const res = await api.getActiveMatch();
        if (res.success && res.data) {
          setActiveMatchId(res.data.id);
        }
      } catch (e) {
        // Ignore
      }
    };
    checkActiveMatch();
  }, []);

  // Mocked Daily Challenge Data
  const dailyChallenge = {
    title: 'Two Sum',
    difficulty: 'EASY',
    tags: ['Array', 'Hash Table'],
    reward: 50,
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto w-full p-4 lg:p-8">
      {/* ── Active Match Banner ── */}
      {activeMatchId && (
        <div className="bg-vermilion/20 border border-vermilion p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-vermilion" size={20} />
            <span className="font-body text-linen text-sm">
              Bạn đang có một trận đấu chưa kết thúc!
            </span>
          </div>
          <button
            onClick={() => navigate(`/match/${activeMatchId}`)}
            className="bg-vermilion text-linen px-4 py-2 font-display text-xs font-bold uppercase tracking-wider hover:bg-vermilion-hover transition-colors"
          >
            Vào lại trận đấu
          </button>
        </div>
      )}

      {/* ── Welcome Banner ── */}
      <div className="bg-washi border border-charcoal p-8 relative overflow-hidden flex flex-col justify-center min-h-[200px]">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Crown size={250} />
        </div>
        <div className="z-10 relative">
          <h1 className="font-display text-4xl font-bold text-linen mb-2">
            Chào mừng trở lại, {user?.username}!
          </h1>
          <p className="font-body text-stone max-w-lg mb-6">
            Hôm nay là một ngày tuyệt vời để nâng cao kỹ năng code của bạn. Hãy hoàn thành thử thách hàng ngày hoặc tham gia đấu trường ngay!
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/match')}
              className="bg-vermilion text-linen px-6 py-3 font-display font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:bg-vermilion-hover transition-colors"
            >
              <Swords size={18} /> Đấu Ngay
            </button>
            <button
              onClick={() => navigate('/custom-rooms')}
              className="bg-ink border border-charcoal text-linen px-6 py-3 font-display font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:border-vermilion transition-colors"
            >
              <Beaker size={18} /> Arena
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Main Actions ── */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Daily Challenge */}
          <div className="bg-ink border border-charcoal flex flex-col">
            <div className="bg-washi border-b border-charcoal p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-vermilion" />
                <h3 className="font-display font-bold text-linen uppercase tracking-wider">Thử thách hàng ngày</h3>
              </div>
              <span className="font-mono text-xs text-stone bg-charcoal/50 px-2 py-1">Còn lại 14:23:05</span>
            </div>
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="font-display text-xl font-bold text-linen mb-1">{dailyChallenge.title}</h4>
                <div className="flex gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-washi border border-charcoal text-green-400">
                    {dailyChallenge.difficulty}
                  </span>
                  {dailyChallenge.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold px-2 py-0.5 bg-washi border border-charcoal text-stone">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="font-body text-sm text-stone">Phần thưởng: +{dailyChallenge.reward} Code Coins</p>
              </div>
              <button
                onClick={() => navigate('/problems')}
                className="bg-washi border border-charcoal text-linen px-4 py-2 font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-vermilion hover:text-vermilion transition-colors"
              >
                Giải ngay <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => navigate('/problems')}
              className="bg-washi border border-charcoal p-6 cursor-pointer hover:border-stone group transition-colors flex flex-col gap-3"
            >
              <div className="bg-ink p-3 w-fit border border-charcoal group-hover:border-vermilion transition-colors">
                <BookOpen size={24} className="text-vermilion" />
              </div>
              <h4 className="font-display font-bold text-linen uppercase tracking-wider">Danh sách bài tập</h4>
              <p className="font-body text-xs text-stone">Khám phá hơn 100+ bài tập thuật toán từ dễ đến khó.</p>
            </div>
            
            <div 
              onClick={() => navigate('/contest')}
              className="bg-washi border border-charcoal p-6 cursor-pointer hover:border-stone group transition-colors flex flex-col gap-3"
            >
              <div className="bg-ink p-3 w-fit border border-charcoal group-hover:border-vermilion transition-colors">
                <Trophy size={24} className="text-yellow-500" />
              </div>
              <h4 className="font-display font-bold text-linen uppercase tracking-wider">Giải đấu (Contest)</h4>
              <p className="font-body text-xs text-stone">Tham gia các kỳ thi định kỳ để giành lấy vinh quang.</p>
            </div>
          </div>
        </div>

        {/* ── Right Column: Stats & Activity ── */}
        <div className="flex flex-col gap-8">
          
          {/* User Mini Stats */}
          <div className="bg-ink border border-charcoal flex flex-col">
            <div className="bg-washi border-b border-charcoal p-4">
              <h3 className="font-display font-bold text-linen uppercase tracking-wider">Hồ sơ của bạn</h3>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-stone">Elo Rating</span>
                <span className="font-mono font-bold text-linen text-lg">{user?.eloRating || user?.elo_rating || 1000}</span>
              </div>
              <div className="w-full h-[1px] bg-charcoal"></div>
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-stone">Code Coins</span>
                <span className="font-mono font-bold text-yellow-500 text-lg">{(user as any)?.code_coins || 0}</span>
              </div>
              <div className="w-full h-[1px] bg-charcoal"></div>
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-stone">Vai trò</span>
                <span className="font-display text-xs bg-washi border border-charcoal px-2 py-1 text-stone uppercase">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Coder'}
                </span>
              </div>
              <button 
                onClick={() => navigate(`/profile/${user?.username}`)}
                className="mt-4 w-full bg-washi border border-charcoal text-stone py-2 font-display text-xs font-bold uppercase tracking-wider hover:text-linen hover:border-stone transition-colors"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
