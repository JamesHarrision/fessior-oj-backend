import React, { useState } from 'react';
import { api } from '../../services/api';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import './ReportForm.css';

interface ReportFormProps {
  problemId?: string;
}

export const ReportForm: React.FC<ReportFormProps> = ({ problemId }) => {
  const [type, setType] = useState<'BUG' | 'TYPO' | 'CHEATING' | 'OTHERS'>('BUG');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.submitReport({
        type,
        content,
        problemId,
      });
      if (res.success) {
        setSuccess(true);
        setContent('');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi báo cáo');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="report-success-card glass-card">
        <CheckCircle size={40} className="success-icon" />
        <h4>Cảm ơn bạn đã báo cáo!</h4>
        <p>Báo cáo của bạn đã được gửi tới Ban quản trị hệ thống để xem xét và xử lý.</p>
        <button onClick={() => setSuccess(false)} className="btn-again glass-button">
          Gửi báo cáo khác
        </button>
      </div>
    );
  }

  return (
    <div className="report-form-container glass-card">
      <div className="report-header">
        <AlertCircle size={18} className="text-warning" />
        <h4>Báo cáo sự cố hoặc vi phạm</h4>
      </div>

      <form onSubmit={handleSubmit} className="actual-report-form">
        <div className="form-group">
          <label>Phân loại:</label>
          <select 
            value={type} 
            onChange={(e: any) => setType(e.target.value)} 
            className="glass-select"
          >
            <option value="BUG">Lỗi hệ thống / Trình biên dịch (Bug)</option>
            <option value="TYPO">Sai sót đề bài / Chính tả (Typo)</option>
            <option value="CHEATING">Nghi ngờ gian lận (Cheating)</option>
            <option value="OTHERS">Vấn đề khác (Others)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nội dung chi tiết:</label>
          <textarea
            placeholder="Mô tả cụ thể sự cố hoặc hành vi bạn phát hiện..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="glass-input report-textarea"
            rows={5}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button 
          type="submit" 
          disabled={loading || content.trim().length < 5} 
          className="btn-submit-report glass-button"
        >
          <Send size={16} />
          <span>{loading ? 'Đang gửi...' : 'Gửi báo cáo'}</span>
        </button>
      </form>
    </div>
  );
};
export default ReportForm;
