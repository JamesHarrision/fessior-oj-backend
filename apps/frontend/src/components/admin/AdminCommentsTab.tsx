import React, { useEffect, useState } from 'react';
import { MessageSquare, Trash2, Heart, Plus, Edit2 } from 'lucide-react';
import { api } from '../../services/api';
import type { IProblem } from '@ocj/types';

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
      const res = await api.getComments(probId);
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
    <div className="problems-tab-grid">
      {/* Left side: Problem selector & comment creator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="prob-admin-card">
          <h3>Chọn Chủ Đề Thảo Luận</h3>
          <div className="prob-form-group">
            <label>Chọn Bài Tập</label>
            <select
              value={selectedProblemId}
              onChange={e => setSelectedProblemId(e.target.value)}
              className="prob-admin-select"
            >
              {problems.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="prob-admin-card">
          <h3>Đăng Bình Luận Quản Trị</h3>
          <form onSubmit={handleCreateComment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              placeholder="Nhập nội dung thảo luận hoặc thông báo..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="prob-admin-textarea"
              rows={4}
              required
            />
            <button type="submit" className="btn-prob-primary">
              <Plus size={14} /> Đăng bình luận
            </button>
          </form>
        </div>
      </div>

      {/* Right side: Comments list & Moderation actions */}
      <div className="prob-admin-card">
        <h3>Điều Phối Bình Luận (Moderation)</h3>
        <div className="prob-list-scroll">
          {loading ? (
            <p>Đang tải bình luận...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: '#64748b' }}>Không có bình luận nào cho bài tập này.</p>
          ) : (
            comments.map((c, idx) => {
              const cid = c.id || c._id;
              const isEditing = editingCommentId === cid;
              return (
                <div key={cid || idx} className="prob-item-row" style={{ alignItems: 'flex-start', padding: '12px' }}>
                  <div className="prob-item-details" style={{ width: '100%' }}>
                    <span className="prob-item-title" style={{ fontSize: '0.85rem', color: '#8892b0' }}>
                      Người dùng: {c.userId || c.user?.username || 'User'}
                    </span>
                    
                    {isEditing ? (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', width: '100%' }}>
                        <input
                          type="text"
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="prob-admin-input"
                          style={{ margin: 0 }}
                        />
                        <button onClick={() => handleUpdateComment(cid)} className="btn-prob-primary" style={{ padding: '6px 12px' }}>
                          Lưu
                        </button>
                        <button onClick={() => setEditingCommentId(null)} className="btn-prob-secondary" style={{ padding: '6px 12px' }}>
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <p style={{ color: '#cbd5e1', margin: '6px 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {c.content}
                      </p>
                    )}

                    <div className="prob-item-meta" style={{ marginTop: '8px' }}>
                      <button onClick={() => handleLike(cid)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#fb7185', cursor: 'pointer', padding: 0 }}>
                        <Heart size={12} fill={c.likes?.length ? '#fb7185' : 'none'} />
                        <span style={{ fontSize: '0.72rem' }}>{c.likes?.length || 0} Thích</span>
                      </button>
                      <span className="prob-tag-pill" style={{ fontSize: '0.68rem' }}>
                        {new Date(c.createdAt || c.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="action-btn-container" style={{ alignSelf: 'center' }}>
                    {!isEditing && (
                      <button onClick={() => { setEditingCommentId(cid); setEditContent(c.content); }} className="btn-action-icon edit" title="Sửa nội dung">
                        <Edit2 size={12} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteComment(cid)} className="btn-action-icon delete" title="Xóa bình luận">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
