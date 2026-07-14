import React, { useEffect, useState } from 'react';
import { Trash2, Heart, Plus, Edit2 } from 'lucide-react';
import { api } from '../../services/api';
import type { IProblem } from '@ocj/types';
import { AdminCard, AdminHeader, AdminButton, AdminInput, AdminSelect, AdminTextarea, AdminListRow, AdminFormGroup } from './ui/AdminUI';

export const AdminCommentsTab: React.FC = () => {
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Editing comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchProblems = async () => {
    try {
      const res = await api.getProblems();
      const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
      setProblems(items);
      if (items.length > 0) {
        setSelectedProblemId(items[0].id || items[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async (probId: string) => {
    if (!probId) return;
    setLoading(true);
    try {
      const res = await api.getComments(probId, 'PROBLEM');
      if (res.success) {
        setComments(res.data?.items || res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (selectedProblemId) {
      fetchComments(selectedProblemId);
    }
  }, [selectedProblemId]);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.createComment({
        targetId: selectedProblemId,
        targetType: 'PROBLEM',
        content: newComment.trim()
      });
      if (res.success) {
        setNewComment('');
        fetchComments(selectedProblemId);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm bình luận');
    }
  };

  const handleUpdateComment = async (cid: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await api.updateComment(cid, { content: editContent.trim() });
      if (res.success) {
        setEditingCommentId(null);
        setEditContent('');
        fetchComments(selectedProblemId);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật bình luận');
    }
  };

  const handleDeleteComment = async (cid: string) => {
    if (!window.confirm('Xóa bình luận này? Thao tác này không thể hoàn tác.')) return;
    try {
      const res = await api.deleteComment(cid);
      if (res.success) {
        setComments(prev => prev.filter(c => c.id !== cid && c._id !== cid));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa bình luận');
    }
  };

  const handleLike = async (cid: string) => {
    try {
      const res = await api.toggleLikeComment(cid);
      if (res.success) {
        fetchComments(selectedProblemId);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi thích bình luận');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left side: Problem selector & comment creator */}
      <div className="flex flex-col gap-6">
        <AdminCard>
          <AdminHeader>Chọn Chủ Đề Thảo Luận</AdminHeader>
          <AdminFormGroup label="Chọn Bài Tập" className="mt-2">
            <AdminSelect
              value={selectedProblemId}
              onChange={e => setSelectedProblemId(e.target.value)}
            >
              {problems.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.title}</option>
              ))}
            </AdminSelect>
          </AdminFormGroup>
        </AdminCard>

        <AdminCard>
          <AdminHeader>Đăng Bình Luận Quản Trị</AdminHeader>
          <form onSubmit={handleCreateComment} className="flex flex-col gap-4 mt-2">
            <AdminTextarea
              placeholder="Nhập nội dung thảo luận hoặc thông báo..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={4}
              required
            />
            <AdminButton type="submit">
              <Plus size={14} /> Đăng bình luận
            </AdminButton>
          </form>
        </AdminCard>
      </div>

      {/* Right side: Comments list & Moderation actions */}
      <AdminCard>
        <AdminHeader>Điều Phối Bình Luận (Moderation)</AdminHeader>
        <div className="flex flex-col gap-3 max-h-[680px] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-stone text-sm">Đang tải bình luận...</p>
          ) : comments.length === 0 ? (
            <p className="text-stone text-sm">Không có bình luận nào cho bài tập này.</p>
          ) : (
            comments.map((c, idx) => {
              const cid = c.id || c._id;
              const isEditing = editingCommentId === cid;
              return (
                <AdminListRow key={cid || idx} className="items-start">
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-xs text-stone font-display tracking-wider uppercase font-semibold">
                      Người dùng: <span className="text-linen">{c.userId || c.user?.username || 'User'}</span>
                    </span>
                    
                    {isEditing ? (
                      <div className="flex gap-2 w-full mt-1">
                        <AdminInput
                          type="text"
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="flex-1 min-w-0"
                        />
                        <AdminButton variant="primary" onClick={() => handleUpdateComment(cid)} className="px-3">
                          Lưu
                        </AdminButton>
                        <AdminButton variant="secondary" onClick={() => setEditingCommentId(null)} className="px-3">
                          Hủy
                        </AdminButton>
                      </div>
                    ) : (
                      <p className="text-sm text-surface-300 leading-relaxed m-0">
                        {c.content}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1">
                      <button 
                        onClick={() => handleLike(cid)} 
                        className="bg-transparent border-none flex items-center gap-1.5 text-rose-400 cursor-pointer p-0 hover:text-rose-300 transition-colors"
                      >
                        <Heart size={12} fill={c.likes?.length ? 'currentColor' : 'none'} />
                        <span className="text-xs font-semibold">{c.likes?.length || 0} Thích</span>
                      </button>
                      <span className="text-[11px] text-stone">
                        {new Date(c.createdAt || c.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 self-start ml-2">
                    {!isEditing && (
                      <AdminButton 
                        variant="icon-edit" 
                        onClick={() => { setEditingCommentId(cid); setEditContent(c.content); }} 
                        title="Sửa nội dung"
                      >
                        <Edit2 size={14} />
                      </AdminButton>
                    )}
                    <AdminButton variant="icon-delete" onClick={() => handleDeleteComment(cid)} title="Xóa bình luận">
                      <Trash2 size={14} />
                    </AdminButton>
                  </div>
                </AdminListRow>
              );
            })
          )}
        </div>
      </AdminCard>
    </div>
  );
};
