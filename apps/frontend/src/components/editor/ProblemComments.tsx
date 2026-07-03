import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Heart, Trash2, Send } from 'lucide-react';
import './ProblemComments.css';

interface ProblemCommentsProps {
  problemId: string;
}

export const ProblemComments: React.FC<ProblemCommentsProps> = ({ problemId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    if (!problemId) return;
    try {
      const res = await api.getComments(problemId);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [problemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;
    setLoading(true);
    try {
      const res = await api.createComment({ targetId: problemId, targetType: 'PROBLEM', content: newComment });
      if (res.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const res = await api.toggleLikeComment(commentId);
      if (res.success) {
        // Toggle client-side or refetch
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      const res = await api.deleteComment(commentId);
      if (res.success) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="problem-comments-container glass-card">
      <div className="comments-header">
        <MessageSquare size={18} />
        <h4>Thảo luận ({comments.length})</h4>
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Chia sẻ suy nghĩ hoặc gợi ý giải pháp của bạn..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="glass-input comment-input"
        />
        <button type="submit" disabled={loading || !newComment.trim()} className="btn-send glass-button">
          <Send size={16} />
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ!</p>
        ) : (
          comments.map((comment) => {
            const isOwner = comment.user_id === user?.id || comment.user?.id === user?.id;
            const hasLiked = comment.likes && comment.likes.some((l: any) => l.user_id === user?.id);
            return (
              <div key={comment.id || comment._id} className="comment-item glass-card">
                <div className="comment-meta">
                  <span className="comment-author">{comment.user?.username || 'Người dùng'}</span>
                  <span className="comment-date">
                    {new Date(comment.created_at || comment.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="comment-text">{comment.content}</p>
                <div className="comment-actions">
                  <button 
                    onClick={() => handleLike(comment.id || comment._id)} 
                    className={`btn-action-comment ${hasLiked ? 'liked' : ''}`}
                  >
                    <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />
                    <span>{comment.likes_count || (comment.likes ? comment.likes.length : 0)}</span>
                  </button>

                  {isOwner && (
                    <button 
                      onClick={() => handleDelete(comment.id || comment._id)} 
                      className="btn-action-comment btn-delete-comment"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default ProblemComments;
