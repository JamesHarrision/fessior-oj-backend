import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Calendar, Trophy, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import type { IContest, IProblem } from '@ocj/types';
import './AdminProblemsTab.css'; // Reuse form/modal styles

interface AdminContestsTabProps {
  contestTitle: string;
  setContestTitle: (val: string) => void;
  contestStart: string;
  setContestStart: (val: string) => void;
  contestEnd: string;
  setContestEnd: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  contests: IContest[];
  onDelete: (id: string) => void;
}

export const AdminContestsTab: React.FC<AdminContestsTabProps> = ({
  contestTitle,
  setContestTitle,
  contestStart,
  setContestStart,
  contestEnd,
  setContestEnd,
  onSubmit,
  contests,
  onDelete,
}) => {
  const [editingContest, setEditingContest] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'problems' | 'leaderboard'>('info');

  // Edit details states
  const [editTitle, setEditTitle] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editProblems, setEditProblems] = useState<string[]>([]);
  
  // Contest data lists
  const [allProblems, setAllProblems] = useState<IProblem[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    // Load problems for contest problem association
    const fetchAllProblems = async () => {
      try {
        const res = await api.getProblems();
        setAllProblems(Array.isArray(res.data) ? res.data : (res.data.items || []));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllProblems();
  }, []);

  const openEditModal = async (contest: any) => {
    setEditingContest(contest);
    setModalTab('info');
    setEditTitle(contest.title || '');
    
    // Format date string to local datetime-local format
    const startStr = new Date(contest.start_time || contest.startTime).toISOString().slice(0, 16);
    const endStr = new Date(contest.end_time || contest.endTime).toISOString().slice(0, 16);
    setEditStart(startStr);
    setEditEnd(endStr);

    const problemIds = contest.problems ? contest.problems.map((p: any) => p.id || p._id || p) : [];
    setEditProblems(problemIds);

    // Fetch leaderboard
    const cid = contest.id || contest._id;
    if (cid) {
      setLeaderboardLoading(true);
      try {
        const lbRes = await api.getContestLeaderboard(cid);
        if (lbRes.success) {
          setLeaderboard(lbRes.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải bảng xếp hạng giải đấu:', err);
      } finally {
        setLeaderboardLoading(false);
      }
    }
  };

  const handleSaveContest = async () => {
    if (!editingContest) return;
    const cid = editingContest.id || editingContest._id;
    if (!cid) return;

    try {
      const res = await api.updateContest(cid, {
        title: editTitle,
        startTime: new Date(editStart).toISOString(),
        endTime: new Date(editEnd).toISOString(),
        problems: editProblems,
      });

      if (res.success) {
        alert('Cập nhật kỳ thi thành công!');
        setEditingContest(null);
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu thông tin kỳ thi');
    }
  };

  const handleToggleProblem = (pid: string) => {
    setEditProblems(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const handleRegisterTest = async (cid: string) => {
    try {
      const res = await api.registerContest(cid);
      if (res.success) {
        alert('Đăng ký tham gia kỳ thi thành công!');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đăng ký');
    }
  };

  const handleUnregisterTest = async (cid: string) => {
    try {
      const res = await api.unregisterContest(cid);
      if (res.success) {
        alert('Hủy đăng ký thành công!');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy đăng ký');
    }
  };

  return (
    <>
      <div className="problems-tab-grid">
        {/* Left Side: Create Contest */}
        <form onSubmit={onSubmit} className="prob-admin-card">
          <h3>Tạo Kỳ Thi Mới</h3>
          <input
            type="text"
            placeholder="Tên kỳ thi..."
            value={contestTitle}
            onChange={(e) => setContestTitle(e.target.value)}
            required
            className="prob-admin-input"
          />
          <div className="prob-form-group">
            <label><Calendar size={14} /> Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              value={contestStart}
              onChange={(e) => setContestStart(e.target.value)}
              required
              className="prob-admin-input"
            />
          </div>
          <div className="prob-form-group">
            <label><Calendar size={14} /> Thời gian kết thúc</label>
            <input
              type="datetime-local"
              value={contestEnd}
              onChange={(e) => setContestEnd(e.target.value)}
              required
              className="prob-admin-input"
            />
          </div>
          <button type="submit" className="btn-prob-primary">
            <Plus size={16} /> Tạo kỳ thi
          </button>
        </form>

        {/* Right Side: List Contests */}
        <div className="prob-admin-card">
          <h3>Danh Sách Kỳ Thi</h3>
          <div className="prob-list-scroll">
            {contests.map((c) => {
              const cid = c.id || (c as any)._id;
              return (
                <div key={cid} className="prob-item-row">
                  <div className="prob-item-details">
                    <span className="prob-item-title">{c.title}</span>
                    <div className="prob-item-meta">
                      <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                        Bắt đầu: {new Date(c.start_time || (c as any).startTime).toLocaleString()}
                      </span>
                      <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                        Kết thúc: {new Date(c.end_time || (c as any).endTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="action-btn-container">
                    <button
                      onClick={() => handleRegisterTest(cid)}
                      className="prob-tag-pill"
                      style={{ fontSize: '0.7rem', borderColor: '#34d399', color: '#34d399', cursor: 'pointer' }}
                      title="Đăng ký test"
                    >
                      Đăng Ký
                    </button>
                    <button
                      onClick={() => handleUnregisterTest(cid)}
                      className="prob-tag-pill"
                      style={{ fontSize: '0.7rem', borderColor: '#f87171', color: '#f87171', cursor: 'pointer' }}
                      title="Hủy đăng ký test"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => openEditModal(c)}
                      className="btn-action-icon edit"
                      title="Chỉnh sửa kỳ thi"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(cid)}
                      className="btn-action-icon delete"
                      title="Xóa kỳ thi"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Contest Modal */}
      {editingContest && (
        <div className="problems-modal-overlay">
          <div className="problems-modal-card">
            <div className="problems-modal-header">
              <h3>Chỉnh Sửa Giải Đấu: {editingContest.title}</h3>
              <button onClick={() => setEditingContest(null)} className="problems-modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="problems-modal-tabs">
              <button
                className={`problems-modal-tab-btn ${modalTab === 'info' ? 'active' : ''}`}
                onClick={() => setModalTab('info')}
              >
                <Calendar size={16} /> Cấu hình cơ bản
              </button>
              <button
                className={`problems-modal-tab-btn ${modalTab === 'problems' ? 'active' : ''}`}
                onClick={() => setModalTab('problems')}
              >
                <BookOpen size={16} /> Chọn đề thi ({editProblems.length})
              </button>
              <button
                className={`problems-modal-tab-btn ${modalTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setModalTab('leaderboard')}
              >
                <Trophy size={16} /> Bảng xếp hạng
              </button>
            </div>

            <div className="problems-modal-content">
              {modalTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="prob-form-group">
                    <label>Tên giải đấu</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="prob-admin-input"
                      required
                    />
                  </div>

                  <div className="prob-form-grid-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="prob-form-group">
                      <label>Thời gian bắt đầu</label>
                      <input
                        type="datetime-local"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="prob-admin-input"
                        required
                      />
                    </div>

                    <div className="prob-form-group">
                      <label>Thời gian kết thúc</label>
                      <input
                        type="datetime-local"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="prob-admin-input"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'problems' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>Gán bài tập vào kỳ thi</h4>
                  <div className="tag-selector-grid" style={{ gridTemplateColumns: '1fr' }}>
                    {allProblems.map(p => {
                      const pid = p.id || (p as any)._id;
                      const isChecked = editProblems.includes(pid);
                      return (
                        <label key={pid} className={`tag-checkbox-pill ${isChecked ? 'selected' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleProblem(pid)}
                              style={{ display: 'none' }}
                            />
                            {p.title}
                          </span>
                          <span className={`diff-pill diff-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {modalTab === 'leaderboard' && (
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px' }}><Trophy size={14} /> Xếp Hạng Người Tham Gia</h4>
                  {leaderboardLoading ? (
                    <p>Đang tải bảng xếp hạng...</p>
                  ) : leaderboard.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Chưa có người chơi nào nộp bài giải đấu.</p>
                  ) : (
                    <div className="tc-list-scroll">
                      {leaderboard.map((u, idx) => (
                        <div key={idx} className="tc-item-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 700, color: '#fbbf24' }}>#{idx + 1}</span>
                            <span style={{ color: '#fff' }}>{u.username || u.userId || 'User'}</span>
                          </div>
                          <span className="diff-pill diff-easy" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                            {u.score || 0} điểm
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="problems-modal-footer">
              <button onClick={() => setEditingContest(null)} className="btn-prob-secondary">
                Hủy
              </button>
              <button onClick={handleSaveContest} className="btn-prob-primary">
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

