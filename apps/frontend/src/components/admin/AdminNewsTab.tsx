import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';

export const AdminNewsTab: React.FC = () => {
  const [newsfeed, setNewsfeed] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const loadNews = async () => {
    try {
      const res = await api.getNews();
      if (res.success && res.data) {
        setNewsfeed(res.data.items || res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setLoading(true);
    try {
      const res = await api.createNews({ title, content });
      if (res.success) {
        setTitle('');
        setContent('');
        loadNews();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi đăng tin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa bản tin này?')) return;
    try {
      const res = await api.deleteNews(id);
      if (res.success) loadNews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-washi border border-charcoal p-6">
        <h3 className="font-display text-lg font-bold text-linen mb-4 uppercase tracking-wider">Đăng Tin Tức Mới</h3>
        <form onSubmit={handlePostNews} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Tiêu đề bản tin..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="bg-ink border border-charcoal px-4 py-2 text-sm text-linen outline-none focus:border-vermilion"
          />
          <textarea
            placeholder="Nội dung bản tin..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="bg-ink border border-charcoal px-4 py-2 text-sm text-linen outline-none focus:border-vermilion"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-vermilion text-linen py-2 font-display text-xs font-bold uppercase tracking-wider hover:bg-vermilion-hover disabled:opacity-50"
          >
            <Plus size={16} /> Đăng Tin
          </button>
        </form>
      </div>

      <div className="bg-washi border border-charcoal p-6">
        <h3 className="font-display text-lg font-bold text-linen mb-4 uppercase tracking-wider">Danh Sách Tin Tức</h3>
        <div className="flex flex-col gap-4">
          {newsfeed.length === 0 ? (
            <div className="text-center p-8 bg-ink border border-charcoal border-dashed text-stone text-sm">
              Chưa có tin tức nào
            </div>
          ) : (
            newsfeed.map((news) => (
              <div key={news.id} className="bg-ink border border-charcoal p-4 flex flex-col md:flex-row justify-between gap-4 border-l-4 border-l-vermilion">
                <div className="flex-1">
                  <h4 className="font-display font-bold text-linen mb-1">{news.title}</h4>
                  <p className="font-body text-xs text-stone mb-2">Bởi: {news.author?.username} - {new Date(news.created_at).toLocaleString('vi-VN')}</p>
                  <p className="font-body text-sm text-stone whitespace-pre-wrap">{news.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(news.id)}
                  className="self-start md:self-center text-stone hover:text-vermilion p-2 transition-colors border border-charcoal hover:border-vermilion"
                  title="Xoá tin"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
