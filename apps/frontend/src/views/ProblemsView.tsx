import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import './ProblemsView.css';

interface ProblemsViewProps {
  onSelectProblem: (slug: string) => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({ onSelectProblem }) => {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    // Fetch tags
    api.getProblems({}).then(res => {
      // Fetch tags from distinct tags in problems or fallback
      api.getProblems().then(problemsRes => {
        if (problemsRes.success && problemsRes.data) {
          const list = Array.isArray(problemsRes.data) ? problemsRes.data : (problemsRes.data.items || []);
          setProblems(list);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    });

    api.getProblemTags().then(res => {
      if (res.success && res.data) {
        setTags(res.data);
      }
    }).catch(err => console.error(err));
  }, []);

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = !difficulty || p.difficulty === difficulty;
    
    const matchesTag = !selectedTag || (p.tags && p.tags.some((t: any) => t.slug === selectedTag || t.name === selectedTag));
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  return (
    <div className="problems-view-container">
      <div className="catalog-header glass-card">
        <div className="title-row">
          <BookOpen className="header-icon" size={24} />
          <h2>Thư Viện Bài Tập</h2>
        </div>
        <p className="subtitle">Rèn luyện kỹ năng thuật toán cá nhân của bạn với kho bài tập đa dạng.</p>
      </div>

      <div className="filters-row glass-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="filter-select"
        >
          <option value="">Mọi độ khó</option>
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
        </select>

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="filter-select"
        >
          <option value="">Mọi chủ đề</option>
          {tags.map(t => (
            <option key={t.id || t.slug} value={t.slug || t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="problems-list-grid">
          {filteredProblems.length === 0 ? (
            <div className="empty-catalog glass-card">
              <p>Không tìm thấy bài tập nào khớp với bộ lọc.</p>
            </div>
          ) : (
            filteredProblems.map(p => (
              <div key={p.id || p._id || p.slug} className="problem-card glass-card">
                <div className="card-top">
                  <span className={`diff-pill diff-${p.difficulty.toLowerCase()}`}>
                    {p.difficulty}
                  </span>
                  {p.points && <span className="points-pill">{p.points} Coins</span>}
                </div>
                
                <h3 className="problem-card-title">{p.title}</h3>
                
                <div className="problem-tags-row">
                  {p.tags && p.tags.map((t: any) => (
                    <span key={t.id || t.name} className="tag-badge" style={{ borderColor: t.color }}>
                      {t.name}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onSelectProblem(p.slug)}
                  className="btn-solve glass-button"
                >
                  Giải Ngay <ArrowRight size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
export default ProblemsView;
