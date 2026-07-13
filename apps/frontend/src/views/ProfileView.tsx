import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Activity, Trophy, TrendingUp, Calendar, Zap, AlertCircle, Edit2 } from 'lucide-react';
import { SkeletonBlock, EmptyState } from '@ocj/ui';
import { api } from '../services/api';
import { RankBadge } from '../components/editor/RankBadge';
import { useAuth } from '../context/AuthContext';
import { EditProfileModal } from '../components/profile/EditProfileModal';

export const ProfileView: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState<any>(null);
  const [eloHistory, setEloHistory] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any>(null);
  const [tagStats, setTagStats] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);

  const fetchProfileData = async () => {
    if (!username) return;
    setLoading(true);
    setError('');
    try {
      const [profileRes, eloRes, streakRes, tagsRes] = await Promise.all([
        api.getUserProfile(username),
        api.getUserProfileEloHistory(username),
        api.getUserProfileStreak(username),
        api.getUserProfileTagStats(username)
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      } else {
        setError('Không tìm thấy người dùng này.');
      }

      if (eloRes.success && eloRes.data?.history) setEloHistory(eloRes.data.history.reverse());
      if (streakRes.success && streakRes.data) setStreakData(streakRes.data);
      if (tagsRes.success && tagsRes.data) setTagStats(tagsRes.data.tag_stats || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải thông tin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto w-full p-4 lg:p-8 flex flex-col gap-8">
        <SkeletonBlock  className="h-24" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SkeletonBlock  className="h-64" />
          <div className="lg:col-span-2 flex flex-col gap-8">
            <SkeletonBlock  className="h-64" />
            <SkeletonBlock  className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-[1200px] mx-auto w-full p-4 lg:p-8">
        <EmptyState 
          title={error || 'Không tìm thấy người dùng'} 
          icon={<AlertCircle size={48} className="text-vermilion" />}
        />
      </div>
    );
  }

  // Calculate some simple SVG points for Elo Chart
  const eloPoints = eloHistory.map((h, i) => {
    const x = i * (100 / Math.max(1, eloHistory.length - 1));
    const maxElo = Math.max(1200, ...eloHistory.map(h => h.new_elo));
    const minElo = Math.min(1000, ...eloHistory.map(h => h.new_elo));
    const range = maxElo - minElo || 1;
    const y = 100 - ((h.new_elo - minElo) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Extract Equipped Items
  const inventory = profile.inventory_items || [];
  const equippedFrame = inventory.find((inv: any) => inv.item.item_type === 'AVATAR_FRAME')?.item;
  const equippedTitle = inventory.find((inv: any) => inv.item.item_type === 'TITLE')?.item;
  const equippedBadge = inventory.find((inv: any) => inv.item.item_type === 'BADGE')?.item;

  // Heatmap generation
  const today = new Date();
  const heatmapDays = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    heatmapDays.push(d);
  }
  
  // Group by weeks
  const weeks = [];
  let currentWeek = [];
  for (const day of heatmapDays) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while(currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const isMyProfile = currentUser?.username === profile.username;

  return (
    <div className="max-w-[1200px] mx-auto w-full p-4 lg:p-8 flex flex-col gap-8">
      {isEditing && (
        <EditProfileModal 
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            fetchProfileData();
          }}
          currentFullName={profile.full_name}
          currentBio={profile.bio}
          currentAvatar={profile.avatar_url}
        />
      )}

      <div className="bg-ink border border-charcoal p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
          <Trophy size={300} />
        </div>
        
        {/* Avatar Area with Frame */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-charcoal bg-washi overflow-hidden flex items-center justify-center relative z-10">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-stone" />
            )}
          </div>
          {equippedFrame && (
            <div className="absolute inset-[-15%] z-20 pointer-events-none" title={equippedFrame.name}>
              <img src={equippedFrame.asset_url} alt="Frame" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center md:items-start flex-1 gap-2 z-10 w-full">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2 w-full">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-linen flex items-center gap-2">
              {profile.full_name || profile.username}
              {equippedBadge && (
                <img src={equippedBadge.asset_url} alt="Badge" title={equippedBadge.name} className="w-6 h-6 object-contain" />
              )}
            </h1>
            <span className="font-mono text-sm text-stone bg-washi px-3 py-1 border border-charcoal">@{profile.username}</span>
            <RankBadge elo={profile.elo_rating} showLabel size="lg" />
            
            {isMyProfile && (
              <button 
                onClick={() => setIsEditing(true)}
                className="ml-auto flex items-center gap-2 px-3 py-1 bg-ink border border-stone hover:border-vermilion hover:text-vermilion transition-colors text-xs font-display uppercase font-bold"
              >
                <Edit2 size={12} /> Chỉnh sửa
              </button>
            )}
          </div>
          
          {equippedTitle && (
            <div className="font-display text-xs text-vermilion font-bold tracking-wider uppercase mb-1">
              🏆 {equippedTitle.name}
            </div>
          )}

          {profile.bio && (
            <p className="font-body text-sm text-stone text-center md:text-left max-w-2xl">{profile.bio}</p>
          )}
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4 pt-4 border-t border-charcoal/50 w-full">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-vermilion" />
              <div className="flex flex-col">
                <span className="text-[10px] text-stone uppercase font-bold tracking-wider">Chuỗi ngày</span>
                <span className="font-mono text-sm text-linen font-bold">{streakData?.current_streak || 0} (Max: {streakData?.max_streak || 0})</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-stone uppercase font-bold tracking-wider">Elo Rating</span>
                <span className="font-mono text-sm text-linen font-bold">{profile.elo_rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-purple-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-stone uppercase font-bold tracking-wider">Tham gia từ</span>
                <span className="font-mono text-sm text-linen font-bold">
                  {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats */}
        <div className="flex flex-col gap-8">
          <div className="bg-ink border border-charcoal flex flex-col">
            <div className="bg-washi border-b border-charcoal p-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-stone" />
              <h3 className="font-display text-sm font-bold text-linen uppercase tracking-wider">Thống kê Tag</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {tagStats.length === 0 ? (
                <EmptyState title="Chưa giải bài nào" />
              ) : (
                tagStats.map(tag => (
                  <div key={tag.tag_id} className="flex items-center justify-between">
                    <span className="font-body text-sm text-stone">{tag.tag_name}</span>
                    <span className="font-mono text-xs text-linen bg-washi px-2 py-1 border border-charcoal">{tag.problems_solved}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Charts */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Elo History Chart */}
          <div className="bg-ink border border-charcoal flex flex-col">
            <div className="bg-washi border-b border-charcoal p-4 flex items-center gap-2">
              <Activity size={16} className="text-stone" />
              <h3 className="font-display text-sm font-bold text-linen uppercase tracking-wider">Biến động Elo</h3>
            </div>
            <div className="p-6 h-64 relative">
              {eloHistory.length < 2 ? (
                <EmptyState title="Chưa có đủ dữ liệu đấu" />
              ) : (
                <div className="w-full h-full relative">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <polyline
                      points={eloPoints}
                      fill="none"
                      stroke="var(--vermilion, #E34F26)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {eloHistory.map((h, i) => {
                      const x = i * (100 / Math.max(1, eloHistory.length - 1));
                      const maxElo = Math.max(1200, ...eloHistory.map(x => x.new_elo));
                      const minElo = Math.min(1000, ...eloHistory.map(x => x.new_elo));
                      const range = maxElo - minElo || 1;
                      const y = 100 - ((h.new_elo - minElo) / range) * 100;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="1.5"
                          fill="var(--ink, #121212)"
                          stroke="var(--vermilion, #E34F26)"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute top-0 right-0 font-mono text-[10px] text-stone bg-washi px-1 border border-charcoal opacity-50">
                    Max: {Math.max(1200, ...eloHistory.map(x => x.new_elo))}
                  </div>
                  <div className="absolute bottom-0 right-0 font-mono text-[10px] text-stone bg-washi px-1 border border-charcoal opacity-50">
                    Min: {Math.min(1000, ...eloHistory.map(x => x.new_elo))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-ink border border-charcoal flex flex-col">
            <div className="bg-washi border-b border-charcoal p-4 flex items-center gap-2">
              <Calendar size={16} className="text-stone" />
              <h3 className="font-display text-sm font-bold text-linen uppercase tracking-wider">Hoạt động trong năm</h3>
            </div>
            <div className="p-6 overflow-x-auto custom-scrollbar">
              <div className="min-w-[700px] flex gap-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((day, dayIdx) => {
                      if (!day) return <div key={dayIdx} className="w-3 h-3 rounded-[1px] bg-transparent" />;
                      
                      const dateStr = day.toISOString().split('T')[0];
                      const count = streakData?.heatmap?.[dateStr] || 0;
                      
                      let colorClass = 'bg-charcoal';
                      if (count > 0 && count <= 2) colorClass = 'bg-vermilion/40';
                      else if (count > 2 && count <= 5) colorClass = 'bg-vermilion/70';
                      else if (count > 5) colorClass = 'bg-vermilion';

                      return (
                        <div 
                          key={dayIdx} 
                          className={`w-3 h-3 rounded-[1px] ${colorClass}`}
                          title={`${day.toLocaleDateString('vi-VN')}: ${count} bài`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
