import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Compass, Send, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { api } from '../services/api';
import { EmptyState, SkeletonBlock } from '@ocj/ui';
import RoadmapPage from '../features/ai-roadmap/pages/RoadmapPage';

export const AIView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'review'>('roadmap');

  // Review States
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'review') {
      const loadSubmissions = async () => {
        try {
          const res = await api.getSubmissions();
          if (res.success && res.data) {
            const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
            setSubmissions(list);
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadSubmissions();
    }
  }, [activeTab]);

  const handleGetFeedback = async (id: string) => {
    setSelectedSubId(id);
    setFeedbackLoading(true);
    setChatHistory([]);
    setActiveHistoryId('');
    try {
      const res = await api.getAIFeedback(id);
      if (res.success && res.data) {
        let historyToSet = [];
        if (res.data.chatHistory && Array.isArray(res.data.chatHistory) && res.data.chatHistory.length > 0) {
          historyToSet = res.data.chatHistory;
        } else {
          let feedbackData = res.data.feedback;
          if (typeof feedbackData === 'string' && feedbackData.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(feedbackData);
              if (Array.isArray(parsed)) {
                feedbackData = parsed;
              }
            } catch(e) {
              console.error(e);
            }
          }

          if (Array.isArray(feedbackData)) {
             historyToSet = feedbackData;
          } else {
             historyToSet = [{ role: 'model', text: feedbackData || 'Chưa có nhận xét.' }];
          }
        }
        setChatHistory(historyToSet);
        if (res.data.historyId) {
          setActiveHistoryId(res.data.historyId);
        }
      }
    } catch (err) {
      console.error(err);
      setChatHistory([{ role: 'model', text: 'Lỗi: Không thể tải nhận xét từ AI.' }]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeHistoryId) return;

    const message = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: message }]);
    setChatLoading(true);

    try {
      const res = await api.sendAIChatMessage(activeHistoryId, message);
      if (res.success && res.data && res.data.chatHistory) {
        setChatHistory(res.data.chatHistory);
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'model', text: 'Lỗi khi gửi tin nhắn.' }]);
    } finally {
      setChatLoading(false);
    }
  };


  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col gap-8">


      <div className="flex flex-col flex-1 min-h-0">
        {/* Main Content */}
        <div className="bg-ink border border-charcoal flex flex-col h-full min-h-[600px] lg:min-h-0">
          {/* Tabs */}
          <div className="flex border-b border-charcoal">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex-1 p-4 font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'roadmap' ? 'bg-vermilion/10 text-vermilion border-b-2 border-vermilion' : 'text-stone hover:bg-washi hover:text-linen'
                }`}
            >
              <Compass size={16} /> Lộ trình học
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 p-4 font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'review' ? 'bg-vermilion/10 text-vermilion border-b-2 border-vermilion' : 'text-stone hover:bg-washi hover:text-linen'
                }`}
            >
              <BookOpen size={16} /> Nhận xét Code
            </button>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ padding: activeTab === 'roadmap' ? 0 : '1.5rem' }}>
            {activeTab === 'roadmap' ? (
              <RoadmapPage />
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:w-1/3 flex flex-col gap-3">
                  <h4 className="font-display text-[10px] font-bold text-stone uppercase tracking-wider mb-2">Bài nộp gần đây</h4>
                  {submissions.length === 0 ? (
                    <EmptyState title="Chưa có bài nộp" />
                  ) : (
                    submissions.slice(0, 10).map((sub) => {
                      const id = sub.id || sub._id;
                      return (
                        <div
                          key={id}
                          onClick={() => handleGetFeedback(id)}
                          className={`p-3 border cursor-pointer transition-colors ${selectedSubId === id ? 'border-vermilion bg-vermilion/5' : 'border-charcoal bg-washi hover:border-stone'
                            }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${sub.status === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>
                              {sub.status}
                            </span>
                            <span className="font-mono text-[10px] text-stone">{sub.language}</span>
                          </div>
                          <div className="font-body text-xs text-linen truncate">{sub.problemId?.title || sub.problemId || 'Unknown'}</div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="w-full lg:w-2/3 bg-washi border border-charcoal flex flex-col min-h-[500px]">
                  {feedbackLoading ? (
                    <div className="flex flex-col gap-4 p-5">
                      <SkeletonBlock />
                      <SkeletonBlock />
                      <SkeletonBlock />
                    </div>
                  ) : chatHistory.length > 0 ? (
                    <>
                      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
                        {chatHistory.map((msg, idx) => (
                          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-charcoal text-linen' : 'bg-vermilion text-linen'}`}>
                              {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                            </div>
                            <div className={`p-4 font-body text-sm leading-relaxed ${msg.role === 'user' ? 'bg-charcoal text-linen whitespace-pre-wrap' : 'bg-ink border border-charcoal text-linen markdown-body'}`}>
                              {msg.role === 'user' ? (
                                msg.text
                              ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                  {msg.text}
                                </ReactMarkdown>
                              )}
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="flex gap-3 max-w-[85%] self-start">
                            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-vermilion text-linen">
                              <Sparkles size={14} />
                            </div>
                            <div className="p-4 bg-ink border border-charcoal flex gap-1 items-center">
                              <span className="w-2 h-2 bg-stone rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-stone rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                              <span className="w-2 h-2 bg-stone rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                          </div>
                        )}
                      </div>

                      {activeHistoryId && (
                        <div className="p-4 border-t border-charcoal bg-ink">
                          <form onSubmit={handleSendChat} className="flex gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Hỏi thêm Mentor về cách tối ưu hoặc một ngôn ngữ khác..."
                              className="flex-1 bg-washi border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors"
                              disabled={chatLoading}
                            />
                            <button
                              type="submit"
                              disabled={chatLoading || !chatInput.trim()}
                              className="bg-vermilion text-linen px-4 hover:bg-vermilion-hover transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              <Send size={18} />
                            </button>
                          </form>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-5">
                      <EmptyState title="Chọn một bài nộp để AI phân tích và đưa ra nhận xét chi tiết" />
                    </div>
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
