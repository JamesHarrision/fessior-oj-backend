import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Calendar, Trophy, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import type { IContest, IProblem } from '@ocj/types';
import { AdminCard, AdminHeader, AdminButton, AdminInput, AdminFormGroup, AdminListRow, AdminBadge } from './ui/AdminUI';

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side: Create Contest */}
        <AdminCard>
          <AdminHeader>Tạo Kỳ Thi Mới</AdminHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
            <AdminFormGroup label="Tên kỳ thi">
              <AdminInput
                type="text"
                placeholder="Tên kỳ thi..."
                value={contestTitle}
                onChange={(e) => setContestTitle(e.target.value)}
                required
              />
            </AdminFormGroup>
            <div className="grid grid-cols-2 gap-4">
              <AdminFormGroup label={<span className="flex items-center gap-1.5"><Calendar size={14} /> Thời gian bắt đầu</span>}>
                <AdminInput
                  type="datetime-local"
                  value={contestStart}
                  onChange={(e) => setContestStart(e.target.value)}
                  required
                />
              </AdminFormGroup>
              <AdminFormGroup label={<span className="flex items-center gap-1.5"><Calendar size={14} /> Thời gian kết thúc</span>}>
                <AdminInput
                  type="datetime-local"
                  value={contestEnd}
                  onChange={(e) => setContestEnd(e.target.value)}
                  required
                />
              </AdminFormGroup>
            </div>
            <AdminButton type="submit" className="mt-2">
              <Plus size={16} /> Tạo kỳ thi
            </AdminButton>
          </form>
        </AdminCard>

        {/* Right Side: List Contests */}
        <AdminCard>
          <AdminHeader>Danh Sách Kỳ Thi</AdminHeader>
          <div className="flex flex-col gap-3 max-h-[800px] overflow-y-auto pr-1">
            {contests.length === 0 ? (
              <p className="text-stone text-sm">Chưa có kỳ thi nào.</p>
            ) : (
              contests.map((c) => {
                const cid = c.id || (c as any)._id;
                return (
                  <AdminListRow key={cid} className="items-start">
                    <div className="flex flex-col gap-1.5 w-full">
                      <span className="font-display font-semibold text-linen m-0">{c.title}</span>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs text-stone uppercase tracking-wider font-semibold">
                          Bắt đầu: <span className="text-linen/80">{new Date(c.start_time || (c as any).startTime).toLocaleString()}</span>
                        </span>
                        <span className="text-xs text-stone uppercase tracking-wider font-semibold">
                          Kết thúc: <span className="text-linen/80">{new Date(c.end_time || (c as any).endTime).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap justify-end sm:flex-nowrap items-start mt-2 sm:mt-0 sm:ml-4">
                      <button
                        onClick={() => handleRegisterTest(cid)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors whitespace-nowrap"
                        title="Đăng ký test"
                      >
                        Đăng Ký
                      </button>
                      <button
                        onClick={() => handleUnregisterTest(cid)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap"
                        title="Hủy đăng ký test"
                      >
                        Hủy
                      </button>
                      <AdminButton
                        variant="icon-edit"
                        onClick={() => openEditModal(c)}
                        title="Chỉnh sửa kỳ thi"
                      >
                        <Edit size={14} />
                      </AdminButton>
                      <AdminButton
                        variant="icon-delete"
                        onClick={() => onDelete(cid)}
                        title="Xóa kỳ thi"
                      >
                        <X size={14} />
                      </AdminButton>
                    </div>
                  </AdminListRow>
                );
              })
            )}
          </div>
        </AdminCard>
      </div>

      {/* Edit Contest Modal */}
      {editingContest && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-ink border border-charcoal rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-charcoal bg-washi/50">
              <h3 className="font-display font-bold text-linen text-lg m-0 truncate pr-4">Chỉnh Sửa Giải Đấu: {editingContest.title}</h3>
              <button onClick={() => setEditingContest(null)} className="text-stone hover:text-rose-400 transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-charcoal bg-washi/30 overflow-x-auto">
              <button
                className={`flex items-center gap-2 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${modalTab === 'info' ? 'text-vermilion border-vermilion bg-vermilion/5' : 'text-stone border-transparent hover:text-linen hover:bg-charcoal/30'}`}
                onClick={() => setModalTab('info')}
              >
                <Calendar size={16} /> Cấu hình cơ bản
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${modalTab === 'problems' ? 'text-vermilion border-vermilion bg-vermilion/5' : 'text-stone border-transparent hover:text-linen hover:bg-charcoal/30'}`}
                onClick={() => setModalTab('problems')}
              >
                <BookOpen size={16} /> Chọn đề thi ({editProblems.length})
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${modalTab === 'leaderboard' ? 'text-vermilion border-vermilion bg-vermilion/5' : 'text-stone border-transparent hover:text-linen hover:bg-charcoal/30'}`}
                onClick={() => setModalTab('leaderboard')}
              >
                <Trophy size={16} /> Bảng xếp hạng
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-ink">
              {modalTab === 'info' && (
                <div className="flex flex-col gap-6">
                  <AdminFormGroup label="Tên giải đấu">
                    <AdminInput
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                  </AdminFormGroup>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdminFormGroup label="Thời gian bắt đầu">
                      <AdminInput
                        type="datetime-local"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        required
                      />
                    </AdminFormGroup>

                    <AdminFormGroup label="Thời gian kết thúc">
                      <AdminInput
                        type="datetime-local"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        required
                      />
                    </AdminFormGroup>
                  </div>
                </div>
              )}

              {modalTab === 'problems' && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-linen font-display font-semibold text-sm uppercase tracking-wider mb-2">Gán bài tập vào kỳ thi</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {allProblems.map(p => {
                      const pid = p.id || (p as any)._id;
                      const isChecked = editProblems.includes(pid);
                      return (
                        <label key={pid} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-vermilion/10 border-vermilion/50 text-linen' : 'bg-washi/30 border-charcoal/50 text-stone hover:bg-washi/50'}`}>
                          <span className="flex items-center gap-3 font-body text-sm font-medium">
                            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${isChecked ? 'bg-vermilion border-vermilion' : 'border-stone/50 bg-ink'}`}>
                              {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleProblem(pid)}
                              className="hidden"
                            />
                            {p.title}
                          </span>
                          <AdminBadge color={
                            p.difficulty?.toUpperCase() === 'EASY' ? 'green' :
                            p.difficulty?.toUpperCase() === 'MEDIUM' ? 'yellow' :
                            'red'
                          }>
                            {p.difficulty}
                          </AdminBadge>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {modalTab === 'leaderboard' && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-linen font-display font-semibold text-sm uppercase tracking-wider mb-2 flex items-center gap-2"><Trophy size={14} /> Xếp Hạng Người Tham Gia</h4>
                  {leaderboardLoading ? (
                    <p className="text-stone text-sm">Đang tải bảng xếp hạng...</p>
                  ) : leaderboard.length === 0 ? (
                    <p className="text-stone text-sm">Chưa có người chơi nào nộp bài giải đấu.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {leaderboard.map((u, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-washi/30 border border-charcoal/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-yellow-400">#{idx + 1}</span>
                            <span className="text-linen font-medium text-sm">{u.username || u.userId || 'User'}</span>
                          </div>
                          <AdminBadge color="blue">
                            {u.score || 0} điểm
                          </AdminBadge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-charcoal bg-washi/50">
              <AdminButton variant="secondary" onClick={() => setEditingContest(null)}>
                Hủy
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSaveContest}>
                Lưu Thay Đổi
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

