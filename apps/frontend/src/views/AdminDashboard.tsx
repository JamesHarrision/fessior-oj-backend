import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Settings, FileText, Calendar, ShieldAlert, Check, X, Plus } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'problems' | 'contests' | 'reports'>('problems');

  // Lists
  const [problems, setProblems] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  // Create form states
  const [probTitle, setProbTitle] = useState('');
  const [probDesc, setProbDesc] = useState('');
  const [probDiff, setProbDiff] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [contestTitle, setContestTitle] = useState('');
  const [contestStart, setContestStart] = useState('');
  const [contestEnd, setContestEnd] = useState('');

  const loadData = async () => {
    try {
      if (activeTab === 'problems') {
        const res = await api.getProblems();
        setProblems(Array.isArray(res.data) ? res.data : (res.data.items || []));
      } else if (activeTab === 'contests') {
        const res = await api.getContests();
        setContests(res.data || []);
      } else if (activeTab === 'reports') {
        const res = await api.getReports();
        setReports(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') loadData();
  }, [activeTab, user]);

  if (user?.role !== 'ADMIN') {
    return <div className="admin-denied glass-card"><h3>Quyền truy cập bị từ chối</h3><p>Bạn không có quyền quản trị để truy cập trang này.</p></div>;
  }

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createProblem({
        title: probTitle,
        description: probDesc,
        difficulty: probDiff,
        timeLimit: 2000,
        memoryLimit: 256,
        starterCodes: { cpp: '// Code cpp', java: '// Code java', python: '# Code python' },
      });
      if (res.success) {
        setProbTitle('');
        setProbDesc('');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo bài tập');
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!window.confirm('Xóa bài tập này?')) return;
    try {
      await api.deleteProblem(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createContest({
        title: contestTitle,
        startTime: new Date(contestStart).toISOString(),
        endTime: new Date(contestEnd).toISOString(),
        problems: [],
      });
      if (res.success) {
        setContestTitle('');
        setContestStart('');
        setContestEnd('');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo kỳ thi');
    }
  };

  const handleDeleteContest = async (id: string) => {
    if (!window.confirm('Xóa kỳ thi này?')) return;
    try {
      await api.deleteContest(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReport = async (reportId: string, status: 'RESOLVED' | 'REJECTED') => {
    try {
      await api.updateReportStatus(reportId, { status });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header glass-card">
        <Settings className="admin-gear-icon" size={24} />
        <h2>Bảng Điều Hướng Quản Trị (Admin Panel)</h2>
      </div>

      <div className="admin-tabs">
        <button onClick={() => setActiveTab('problems')} className={`admin-tab-btn ${activeTab === 'problems' ? 'active' : ''}`}><FileText size={16} /> Đề bài</button>
        <button onClick={() => setActiveTab('contests')} className={`admin-tab-btn ${activeTab === 'contests' ? 'active' : ''}`}><Calendar size={16} /> Kỳ thi</button>
        <button onClick={() => setActiveTab('reports')} className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}><ShieldAlert size={16} /> Báo cáo lỗi</button>
      </div>

      {activeTab === 'problems' && (
        <div className="admin-section-grid">
          <form onSubmit={handleCreateProblem} className="admin-form-card glass-card">
            <h3>Tạo Đề Bài Mới</h3>
            <input type="text" placeholder="Tên bài tập..." value={probTitle} onChange={(e) => setProbTitle(e.target.value)} required className="glass-input" />
            <textarea placeholder="Mô tả đề bài..." value={probDesc} onChange={(e) => setProbDesc(e.target.value)} required className="glass-input" rows={6} />
            <select value={probDiff} onChange={(e: any) => setProbDiff(e.target.value)} className="glass-select">
              <option value="EASY">Dễ (Easy)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="HARD">Khó (Hard)</option>
            </select>
            <button type="submit" className="btn-admin-submit glass-button"><Plus size={16} /> Tạo bài tập</button>
          </form>
          <div className="admin-list-card glass-card">
            <h3>Danh Sách Đề Bài</h3>
            <div className="admin-scroll-list">
              {problems.map((p) => (
                <div key={p.id || p.mongo_problem_id} className="admin-list-item">
                  <span>{p.title} <span className={`diff-pill diff-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span></span>
                  <button onClick={() => handleDeleteProblem(p.id || p.mongo_problem_id)} className="btn-admin-delete"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contests' && (
        <div className="admin-section-grid">
          <form onSubmit={handleCreateContest} className="admin-form-card glass-card">
            <h3>Tạo Kỳ Thi Mới</h3>
            <input type="text" placeholder="Tên kỳ thi..." value={contestTitle} onChange={(e) => setContestTitle(e.target.value)} required className="glass-input" />
            <div className="time-group">
              <label>Bắt đầu: <input type="datetime-local" value={contestStart} onChange={(e) => setContestStart(e.target.value)} required className="glass-input" /></label>
            </div>
            <div className="time-group">
              <label>Kết thúc: <input type="datetime-local" value={contestEnd} onChange={(e) => setContestEnd(e.target.value)} required className="glass-input" /></label>
            </div>
            <button type="submit" className="btn-admin-submit glass-button"><Plus size={16} /> Tạo kỳ thi</button>
          </form>
          <div className="admin-list-card glass-card">
            <h3>Danh Sách Kỳ Thi</h3>
            <div className="admin-scroll-list">
              {contests.map((c) => (
                <div key={c.id} className="admin-list-item">
                  <div><strong>{c.title}</strong><br /><small>{new Date(c.start_time).toLocaleString()} - {new Date(c.end_time).toLocaleString()}</small></div>
                  <button onClick={() => handleDeleteContest(c.id)} className="btn-admin-delete"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="admin-reports-card glass-card">
          <h3>Báo Cáo Sự Cố Từ Người Dùng</h3>
          <div className="reports-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Loại</th><th>Nội dung</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={4} className="empty-cell">Không có báo cáo nào.</td></tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id}>
                      <td><span className={`report-badge type-${r.type.toLowerCase()}`}>{r.type}</span></td>
                      <td className="content-cell">{r.content}</td>
                      <td><span className={`report-status status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                      <td>
                        {r.status === 'PENDING' && (
                          <div className="report-action-buttons">
                            <button onClick={() => handleUpdateReport(r.id, 'RESOLVED')} className="btn-resolve" title="Giải quyết"><Check size={14} /></button>
                            <button onClick={() => handleUpdateReport(r.id, 'REJECTED')} className="btn-reject" title="Từ chối"><X size={14} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
