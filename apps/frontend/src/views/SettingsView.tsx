import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wrench, Send } from 'lucide-react';
import './SettingsView.css';

export const SettingsView: React.FC = () => {
  const { logout } = useAuth();
  const [reportType, setReportType] = useState('BUG');
  const [content, setContent] = useState('');
  const [problemId, setProblemId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
        setMessage('Báo cáo đã được gửi tới Ban quản trị. Cảm ơn sự đóng góp của bạn!');
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
    <div className="settings-view glass-card">
      <div className="settings-header">
        <Wrench size={28} className="glow-icon-purple" />
        <h2>Công cụ & Báo cáo</h2>
        <p>Gửi phản hồi cho Ban quản trị hoặc đăng xuất khỏi hệ thống</p>
      </div>

      <div className="settings-content">
        <div className="report-section">
          <h3>Gửi Báo Cáo / Phản Hồi</h3>
          <form onSubmit={handleSubmitReport} className="report-form">
            <div className="form-group">
              <label>Loại báo cáo</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="report-select"
              >
                <option value="BUG">Lỗi hệ thống (Bug)</option>
                <option value="FEEDBACK">Góp ý tính năng (Feedback)</option>
                <option value="PLAGIARISM">Báo cáo gian lận (Plagiarism)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mã đề bài (Tùy chọn)</label>
              <input
                type="text"
                placeholder="Ví dụ: two-sum"
                value={problemId}
                onChange={(e) => setProblemId(e.target.value)}
                className="report-input-field"
              />
            </div>

            <div className="form-group">
              <label>Nội dung chi tiết</label>
              <textarea
                placeholder="Mô tả chi tiết lỗi hoặc góp ý của bạn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="report-textarea-field"
                required
              />
            </div>

            <button type="submit" className="submit-report-btn" disabled={loading}>
              <Send size={14} /> {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </form>
          {message && <p className="report-msg-feedback">{message}</p>}
        </div>

        <div className="account-section">
          <h3>Tài Khoản</h3>
          <button onClick={logout} className="logout-btn">
            Đăng xuất khỏi Arena
          </button>
        </div>
      </div>
    </div>
  );
};
