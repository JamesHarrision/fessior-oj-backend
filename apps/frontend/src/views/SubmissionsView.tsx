import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, Eye, Sparkles } from 'lucide-react';
import './SubmissionsView.css';

export const SubmissionsView: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    api.getSubmissions().then(res => {
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setSubmissions(list);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleViewDetail = async (sub: any) => {
    setSelectedSub(sub);
    setAiFeedback(null);
    try {
      const res = await api.getSubmissionDetail(sub.id || sub._id);
      if (res.success && res.data) {
        setSelectedSub(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestAiFeedback = async () => {
    if (!selectedSub) return;
    setLoadingAi(true);
    setAiFeedback(null);
    try {
      const res = await api.getAIFeedback(selectedSub.id || selectedSub._id);
      if (res.success && res.data) {
        setAiFeedback(res.data.feedback || res.data);
      } else {
        setAiFeedback('AI could not generate feedback at this time. Please try again.');
      }
    } catch (err: any) {
      setAiFeedback(`Error generating feedback: ${err.message || 'Server error'}`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="submissions-view-container">
      <div className="submissions-header glass-card">
        <div className="title-row">
          <Clock className="header-icon" size={24} />
          <h2>Lịch Sử Nộp Bài</h2>
        </div>
        <p className="subtitle">Xem lại danh sách và trạng thái các bài nộp của bạn trong quá khứ.</p>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="submissions-table-container glass-card">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Mã nộp</th>
                <th>Bài tập</th>
                <th>Ngôn ngữ</th>
                <th>Kết quả</th>
                <th>Thời gian chạy</th>
                <th>Ngày nộp</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">Không tìm thấy lượt nộp bài nào.</td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id || sub._id}>
                    <td className="code-font">{String(sub.id || sub._id).slice(-6)}</td>
                    <td className="bold">{sub.problemId?.title || sub.problem?.title || sub.problemId}</td>
                    <td className="code-font">{sub.language}</td>
                    <td>
                      <span className={`verdict-badge status-${sub.status.toLowerCase()}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{sub.executionTime ? `${sub.executionTime}ms` : 'N/A'}</td>
                    <td>{new Date(sub.createdAt || sub.created_at).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleViewDetail(sub)} className="btn-icon glass-button">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedSub && (
        <div className="submission-detail-overlay">
          <div className="submission-modal glass-card">
            <div className="modal-header">
              <h3>Chi Tiết Lượt Nộp: #{String(selectedSub.id || selectedSub._id).slice(-6)}</h3>
              <button onClick={() => setSelectedSub(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-content">
              <div className="meta-grid">
                <div><strong>Đề bài:</strong> {selectedSub.problemId?.title || selectedSub.problem?.title || selectedSub.problemId}</div>
                <div><strong>Kết quả:</strong> <span className={`verdict-badge status-${selectedSub.status.toLowerCase()}`}>{selectedSub.status}</span></div>
                <div><strong>Ngôn ngữ:</strong> {selectedSub.language}</div>
                <div><strong>Độ khó:</strong> {selectedSub.problemId?.difficulty || selectedSub.problem?.difficulty || 'N/A'}</div>
              </div>

              <h4>Mã nguồn đã nộp:</h4>
              <pre className="code-block code-font"><code>{selectedSub.code}</code></pre>

              <div className="ai-feedback-section">
                <button
                  disabled={loadingAi}
                  onClick={handleRequestAiFeedback}
                  className="btn-ai-feedback glass-button"
                >
                  <Sparkles size={16} />
                  {loadingAi ? 'AI đang phân tích...' : 'Nhận xét code bằng AI (Mock Interview)'}
                </button>

                {aiFeedback && (
                  <div className="ai-feedback-box glass-card">
                    <h5><Sparkles size={14} className="ai-icon" /> AI Feedback:</h5>
                    <p className="ai-feedback-text">{aiFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SubmissionsView;
