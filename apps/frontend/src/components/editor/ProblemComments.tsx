import React, { useEffect, useState } from 'react';
import { Send, ThumbsUp, Trash2, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '@ocj/ui';

/* =====================================================
   ProblemComments — Ink & Vermillion standalone
   Props unchanged: { targetId, targetType }
   ===================================================== */

interface ProblemCommentsProps {
  targetId: string;
  targetType: string;
}

export const ProblemComments: React.FC<ProblemCommentsProps> = ({ targetId, targetType }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await api.getComments(targetId, 'PROBLEM');
      if (res.success && res.data) setComments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadComments(); }, [targetId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.createComment({ targetId, targetType, content: newComment });
      if (res.success) { setNewComment(''); loadComments(); }
    } catch (err) { console.error(err); }
  };

  const handleLike = async (id: string) => {
    try { const res = await api.toggleLikeComment(id); if (res.success) loadComments(); } catch (err) { console.error(err); }
  };
  const handleDelete = async (id: string) => {
    try { const res = await api.deleteComment(id); if (res.success) setComments((p) => p.filter((c) => c.id !== id && c._id !== id)); } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handlePost} className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập thảo luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
          className="flex-1 bg-ink border border-charcoal px-3 py-2 text-sm text-linen placeholder-stone outline-none focus:border-vermilion transition-colors"
        />
        <button type="submit" className="flex items-center justify-center bg-vermilion text-linen px-3 py-2 hover:bg-vermilion-hover transition-colors cursor-pointer">
          <Send size={14} />
        </button>
      </form>

      {loading ? (
        <p className="font-body text-xs text-stone text-center py-6 animate-pulse-soft">Đang tải thảo luận...</p>
      ) : comments.length === 0 ? (
        <EmptyState icon={<MessageSquare size={28} strokeWidth={1.5} />} title="Chưa có bình luận nào" description="Hãy là người đầu tiên thảo luận." />
      ) : (
        <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto">
          {comments.map((c) => {
            const isOwner = c.userId === user?.id || c.user?.id === user?.id;
            const name = c.username || c.user?.username || 'Đấu sĩ';
            const liked = c.likes?.includes(user?.id);
            return (
              <div key={c.id || c._id} className="bg-ink/30 border border-charcoal/50 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-body text-sm font-semibold text-linen">{name}</span>
                  <span className="font-body text-[11px] text-stone">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <p className="font-body text-sm text-linen/80 mb-2">{c.content}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleLike(c.id || c._id)} className={`flex items-center gap-1 font-body text-[11px] cursor-pointer transition-colors ${liked ? 'text-vermilion' : 'text-stone hover:text-linen'}`}>
                    <ThumbsUp size={11} /> {c.likes?.length || 0}
                  </button>
                  {isOwner && <button onClick={() => handleDelete(c.id || c._id)} className="font-body text-[11px] text-stone hover:text-vermilion transition-colors cursor-pointer"><Trash2 size={11} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
