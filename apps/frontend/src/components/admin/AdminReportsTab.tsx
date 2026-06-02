import React from 'react';
import { Check, X } from 'lucide-react';

interface AdminReportsTabProps {
  reports: any[];
  onUpdateStatus: (id: string, status: 'RESOLVED' | 'REJECTED') => void;
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({ reports, onUpdateStatus }) => {
  return (
    <div className="admin-reports-card glass-card">
      <h3>Báo Cáo Sự Cố Từ Người Dùng</h3>
      <div className="reports-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-cell">
                  Không có báo cáo nào.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className={`report-badge type-${r.type.toLowerCase()}`}>{r.type}</span>
                  </td>
                  <td className="content-cell">{r.content}</td>
                  <td>
                    <span className={`report-status status-${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'PENDING' && (
                      <div className="report-action-buttons">
                        <button
                          onClick={() => onUpdateStatus(r.id, 'RESOLVED')}
                          className="btn-resolve"
                          title="Giải quyết"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(r.id, 'REJECTED')}
                          className="btn-reject"
                          title="Từ chối"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
