import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Shield, Activity, ChevronRight, AlertCircle } from 'lucide-react';
import { PageHeader, EmptyState, SkeletonBlock } from '@ocj/ui';
import { AccountSettings } from '../components/auth/AccountSettings';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'account'>('general');
  const [reportType, setReportType] = useState('BUG');
  const [content, setContent] = useState('');
  const [problemId, setProblemId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.getMatchHistory();
        if (res.success && res.data) {
          setHistory(res.data.items || res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await api.submitReport({
        type: reportType,
        content,
        problemId: problemId.trim() || undefined,
      });
      if (res.success) {
        setMessage('Báo cáo đã được gửi thành công!');
        setContent('');
        setProblemId('');
      }
    } catch (err: any) {
      setMessage(err.message || 'Lỗi khi gửi báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full p-4 lg:p-8 flex flex-col gap-8">
      <PageHeader 
        title="Thiết Lập & Lịch Sử"
        
        
      />

      <div className="bg-ink border border-charcoal min-h-[600px] flex flex-col lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 bg-washi border-b lg:border-b-0 lg:border-r border-charcoal flex flex-row lg:flex-col shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 lg:flex-none p-4 font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-3 border-b-2 lg:border-b-0 lg:border-r-2 ${
              activeTab === 'general' ? 'bg-vermilion/10 text-vermilion border-vermilion' : 'text-stone border-transparent hover:bg-ink hover:text-linen'
            }`}
          >
            <Activity size={16} /> <span className="hidden sm:inline">Chung & Lịch sử</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 lg:flex-none p-4 font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-3 border-b-2 lg:border-b-0 lg:border-r-2 ${
              activeTab === 'account' ? 'bg-vermilion/10 text-vermilion border-vermilion' : 'text-stone border-transparent hover:bg-ink hover:text-linen'
            }`}
          >
            <Shield size={16} /> <span className="hidden sm:inline">Xác thực & Bảo mật</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8">
          {activeTab === 'general' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* History Section */}
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-lg font-bold text-linen uppercase tracking-wider border-b border-charcoal pb-2">
                  🏆 Lịch Sử Đấu
                </h3>
                
                {historyLoading ? (
                  <div className="flex flex-col gap-3">
                    <SkeletonBlock  />
                    <SkeletonBlock  />
                  </div>
                ) : history.length === 0 ? (
                  <EmptyState title="Bạn chưa tham gia trận đấu nào" />
                ) : (
                  <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((m) => {
                      const isWinner = m.winnerId === user?.id || m.winner_id === user?.id;
                      const isDraw = m.status === 'DRAW';
                      const eloChange = m.eloUpdates?.[user?.id || '']?.change || (m.elo_change ?? 0);
                      const date = new Date(m.createdAt || m.endedAt || m.ended_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                      const opponentName = (m.player1?.userId === user?.id || m.player1_id === user?.id) 
                        ? (m.player2?.username || m.opponent_name) 
                        : (m.player1?.username || m.opponent_name);

                      return (
                        <div key={m.id || m._id} className="bg-washi border border-charcoal p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-vermilion transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`font-display text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                              isWinner ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 
                              isDraw ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 
                              'bg-vermilion/20 text-vermilion border border-vermilion/50'
                            }`}>
                              {isWinner ? 'THẮNG' : isDraw ? 'HÒA' : 'THUA'}
                            </span>
                            <span className="font-body text-sm text-stone">
                              vs <strong className="text-linen">{opponentName || 'Đối thủ'}</strong>
                            </span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-charcoal/50 pt-3 sm:pt-0">
                            <span className="font-mono text-xs text-stone">{date}</span>
                            <span className={`font-mono text-sm font-bold tabular-nums ${eloChange >= 0 ? 'text-green-500' : 'text-vermilion'}`}>
                              {eloChange >= 0 ? `+${eloChange}` : eloChange} ELO
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Report Section */}
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-lg font-bold text-linen uppercase tracking-wider border-b border-charcoal pb-2">
                  <AlertCircle size={20} className="inline-block mr-2 text-vermilion" /> 
                  Gửi Báo Cáo
                </h3>
                
                <form onSubmit={handleSubmitReport} className="flex flex-col gap-4 bg-washi border border-charcoal p-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[10px] font-bold text-stone uppercase tracking-wider">Loại báo cáo</label>
                    <div className="relative">
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full bg-ink border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors appearance-none"
                      >
                        <option value="BUG">Lỗi hệ thống (Bug)</option>
                        <option value="FEEDBACK">Góp ý tính năng (Feedback)</option>
                        <option value="PLAGIARISM">Báo cáo gian lận (Plagiarism)</option>
                      </select>
                      <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none rotate-90" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[10px] font-bold text-stone uppercase tracking-wider">Mã đề bài (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: two-sum"
                      value={problemId}
                      onChange={(e) => setProblemId(e.target.value)}
                      className="w-full bg-ink border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors placeholder:text-stone/50"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[10px] font-bold text-stone uppercase tracking-wider">Nội dung chi tiết</label>
                    <textarea
                      placeholder="Mô tả chi tiết lỗi hoặc góp ý của bạn..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={5}
                      className="w-full bg-ink border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors resize-none placeholder:text-stone/50"
                    />
                  </div>

                  {message && (
                    <div className={`p-3 text-sm font-body border ${message.includes('thành công') ? 'bg-green-500/10 text-green-500 border-green-500/50' : 'bg-vermilion/10 text-vermilion border-vermilion/50'}`}>
                      {message}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-vermilion text-linen font-display text-xs font-bold uppercase tracking-wider p-4 hover:bg-vermilion-hover transition-colors disabled:opacity-50 mt-2"
                  >
                    <Send size={16} /> {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <AccountSettings />
          )}
        </div>
      </div>
    </div>
  );
};
