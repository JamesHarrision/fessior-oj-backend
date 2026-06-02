import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Settings, FileText, Calendar, ShieldAlert } from 'lucide-react';
import { AdminProblemsTab } from '../components/admin/AdminProblemsTab';
import { AdminContestsTab } from '../components/admin/AdminContestsTab';
import { AdminReportsTab } from '../components/admin/AdminReportsTab';
import type { IProblem, IContest, IReport } from '@ocj/types';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'problems' | 'contests' | 'reports'>('problems');

  // Lists
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [contests, setContests] = useState<IContest[]>([]);
  const [reports, setReports] = useState<IReport[]>([]);

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
    return (
      <div className="admin-denied glass-card">
        <h3>Quyền truy cập bị từ chối</h3>
        <p>Bạn không có quyền quản trị để truy cập trang này.</p>
      </div>
    );
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
        <button
          onClick={() => setActiveTab('problems')}
          className={`admin-tab-btn ${activeTab === 'problems' ? 'active' : ''}`}
        >
          <FileText size={16} /> Đề bài
        </button>
        <button
          onClick={() => setActiveTab('contests')}
          className={`admin-tab-btn ${activeTab === 'contests' ? 'active' : ''}`}
        >
          <Calendar size={16} /> Kỳ thi
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
        >
          <ShieldAlert size={16} /> Báo cáo lỗi
        </button>
      </div>

      {activeTab === 'problems' && (
        <AdminProblemsTab
          probTitle={probTitle}
          setProbTitle={setProbTitle}
          probDesc={probDesc}
          setProbDesc={setProbDesc}
          probDiff={probDiff}
          setProbDiff={setProbDiff}
          onSubmit={handleCreateProblem}
          problems={problems}
          onDelete={handleDeleteProblem}
        />
      )}

      {activeTab === 'contests' && (
        <AdminContestsTab
          contestTitle={contestTitle}
          setContestTitle={setContestTitle}
          contestStart={contestStart}
          setContestStart={setContestStart}
          contestEnd={contestEnd}
          setContestEnd={setContestEnd}
          onSubmit={handleCreateContest}
          contests={contests}
          onDelete={handleDeleteContest}
        />
      )}

      {activeTab === 'reports' && (
        <AdminReportsTab reports={reports} onUpdateStatus={handleUpdateReport} />
      )}
    </div>
  );
};

export default AdminDashboard;
