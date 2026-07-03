import React, { useEffect, useState } from 'react';
import { BookOpen, MessageSquare, ThumbsUp, Trash2, Send } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { IProblem } from '@ocj/types';
import { renderMarkdownToHtml } from '@ocj/utils';
import './ProblemDescription.css';

interface ProblemProps {
  problem?: IProblem | null;
}

export const ProblemDescription: React.FC<ProblemProps> = ({ problem }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'desc' | 'discuss'>('desc');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const problemId = problem?.id || problem?._id || '';

  const loadComments = async () => {
    if (!problemId) return;
    setLoading(true);
    try {
      const res = await api.getComments(problemId);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'discuss') {
      loadComments();
    }
  }, [activeTab, problemId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !problemId) return;
    try {
      const res = await api.createComment({ targetId: problemId, targetType: 'PROBLEM', content: newComment });
      if (res.success) {
        setNewComment('');
        loadComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const res = await api.toggleLikeComment(commentId);
      if (res.success) {
        loadComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await api.deleteComment(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId && c._id !== commentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const title = problem?.title || 'Đang tải...';
  const difficulty = problem?.difficulty || 'EASY';
  const description = problem?.description || '<p>Đang tải chi tiết đề bài...</p>';
  const tags = problem?.tags || [];

  return (
    <div className="problem-description glass-card">
      <div className="desc-header-tabs">
        <button
          className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
          onClick={() => setActiveTab('desc')}
        >
          <BookOpen size={14} /> Chi tiết đề bài
        </button>
        <button
          className={`tab-btn ${activeTab === 'discuss' ? 'active' : ''}`}
          onClick={() => setActiveTab('discuss')}
        >
          <MessageSquare size={14} /> Thảo luận ({comments.length})
        </button>
      </div>

      <div className="desc-content">
        {activeTab === 'desc' ? (
          <>
            <h1 className="problem-title">{title}</h1>
            <div className="badge-row">
              <span className={`badge difficulty ${difficulty.toLowerCase()}`}>
                {difficulty}
              </span>
              {tags.map((tag: any, idx) => (
                <span key={idx} className="badge tag" style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}>
                  {typeof tag === 'object' ? tag.name : tag}
                </span>
              ))}
            </div>
            <div
              className="problem-text"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(description) }}
            />
          </>
        ) : (
          <div className="discussions-container">
            <form onSubmit={handlePostComment} className="comment-form">
              <input
                type="text"
                placeholder="Nhập thảo luận của bạn tại đây..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
                required
              />
              <button type="submit" className="comment-submit-btn">
                <Send size={14} />
              </button>
            </form>

            {loading ? (
              <p className="loading-comments">Đang tải thảo luận...</p>
            ) : (
              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">Chưa có bình luận nào. Hãy bắt đầu thảo luận!</p>
                ) : (
                  comments.map((c) => {
                    const isOwner = c.userId === user?.id || c.user?.id === user?.id;
                    const commentUser = c.username || c.user?.username || 'Đấu sĩ';
                    const hasLiked = c.likes?.includes(user?.id);
                    return (
                      <div key={c.id || c._id} className="comment-item">
                        <div className="comment-meta">
                          <span className="comment-author">{commentUser}</span>
                          <span className="comment-date">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-body">{c.content}</p>
                        <div className="comment-actions">
                          <button
                            onClick={() => handleLike(c.id || c._id)}
                            className={`like-btn ${hasLiked ? 'liked' : ''}`}
                          >
                            <ThumbsUp size={12} /> {c.likes?.length || 0}
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => handleDelete(c.id || c._id)}
                              className="delete-comment-btn"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
