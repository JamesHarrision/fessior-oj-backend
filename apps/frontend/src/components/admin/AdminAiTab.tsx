import React, { useState } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { api } from '../../services/api';
import { AdminCard, AdminHeader, AdminButton, AdminInput, AdminSelect, AdminFormGroup } from './ui/AdminUI';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left side: AI Roadmap Generator Tester */}
      <AdminCard>
        <AdminHeader>
          <Compass size={18} className="text-blue-400" /> 
          Trình Tạo Lộ Trình AI (Roadmap Generator)
        </AdminHeader>
        <form onSubmit={handleGenerateRoadmap} className="flex flex-col gap-4">
          <AdminFormGroup label="Trình độ (Skill Level)">
            <AdminSelect
              value={skillLevel}
              onChange={e => setSkillLevel(e.target.value)}
            >
              <option value="Beginner">Nhập môn (Beginner)</option>
              <option value="Intermediate">Trung cấp (Intermediate)</option>
              <option value="Advanced">Nâng cao (Advanced)</option>
            </AdminSelect>
          </AdminFormGroup>

          <AdminFormGroup label="Chủ đề trọng tâm (Focus Area)">
            <AdminInput
              type="text"
              value={focusArea}
              onChange={e => setFocusArea(e.target.value)}
              placeholder="Ví dụ: Dynamic Programming, Graph Algorithms..."
              required
            />
          </AdminFormGroup>

          <AdminButton type="submit" disabled={roadmapLoading} className="mt-2">
            {roadmapLoading ? 'Đang tạo lộ trình...' : 'Tạo lộ trình học tập AI'}
          </AdminButton>
        </form>

        {roadmapResult && (
          <div className="mt-4 bg-ink/40 border border-charcoal/50 rounded-xl p-4">
            <h4 className="text-linen text-sm font-semibold mb-2">Lộ trình được đề xuất:</h4>
            <div className="text-sm text-surface-300 whitespace-pre-wrap leading-relaxed">
              {typeof roadmapResult === 'string' ? roadmapResult : JSON.stringify(roadmapResult, null, 2)}
            </div>
          </div>
        )}
      </AdminCard>

      {/* Right side: AI Feedback Simulator */}
      <AdminCard>
        <AdminHeader>
          <Sparkles size={18} className="text-yellow-500" /> 
          Trình Đánh Giá Code AI (Submission Feedback)
        </AdminHeader>
        <form onSubmit={handleGenerateFeedback} className="flex flex-col gap-4">
          <AdminFormGroup label="Nhập ID Lượt Nộp Bài (Submission ID)">
            <AdminInput
              type="text"
              value={submissionId}
              onChange={e => setSubmissionId(e.target.value)}
              placeholder="Nhập MongoDB ObjectId của Submission..."
              required
            />
          </AdminFormGroup>

          <AdminButton type="submit" disabled={feedbackLoading} className="mt-2">
            {feedbackLoading ? 'Đang phân tích code...' : 'Tạo nhận xét code AI'}
          </AdminButton>
        </form>

        {feedbackResult && (
          <div className="mt-4 bg-ink/40 border border-charcoal/50 rounded-xl p-4">
            <h4 className="text-linen text-sm font-semibold mb-2">Phân tích từ AI Assistant:</h4>
            <div className="text-sm text-surface-300 whitespace-pre-wrap leading-relaxed">
              {typeof feedbackResult === 'string' ? feedbackResult : JSON.stringify(feedbackResult, null, 2)}
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  );
};

