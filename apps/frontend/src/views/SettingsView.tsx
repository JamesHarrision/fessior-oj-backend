import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wrench, Send } from 'lucide-react';
import './SettingsView.css';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
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
    <div className="settings-view glass-card">
      <div className="settings-header">
        <Wrench size={28} className="glow-icon-purple" />
        <h2>Thiết Lập & Lịch Sử</h2>
        <p>Xem lịch sử đấu, báo cáo lỗi và quản lý tài khoản</p>
      </div>

      <div className="settings-content">
        <div className="history-section">
          <h3>🏆 Lịch Sử Đấu (Match History)</h3>
          {historyLoading ? (
            <p className="loading-txt">Đang tải lịch sử đấu...</p>
          ) : history.length === 0 ? (
            <p className="no-history-txt">Bạn chưa tham gia trận đấu nào.</p>
          ) : (
            <div className="history-list">
              {history.map((m) => {
                const isWinner = m.winnerId === user?.id;
                const isDraw = m.status === 'DRAW';
                const eloChange = m.eloUpdates?.[user?.id || '']?.change || 0;
                const date = new Date(m.createdAt || m.endedAt).toLocaleDateString();
                const opponentName = m.player1?.userId === user?.id ? m.player2?.username : m.player1?.username;

                return (
                  <div key={m.id || m._id} className="history-card">
                    <div className="history-meta">
                      <span className={`outcome-badge ${isWinner ? 'win' : isDraw ? 'draw' : 'lose'}`}>
                        {isWinner ? 'THẮNG' : isDraw ? 'HÒA' : 'THUA'}
                      </span>
                      <span className="history-opp">đối đầu với <strong>{opponentName || 'Đấu thủ'}</strong></span>
                    </div>
                    <div className="history-stats">
                      <span>{date}</span>
                      <span className={`elo-diff ${eloChange >= 0 ? 'plus' : 'minus'}`}>
                        {eloChange >= 0 ? `+${eloChange}` : eloChange} ELO
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
