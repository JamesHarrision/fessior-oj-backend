import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Settings,
  FileText,
  Calendar,
  ShieldAlert,
  Shield,
  FileCode,
  Trophy,
  Users,
  Sparkles,
  MessageSquare,
  ShoppingBag,
  Bell,
  Activity,
  X
} from 'lucide-react';

import { AdminAuthTab } from '../components/admin/AdminAuthTab';
import { AdminProblemsTab } from '../components/admin/AdminProblemsTab';
import { AdminSubmissionsTab } from '../components/admin/AdminSubmissionsTab';
import { AdminMatchesTab } from '../components/admin/AdminMatchesTab';
import { AdminRoomsTab } from '../components/admin/AdminRoomsTab';
import { AdminAiTab } from '../components/admin/AdminAiTab';
import { AdminContestsTab } from '../components/admin/AdminContestsTab';
import { AdminCommentsTab } from '../components/admin/AdminCommentsTab';
import { AdminFriendsTab } from '../components/admin/AdminFriendsTab';
import { AdminShopTab } from '../components/admin/AdminShopTab';
import { AdminLeaderboardTab } from '../components/admin/AdminLeaderboardTab';
import { AdminNotificationsTab } from '../components/admin/AdminNotificationsTab';
import { AdminReportsTab } from '../components/admin/AdminReportsTab';
import { AdminNewsTab } from '../components/admin/AdminNewsTab';

import type { IProblem, IContest, IReport, ProblemDifficulty } from '@ocj/types';

interface AdminDashboardProps {
  currentSubView: string;
  onViewChange: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentSubView, onViewChange }) => {
  const { user } = useAuth();
  
  // Extract active tab from routing segment (e.g. admin/problems -> problems)
  const activeTab = currentSubView.split('/')[1] || 'problems';

  // Lists
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [contests, setContests] = useState<IContest[]>([]);
  const [reports, setReports] = useState<IReport[]>([]);

  // Create form states
  const [probTitle, setProbTitle] = useState('');
  const [probDesc, setProbDesc] = useState('');
  const [probDiff, setProbDiff] = useState<ProblemDifficulty>('EASY');
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
        setReports(res.data?.items || []);
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
      <div className="flex flex-col items-center justify-center p-20 bg-ink border border-charcoal">
        <h3 className="font-display text-2xl font-bold text-vermilion uppercase tracking-wider mb-2">Quyền truy cập bị từ chối</h3>
        <p className="font-body text-stone">Bạn không có quyền quản trị để truy cập trang này.</p>
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
      await api.updateReportStatus(reportId, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const tabsList = [
    { id: 'auth', label: 'Xác thực & Tài khoản', icon: Shield },
    { id: 'problems', label: 'Bài tập & Testcase', icon: FileText },
    { id: 'submissions', label: 'Nộp bài & Chấm bài', icon: FileCode },
    { id: 'matches', label: 'Đấu Solo & Lịch sử', icon: Trophy },
    { id: 'rooms', label: 'Phòng đấu PVP Custom', icon: Users },
    { id: 'ai', label: 'Trí tuệ Nhân tạo AI', icon: Sparkles },
    { id: 'contests', label: 'Giải đấu chính thức', icon: Calendar },
    { id: 'comments', label: 'Thảo luận & Bình luận', icon: MessageSquare },
    { id: 'friends', label: 'Bạn bè & Mạng xã hội', icon: Users },
    { id: 'shop', label: 'Cửa hàng vật phẩm', icon: ShoppingBag },
    { id: 'leaderboard', label: 'Bảng xếp hạng chung', icon: Activity },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'reports', label: 'Báo cáo & Tố cáo', icon: ShieldAlert },
    { id: 'news', label: 'Tin tức & Thông báo', icon: Bell },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="bg-washi border border-charcoal p-4 lg:p-6 flex items-center gap-4 shrink-0">
        <div className="bg-ink p-3 border border-charcoal">
          <Settings size={28} className="text-vermilion animate-[spin_10s_linear_infinite]" />
        </div>
        <div>
          <h2 className="font-display text-xl lg:text-2xl font-bold text-linen uppercase tracking-wider">Bảng Quản Trị Hệ Thống (Admin Panel)</h2>
        </div>
      </div>

      {/* Layout Wrapper */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-[280px] bg-washi border border-charcoal flex flex-col shrink-0 overflow-y-auto">
          <div className="flex flex-col p-2 gap-1 flex-1">
            {tabsList.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onViewChange(`admin/${tab.id}`)}
                  className={`flex items-center gap-3 px-4 py-3 font-display text-xs font-bold uppercase tracking-wider transition-colors border-l-[3px] ${
                    isActive
                      ? 'border-l-vermilion bg-ink text-vermilion'
                      : 'border-l-transparent text-stone hover:bg-ink/50 hover:text-linen'
                  }`}
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-charcoal">
            <button
              onClick={() => onViewChange('match')}
              className="w-full flex items-center justify-center gap-2 font-display text-xs font-bold uppercase tracking-wider px-4 py-3 border border-vermilion/50 text-vermilion hover:bg-vermilion hover:text-linen transition-colors"
            >
              <X size={16} />
              <span>Thoát Admin</span>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-washi border border-charcoal p-6 overflow-y-auto relative min-h-[400px]">
          {activeTab === 'auth' && <AdminAuthTab />}
          
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

          {activeTab === 'submissions' && <AdminSubmissionsTab />}

          {activeTab === 'matches' && <AdminMatchesTab />}

          {activeTab === 'rooms' && <AdminRoomsTab />}

          {activeTab === 'ai' && <AdminAiTab />}

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

          {activeTab === 'comments' && <AdminCommentsTab />}

          {activeTab === 'friends' && <AdminFriendsTab />}

          {activeTab === 'shop' && <AdminShopTab />}

          {activeTab === 'leaderboard' && <AdminLeaderboardTab />}

          {activeTab === 'notifications' && <AdminNotificationsTab />}

          {activeTab === 'reports' && (
            <AdminReportsTab reports={reports} onUpdateStatus={handleUpdateReport} />
          )}

          {activeTab === 'news' && <AdminNewsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
