import React, { useEffect, useState } from 'react';
import { BookOpen, MessageSquare, ThumbsUp, Trash2, Send } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { IProblem } from '@ocj/types';
import { renderMarkdownToHtml } from '@ocj/utils';
import { DifficultyBadge, EmptyState } from '@ocj/ui';

/* =====================================================
   ProblemDescription — Ink & Vermillion
   Props unchanged: { problem? }
   ===================================================== */

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
      const res = await api.getComments(problemId, 'PROBLEM');
      if (res.success && res.data) setComments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'discuss') loadComments();
  }, [activeTab, problemId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !problemId) return;
    try {
      const res = await api.createComment({ targetId: problemId, targetType: 'PROBLEM', content: newComment });
      if (res.success) { setNewComment(''); loadComments(); }
    } catch (err) { console.error(err); }
  };

  const handleLike = async (commentId: string) => {
    try {
      const res = await api.toggleLikeComment(commentId);
      if (res.success) loadComments();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await api.deleteComment(commentId);
      if (res.success) setComments((prev) => prev.filter((c) => c.id !== commentId && c._id !== commentId));
    } catch (err) { console.error(err); }
  };

  const title = problem?.title || 'Đang tải...';
  const difficulty = problem?.difficulty || 'EASY';
  const description = problem?.description || '<p>Đang tải chi tiết đề bài...</p>';
  const tags = problem?.tags || [];

  return (
    <div className="flex flex-col h-[480px] bg-washi border border-charcoal overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-charcoal">
        <button
          className={`flex items-center gap-1.5 font-display text-xs font-semibold px-4 py-2.5 transition-colors cursor-pointer ${activeTab === 'desc' ? 'text-vermilion border-b-[2px] border-b-vermilion' : 'text-stone hover:text-linen border-b-[2px] border-b-transparent'
            }`}
          onClick={() => setActiveTab('desc')}
        >
          <BookOpen size={13} />
          Chi tiết đề bài
        </button>
        <button
          className={`flex items-center gap-1.5 font-display text-xs font-semibold px-4 py-2.5 transition-colors cursor-pointer ${activeTab === 'discuss' ? 'text-vermilion border-b-[2px] border-b-vermilion' : 'text-stone hover:text-linen border-b-[2px] border-b-transparent'
            }`}
          onClick={() => setActiveTab('discuss')}
        >
          <MessageSquare size={13} />
          Thảo luận ({comments.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'desc' ? (
          <>
            <h1 className="font-display text-lg font-bold text-linen mb-3">{title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <DifficultyBadge difficulty={difficulty as any} size="small" />
              {tags.map((tag: any, idx) => (
                <span key={idx} className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-stone border border-charcoal bg-charcoal/20 px-2 py-0.5">
                  {typeof tag === 'object' ? tag.name : tag}
                </span>
              ))}
            </div>
            <div
              className="font-body text-sm text-linen/85 leading-relaxed [&_pre]:bg-ink [&_pre]:border [&_pre]:border-charcoal [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:text-linen [&_pre]:overflow-x-auto [&_code]:text-vermilion"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(description) }}
            />
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Comment form */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập thảo luận của bạn tại đây..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                className="flex-1 bg-ink border border-charcoal px-3 py-2 text-sm text-linen placeholder-stone outline-none focus:border-vermilion transition-colors"
              />
              <button type="submit" className="flex items-center justify-center bg-vermilion text-linen px-3 py-2 hover:bg-vermilion-hover transition-colors cursor-pointer">
                <Send size={14} />
              </button>
            </form>

            {/* Comments list */}
            {loading ? (
              <p className="font-body text-xs text-stone text-center py-6 animate-pulse-soft">Đang tải thảo luận...</p>
            ) : comments.length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={32} strokeWidth={1.5} />}
                title="Chưa có bình luận nào"
                description="Hãy là người đầu tiên thảo luận về bài toán này."
              />
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px]">
                {comments.map((c) => {
                  const isOwner = c.userId === user?.id || c.user?.id === user?.id;
                  const commentUser = c.username || c.user?.username || 'Đấu sĩ';
                  const hasLiked = c.likes?.includes(user?.id);
                  return (
                    <div key={c.id || c._id} className="bg-ink/30 border border-charcoal/50 p-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-body text-sm font-semibold text-linen">{commentUser}</span>
                        <span className="font-body text-[11px] text-stone">
                          {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="font-body text-sm text-linen/80 mb-2">{c.content}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleLike(c.id || c._id)} className={`flex items-center gap-1 font-body text-[11px] cursor-pointer transition-colors ${hasLiked ? 'text-vermilion' : 'text-stone hover:text-linen'
                          }`}>
                          <ThumbsUp size={11} /> {c.likes?.length || 0}
                        </button>
                        {isOwner && (
                          <button onClick={() => handleDelete(c.id || c._id)} className="font-body text-[11px] text-stone hover:text-vermilion transition-colors cursor-pointer">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
