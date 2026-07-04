import React, { useState } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { api } from '../../services/api';

export const AdminAiTab: React.FC = () => {
  // Roadmap simulator
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [focusArea, setFocusArea] = useState('Dynamic Programming');
  const [roadmapResult, setRoadmapResult] = useState<any>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Feedback simulator
  const [submissionId, setSubmissionId] = useState('');
  const [feedbackResult, setFeedbackResult] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoadmapLoading(true);
    setRoadmapResult(null);
    try {
      const res = await api.getAIRoadmap({ skillLevel, focusArea });
      if (res.success) {
        setRoadmapResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo lộ trình học tập AI');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleGenerateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId.trim()) return;
    setFeedbackLoading(true);
    setFeedbackResult(null);
    try {
      const res = await api.getAIFeedback(submissionId.trim());
      if (res.success) {
        setFeedbackResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo nhận xét AI');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="problems-tab-grid">
      {/* Left side: AI Roadmap Generator Tester */}
      <div className="prob-admin-card">
        <h3><Compass size={18} style={{ color: '#60a5fa', marginRight: '6px', verticalAlign: 'middle' }} /> Trình Tạo Lộ Trình AI (Roadmap Generator)</h3>
        <form onSubmit={handleGenerateRoadmap} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="prob-form-group">
            <label>Trình độ (Skill Level)</label>
            <select
              value={skillLevel}
              onChange={e => setSkillLevel(e.target.value)}
              className="prob-admin-select"
            >
              <option value="Beginner">Nhập môn (Beginner)</option>
              <option value="Intermediate">Trung cấp (Intermediate)</option>
              <option value="Advanced">Nâng cao (Advanced)</option>
            </select>
          </div>

          <div className="prob-form-group">
            <label>Chủ đề trọng tâm (Focus Area)</label>
            <input
              type="text"
              value={focusArea}
              onChange={e => setFocusArea(e.target.value)}
              placeholder="Ví dụ: Dynamic Programming, Graph Algorithms..."
              className="prob-admin-input"
              required
            />
          </div>

          <button type="submit" className="btn-prob-primary" disabled={roadmapLoading}>
            {roadmapLoading ? 'Đang tạo lộ trình...' : 'Tạo lộ trình học tập AI'}
          </button>
        </form>

        {roadmapResult && (
          <div style={{ marginTop: '16px', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px' }}>Lộ trình được đề xuất:</h4>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {typeof roadmapResult === 'string' ? roadmapResult : JSON.stringify(roadmapResult, null, 2)}
            </div>
          </div>
        )}
      </div>

      {/* Right side: AI Feedback Simulator */}
      <div className="prob-admin-card">
        <h3><Sparkles size={18} style={{ color: '#fbbf24', marginRight: '6px', verticalAlign: 'middle' }} /> Trình Đánh Giá Code AI (Submission Feedback)</h3>
        <form onSubmit={handleGenerateFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="prob-form-group">
            <label>Nhập ID Lượt Nộp Bài (Submission ID)</label>
            <input
              type="text"
              value={submissionId}
              onChange={e => setSubmissionId(e.target.value)}
              placeholder="Nhập MongoDB ObjectId của Submission..."
              className="prob-admin-input"
              required
            />
          </div>

          <button type="submit" className="btn-prob-primary" disabled={feedbackLoading}>
            {feedbackLoading ? 'Đang phân tích code...' : 'Tạo nhận xét code AI'}
          </button>
        </form>

        {feedbackResult && (
          <div style={{ marginTop: '16px', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px' }}>Phân tích từ AI Assistant:</h4>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {typeof feedbackResult === 'string' ? feedbackResult : JSON.stringify(feedbackResult, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


