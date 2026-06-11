import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Compass } from 'lucide-react';
import { api } from '../services/api';
import './AIView.css';

export const AIView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'review'>('roadmap');

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
      }
    } catch (err) {
      console.error(err);
      setFeedback('Lỗi: Không thể tải nhận xét từ AI.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="ai-view glass-card">
      <div className="ai-header">
        <Sparkles size={28} className="glow-icon-purple" />
        <h2>Trợ Lý Trí Tuệ Nhân Tạo (AI Assistant)</h2>
        <p>Phát triển năng lực thuật toán vượt bậc với công nghệ AI</p>
      </div>

      <div className="ai-tabs">
        <button
          className={`ai-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          <Compass size={14} /> Lộ trình DSA cá nhân
        </button>
        <button
          className={`ai-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          <BookOpen size={14} /> Trợ lý sửa Code
        </button>
      </div>

      <div className="ai-content">
        {activeTab === 'roadmap' ? (
          <div className="roadmap-panel">
            <form onSubmit={handleGenerateRoadmap} className="roadmap-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Trọng tâm học tập</label>
                  <input
                    type="text"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    placeholder="Ví dụ: Graphs, DP, Tree..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cấp độ hiện tại</label>
                  <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                    <option value="BEGINNER">Cơ bản (Beginner)</option>
                    <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
                    <option value="ADVANCED">Nâng cao (Advanced)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="generate-btn" disabled={roadmapLoading}>
                {roadmapLoading ? 'Đang tạo lộ trình...' : 'Thiết lập lộ trình'}
              </button>
            </form>

            {roadmap && (
              <div className="roadmap-result">
                <h3>🗺️ {roadmap.title}</h3>
                <p className="roadmap-desc">{roadmap.description}</p>
                <div className="roadmap-timeline">
                  {roadmap.nodes?.map((node: any, idx: number) => (
                    <div key={idx} className="timeline-node">
                      <div className="node-marker">{idx + 1}</div>
                      <div className="node-info">
                        <h4>{node.topic || node.title}</h4>
                        <p>{node.description || node.content}</p>
                        {node.difficulty && <span className={`difficulty-badge ${node.difficulty.toLowerCase()}`}>{node.difficulty}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="review-panel">
            <div className="review-layout">
              <div className="review-subs-list">
                <h3>Danh sách bài đã nộp</h3>
                {submissions.length === 0 ? (
                  <p className="no-subs">Bạn chưa có bài nộp nào để đánh giá.</p>
                ) : (
                  <div className="subs-scroll">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id || sub._id}
                        onClick={() => handleGetFeedback(sub.id || sub._id)}
                        className={`sub-item-card ${selectedSubId === (sub.id || sub._id) ? 'active' : ''}`}
                      >
                        <div className="sub-card-meta">
                          <span className={`sub-status ${sub.status.toLowerCase()}`}>{sub.status}</span>
                          <span className="sub-lang">{sub.language}</span>
                        </div>
                        <span className="sub-time">{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="review-feedback-pane">
                <h3>Nhận xét từ AI</h3>
                {feedbackLoading ? (
                  <div className="loading-feedback">Đang phân tích mã nguồn bằng Gemini AI...</div>
                ) : feedback ? (
                  <div className="feedback-body">
                    <pre className="feedback-text">{feedback}</pre>
                  </div>
                ) : (
                  <p className="select-prompt">Chọn một bài nộp bên trái để nhận đánh giá chi tiết.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
