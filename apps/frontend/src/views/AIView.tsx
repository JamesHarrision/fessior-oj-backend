import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Compass, Clock, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { PageHeader, EmptyState, SkeletonBlock } from '@ocj/ui';

export const AIView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'review'>('roadmap');

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Roadmap States
  const [skillLevel, setSkillLevel] = useState('BEGINNER');
  const [focusArea, setFocusArea] = useState('Recursion');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Review States
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.getAIHistory();
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'review') {
      const loadSubmissions = async () => {
        try {
          const res = await api.getSubmissions();
          if (res.success && res.data) {
            setSubmissions(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadSubmissions();
    }
  }, [activeTab]);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusArea.trim()) return;
    setRoadmapLoading(true);
    try {
      const res = await api.getAIRoadmap({ skillLevel, focusArea });
      if (res.success && res.data) {
        setRoadmap(res.data);
        // Refresh history
        const histRes = await api.getAIHistory();
        if (histRes.success && histRes.data) setHistory(histRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleGetFeedback = async (id: string) => {
    setSelectedSubId(id);
    setFeedbackLoading(true);
    setFeedback('');
    try {
      const res = await api.getAIFeedback(id);
      if (res.success && res.data) {
        setFeedback(res.data.feedback);
        // Refresh history
        const histRes = await api.getAIHistory();
        if (histRes.success && histRes.data) setHistory(histRes.data);
      }
    } catch (err) {
      console.error(err);
      setFeedback('Lỗi: Không thể tải nhận xét từ AI.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const viewHistoryItem = (item: any) => {
    if (item.type === 'ROADMAP') {
      setActiveTab('roadmap');
      try {
        setRoadmap(JSON.parse(item.output));
      } catch {}
    } else if (item.type === 'INTERVIEW') {
      setActiveTab('review');
      setFeedback(item.output);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full p-4 lg:p-8 flex flex-col gap-8">
      <PageHeader 
        title="AI Mentor"
        description="Lộ trình học tập cá nhân hóa & nhận xét code tự động từ AI"
        icon={<Sparkles size={24} className="text-vermilion" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar History */}
        <div className="lg:col-span-1 bg-ink border border-charcoal flex flex-col h-[600px]">
          <div className="bg-washi border-b border-charcoal p-4 flex items-center gap-2">
            <Clock size={16} className="text-stone" />
            <h3 className="font-display text-sm font-bold text-linen uppercase tracking-wider">Lịch sử AI</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {historyLoading ? (
              <SkeletonBlock lines={4} />
            ) : history.length === 0 ? (
              <EmptyState message="Chưa có lịch sử" />
            ) : (
              history.map((h) => (
                <div 
                  key={h.id} 
                  onClick={() => viewHistoryItem(h)}
                  className="p-3 border border-charcoal hover:border-vermilion hover:bg-washi transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${h.type === 'ROADMAP' ? 'text-blue-400' : 'text-purple-400'}`}>
                      {h.type}
                    </span>
                    <ChevronRight size={14} className="text-stone group-hover:text-vermilion transition-colors" />
                  </div>
                  <div className="text-xs text-stone truncate">
                    {new Date(h.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 bg-ink border border-charcoal min-h-[600px]">
          {/* Tabs */}
          <div className="flex border-b border-charcoal">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex-1 p-4 font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'roadmap' ? 'bg-vermilion/10 text-vermilion border-b-2 border-vermilion' : 'text-stone hover:bg-washi hover:text-linen'
              }`}
            >
              <Compass size={16} /> Lộ trình học
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 p-4 font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'review' ? 'bg-vermilion/10 text-vermilion border-b-2 border-vermilion' : 'text-stone hover:bg-washi hover:text-linen'
              }`}
            >
              <BookOpen size={16} /> Nhận xét Code
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'roadmap' ? (
              <div className="flex flex-col gap-6">
                <form onSubmit={handleGenerateRoadmap} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-display text-[10px] font-bold text-stone uppercase tracking-wider">Trọng tâm học tập</label>
                      <input
                        type="text"
                        value={focusArea}
                        onChange={(e) => setFocusArea(e.target.value)}
                        placeholder="Ví dụ: Graphs, DP, Tree..."
                        required
                        className="bg-washi border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-display text-[10px] font-bold text-stone uppercase tracking-wider">Cấp độ</label>
                      <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        className="bg-washi border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors appearance-none"
                      >
                        <option value="BEGINNER">Cơ bản (Beginner)</option>
                        <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
                        <option value="ADVANCED">Nâng cao (Advanced)</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={roadmapLoading}
                    className="self-end bg-vermilion text-linen font-display text-xs font-bold uppercase tracking-wider px-6 py-3 hover:bg-vermilion-hover transition-colors disabled:opacity-50"
                  >
                    {roadmapLoading ? 'Đang phân tích...' : 'Tạo lộ trình mới'}
                  </button>
                </form>

                {roadmap && (
                  <div className="mt-8 border-t border-charcoal pt-8">
                    <h3 className="font-display text-xl font-bold text-linen mb-2">{roadmap.title}</h3>
                    <p className="font-body text-sm text-stone mb-6">{roadmap.description}</p>
                    
                    <div className="flex flex-col gap-4 relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-charcoal hidden md:block"></div>
                      {roadmap.nodes?.map((node: any, idx: number) => (
                        <div key={idx} className="relative flex flex-col md:flex-row gap-6 items-start">
                          <div className="hidden md:flex w-8 h-8 rounded-full bg-washi border-2 border-vermilion items-center justify-center font-display text-xs font-bold text-vermilion shrink-0 z-10 relative left-[2px]">
                            {idx + 1}
                          </div>
                          <div className="bg-washi border border-charcoal p-5 flex-1 hover:border-stone transition-colors w-full">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-display text-sm font-bold text-linen">{node.title || node.topic}</h4>
                              {node.difficulty && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                                  node.difficulty === 'EASY' ? 'text-green-500 bg-green-500/10' :
                                  node.difficulty === 'MEDIUM' ? 'text-yellow-500 bg-yellow-500/10' :
                                  'text-vermilion bg-vermilion/10'
                                }`}>
                                  {node.difficulty}
                                </span>
                              )}
                            </div>
                            <p className="font-body text-sm text-stone">{node.description || node.content}</p>
                            {node.recommendedProblems && node.recommendedProblems.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-charcoal/50">
                                <span className="font-display text-[10px] font-bold text-stone uppercase tracking-wider block mb-2">Bài tập đề xuất</span>
                                <div className="flex flex-wrap gap-2">
                                  {node.recommendedProblems.map((slug: string) => (
                                    <span key={slug} className="font-mono text-xs text-linen bg-ink px-2 py-1 border border-charcoal">
                                      {slug}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:w-1/3 flex flex-col gap-3">
                  <h4 className="font-display text-[10px] font-bold text-stone uppercase tracking-wider mb-2">Bài nộp gần đây</h4>
                  {submissions.length === 0 ? (
                    <EmptyState message="Chưa có bài nộp" />
                  ) : (
                    submissions.slice(0, 10).map((sub) => (
                      <div 
                        key={sub.id} 
                        onClick={() => handleGetFeedback(sub.id)}
                        className={`p-3 border cursor-pointer transition-colors ${
                          selectedSubId === sub.id ? 'border-vermilion bg-vermilion/5' : 'border-charcoal bg-washi hover:border-stone'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${sub.status === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>
                            {sub.status}
                          </span>
                          <span className="font-mono text-[10px] text-stone">{sub.language}</span>
                        </div>
                        <div className="font-body text-xs text-linen truncate">{sub.problemId}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="w-full lg:w-2/3 bg-washi border border-charcoal p-5 min-h-[400px]">
                  {feedbackLoading ? (
                    <div className="flex flex-col gap-4">
                      <SkeletonBlock lines={1} />
                      <SkeletonBlock lines={4} />
                      <SkeletonBlock lines={3} />
                    </div>
                  ) : feedback ? (
                    <div className="font-body text-sm text-linen whitespace-pre-wrap leading-relaxed">
                      {feedback}
                    </div>
                  ) : (
                    <EmptyState 
                      message="Chọn một bài nộp để AI phân tích và đưa ra nhận xét chi tiết"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
