import React from 'react';
import { Check, X } from 'lucide-react';
import type { IReport } from '@ocj/types';
import { AdminCard, AdminHeader, AdminButton, AdminBadge } from './ui/AdminUI';

interface AdminReportsTabProps {
  reports: IReport[];
  onUpdateStatus: (id: string, status: 'RESOLVED' | 'REJECTED') => void;
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({ reports, onUpdateStatus }) => {
  return (
    <AdminCard>
      <AdminHeader>Báo Cáo Sự Cố Từ Người Dùng</AdminHeader>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-sm text-surface-300">
          <thead>
            <tr className="border-b border-charcoal">
              <th className="py-3 px-4 font-semibold text-stone uppercase text-xs tracking-wider font-display">Loại</th>
              <th className="py-3 px-4 font-semibold text-stone uppercase text-xs tracking-wider font-display">Nội dung</th>
              <th className="py-3 px-4 font-semibold text-stone uppercase text-xs tracking-wider font-display">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-stone uppercase text-xs tracking-wider font-display text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/50">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-stone">
                  Không có báo cáo nào.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="hover:bg-charcoal/10 transition-colors">
                  <td className="py-3 px-4">
                    <AdminBadge color={r.type === 'BUG' ? 'red' : 'blue'}>
                      {r.type}
                    </AdminBadge>
                  </td>
                  <td className="py-3 px-4 max-w-md truncate" title={r.content}>
                    {r.content}
                  </td>
                  <td className="py-3 px-4">
                    <AdminBadge color={r.status === 'PENDING' ? 'yellow' : r.status === 'RESOLVED' ? 'green' : 'gray'}>
                      {r.status}
                    </AdminBadge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <AdminButton
                          variant="icon-edit"
                          onClick={() => onUpdateStatus(r.id, 'RESOLVED')}
                          title="Giải quyết"
                          className="!text-green-500 !bg-green-500/10 hover:!bg-green-500/20"
                        >
                          <Check size={14} />
                        </AdminButton>
                        <AdminButton
                          variant="icon-delete"
                          onClick={() => onUpdateStatus(r.id, 'REJECTED')}
                          title="Từ chối"
                        >
                          <X size={14} />
                        </AdminButton>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
};
