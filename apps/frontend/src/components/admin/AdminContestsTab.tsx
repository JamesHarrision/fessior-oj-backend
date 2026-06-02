import React from 'react';
import { Plus, X } from 'lucide-react';
import type { IContest } from '@ocj/types';

interface AdminContestsTabProps {
  contestTitle: string;
  setContestTitle: (val: string) => void;
  contestStart: string;
  setContestStart: (val: string) => void;
  contestEnd: string;
  setContestEnd: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  contests: IContest[];
  onDelete: (id: string) => void;
}

export const AdminContestsTab: React.FC<AdminContestsTabProps> = ({
  contestTitle,
  setContestTitle,
  contestStart,
  setContestStart,
  contestEnd,
  setContestEnd,
  onSubmit,
  contests,
  onDelete,
}) => {
  return (
    <div className="admin-section-grid">
      <form onSubmit={onSubmit} className="admin-form-card glass-card">
        <h3>Tạo Kỳ Thi Mới</h3>
        <input
          type="text"
          placeholder="Tên kỳ thi..."
          value={contestTitle}
          onChange={(e) => setContestTitle(e.target.value)}
          required
          className="glass-input"
        />
        <div className="time-group">
          <label>
            Bắt đầu:{' '}
            <input
              type="datetime-local"
              value={contestStart}
              onChange={(e) => setContestStart(e.target.value)}
              required
              className="glass-input"
            />
          </label>
        </div>
        <div className="time-group">
          <label>
            Kết thúc:{' '}
            <input
              type="datetime-local"
              value={contestEnd}
              onChange={(e) => setContestEnd(e.target.value)}
              required
              className="glass-input"
            />
          </label>
        </div>
        <button type="submit" className="btn-admin-submit glass-button">
          <Plus size={16} /> Tạo kỳ thi
        </button>
      </form>
      <div className="admin-list-card glass-card">
        <h3>Danh Sách Kỳ Thi</h3>
        <div className="admin-scroll-list">
          {contests.map((c) => (
            <div key={c.id} className="admin-list-item">
              <div>
                <strong>{c.title}</strong>
                <br />
                <small>
                  {new Date(c.start_time).toLocaleString()} - {new Date(c.end_time).toLocaleString()}
                </small>
              </div>
              <button onClick={() => onDelete(c.id)} className="btn-admin-delete">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
