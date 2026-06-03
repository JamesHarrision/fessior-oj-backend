import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Trash2, Eye, Award } from 'lucide-react';
import { api } from '../../services/api';

export const AdminMatchesTab: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getMatchHistory();
      if (res.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInspect = async (mid: string) => {
    try {
      const res = await api.getMatchDetails(mid);
      if (res.success) {
        setSelectedMatch(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tải chi tiết trận đấu');
    }
  };

  const handleDelete = async (mid: string) => {
    if (!window.confirm('Xóa bản ghi trận đấu này? Lệnh này sẽ loại bỏ hoàn toàn lịch sử đấu.')) return;
    try {
      const res = await api.deleteMatch(mid);
      if (res.success) {
        setHistory(prev => prev.filter(m => m.id !== mid && m._id !== mid));
        if (selectedMatch?.id === mid || selectedMatch?._id === mid) {
          setSelectedMatch(null);
        }
        alert('Đã xóa trận đấu thành công.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa trận đấu');
    }
  };

  return (
    <div className="problems-tab-grid">
      {/* Left side: List Match History */}
      <div className="prob-admin-card" style={{ flex: 1 }}>
        <h3>Lịch Sử Trận Đấu Toàn Hệ Thống</h3>
        <div className="prob-list-scroll">
          {loading ? (
            <p>Đang tải...</p>
          ) : history.length === 0 ? (
            <p style={{ color: '#64748b' }}>Chưa có trận đấu nào được lưu trữ.</p>
          ) : (
            history.map((m, idx) => {
              const mid = m.id || m._id;
              return (
                <div key={mid || idx} className="prob-item-row">
                  <div className="prob-item-details">
                    <span className="prob-item-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Trophy size={14} style={{ color: '#fbbf24' }} />
                      Trận Đấu #{mid?.slice(-6)}
                    </span>
                    <div className="prob-item-meta">
                      <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                        Trạng thái: {m.status || 'FINISHED'}
                      </span>
                      <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                        {new Date(m.createdAt || m.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="action-btn-container">
                    <button onClick={() => handleInspect(mid)} className="btn-action-icon edit" title="Xem chi tiết trận đấu">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleDelete(mid)} className="btn-action-icon delete" title="Xóa bản ghi">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right side: Detailed View */}
      <div className="prob-admin-card">
        <h3>Chi Tiết Trận Đấu</h3>
        {selectedMatch ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <div><strong>Mã trận đấu:</strong> {selectedMatch.id || selectedMatch._id}</div>
            <div><strong>Trạng thái:</strong> <span className="diff-pill diff-easy">{selectedMatch.status}</span></div>
            <div><strong>Bài tập:</strong> {selectedMatch.problemId?.title || 'Hai Sum'}</div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={14} /> Danh sách người chơi</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedMatch.players || []).map((p: any, index: number) => (
                  <div key={index} style={{ background: 'rgba(15,23,42,0.4)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div><strong>User ID:</strong> {p.userId || p.user_id || p}</div>
                    <div><strong>Điểm số:</strong> {p.score !== undefined ? p.score : 0} điểm</div>
                    {p.eloChange !== undefined && (
                      <div style={{ color: p.eloChange >= 0 ? '#34d399' : '#f87171' }}>
                        <strong>Thay đổi ELO:</strong> {p.eloChange >= 0 ? `+${p.eloChange}` : p.eloChange}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>
              <div>Bắt đầu: {new Date(selectedMatch.createdAt || selectedMatch.created_at).toLocaleString()}</div>
              {selectedMatch.updatedAt && <div>Kết thúc: {new Date(selectedMatch.updatedAt).toLocaleString()}</div>}
            </div>
          </div>
        ) : (
          <p style={{ color: '#64748b' }}>Nhấp vào biểu tượng con mắt ở danh sách để xem chi tiết trận đấu và người chơi.</p>
        )}
      </div>
    </div>
  );
};
