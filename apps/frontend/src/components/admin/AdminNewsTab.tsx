import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';
import { AdminCard, AdminHeader, AdminButton, AdminInput, AdminFormGroup, AdminTextarea, AdminListRow } from './ui/AdminUI';

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1">
        <AdminCard>
          <AdminHeader>Đăng Tin Tức Mới</AdminHeader>
          <form onSubmit={handlePostNews} className="flex flex-col gap-4 mt-2">
            <AdminFormGroup label="Tiêu đề">
              <AdminInput
                type="text"
                placeholder="Tiêu đề bản tin..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </AdminFormGroup>
            <AdminFormGroup label="Nội dung">
              <AdminTextarea
                placeholder="Nội dung bản tin..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
              />
            </AdminFormGroup>
            <AdminButton type="submit" disabled={loading} className="mt-2">
              <Plus size={16} /> Đăng Tin
            </AdminButton>
          </form>
        </AdminCard>
      </div>

      <div className="lg:col-span-2">
        <AdminCard>
          <AdminHeader>Danh Sách Tin Tức</AdminHeader>
          <div className="flex flex-col gap-3 max-h-[800px] overflow-y-auto pr-1">
            {newsfeed.length === 0 ? (
              <p className="text-stone text-sm">Chưa có tin tức nào</p>
            ) : (
              newsfeed.map((news) => (
                <AdminListRow key={news.id} className="items-start border-l-2 border-l-vermilion">
                  <div className="flex flex-col gap-1.5 w-full">
                    <h4 className="font-display font-semibold text-linen m-0">{news.title}</h4>
                    <span className="text-xs text-stone tracking-wider uppercase font-semibold">
                      Bởi: <span className="text-linen/80">{news.author?.username}</span> • {new Date(news.created_at || news.createdAt).toLocaleString('vi-VN')}
                    </span>
                    <p className="font-body text-sm text-surface-300 whitespace-pre-wrap mt-1 leading-relaxed">
                      {news.content}
                    </p>
                  </div>
                  <AdminButton
                    variant="icon-delete"
                    onClick={() => handleDelete(news.id)}
                    title="Xoá tin"
                    className="self-start ml-2"
                  >
                    <Trash2 size={14} />
                  </AdminButton>
                </AdminListRow>
              ))
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
};
