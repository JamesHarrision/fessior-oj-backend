import React from 'react';
import { Plus, X } from 'lucide-react';

interface AdminProblemsTabProps {
  probTitle: string;
  setProbTitle: (val: string) => void;
  probDesc: string;
  setProbDesc: (val: string) => void;
  probDiff: 'EASY' | 'MEDIUM' | 'HARD';
  setProbDiff: (val: 'EASY' | 'MEDIUM' | 'HARD') => void;
  onSubmit: (e: React.FormEvent) => void;
  problems: any[];
  onDelete: (id: string) => void;
}

export const AdminProblemsTab: React.FC<AdminProblemsTabProps> = ({
  probTitle,
  setProbTitle,
  probDesc,
  setProbDesc,
  probDiff,
  setProbDiff,
  onSubmit,
  problems,
  onDelete,
}) => {
  return (
    <div className="admin-section-grid">
      <form onSubmit={onSubmit} className="admin-form-card glass-card">
        <h3>Tạo Đề Bài Mới</h3>
        <input
          type="text"
          placeholder="Tên bài tập..."
          value={probTitle}
          onChange={(e) => setProbTitle(e.target.value)}
          required
          className="glass-input"
        />
        <textarea
          placeholder="Mô tả đề bài..."
          value={probDesc}
          onChange={(e) => setProbDesc(e.target.value)}
          required
          className="glass-input"
          rows={6}
        />
        <select
          value={probDiff}
          onChange={(e: any) => setProbDiff(e.target.value)}
          className="glass-select"
        >
          <option value="EASY">Dễ (Easy)</option>
          <option value="MEDIUM">Trung bình (Medium)</option>
          <option value="HARD">Khó (Hard)</option>
        </select>
        <button type="submit" className="btn-admin-submit glass-button">
          <Plus size={16} /> Tạo bài tập
        </button>
      </form>
      <div className="admin-list-card glass-card">
        <h3>Danh Sách Đề Bài</h3>
        <div className="admin-scroll-list">
          {problems.map((p) => (
            <div key={p.id || p.mongo_problem_id} className="admin-list-item">
              <span>
                {p.title}{' '}
                <span className={`diff-pill diff-${p.difficulty?.toLowerCase()}`}>
                  {p.difficulty}
                </span>
              </span>
              <button
                onClick={() => onDelete(p.id || p.mongo_problem_id)}
                className="btn-admin-delete"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
