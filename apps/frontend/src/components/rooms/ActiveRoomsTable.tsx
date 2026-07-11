import React from 'react';
import { Users } from 'lucide-react';
import { DifficultyBadge } from '@ocj/ui';
import type { ICustomRoom } from '@ocj/types';

interface ActiveRoomsTableProps {
  rooms: ICustomRoom[];
  onJoinRoom: (code: string) => void;
}

export const ActiveRoomsTable: React.FC<ActiveRoomsTableProps> = ({ rooms, onJoinRoom }) => {
  return (
    <div className="bg-ink border border-charcoal">
      <div className="bg-washi border-b border-charcoal p-4 flex items-center gap-3">
        <Users size={18} className="text-stone" />
        <h3 className="font-display text-sm font-bold text-linen uppercase tracking-wider">Phòng chờ đang mở</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-charcoal/50 bg-charcoal/10">
              <th className="p-4 font-display text-[11px] font-bold text-stone uppercase tracking-wider whitespace-nowrap">Mã phòng</th>
              <th className="p-4 font-display text-[11px] font-bold text-stone uppercase tracking-wider whitespace-nowrap">Chủ phòng</th>
              <th className="p-4 font-display text-[11px] font-bold text-stone uppercase tracking-wider whitespace-nowrap">Độ khó</th>
              <th className="p-4 font-display text-[11px] font-bold text-stone uppercase tracking-wider whitespace-nowrap text-center">Người chơi</th>
              <th className="p-4 font-display text-[11px] font-bold text-stone uppercase tracking-wider whitespace-nowrap text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center font-body text-sm text-stone">
                  Không có phòng chờ tùy chỉnh nào đang trống.
                </td>
              </tr>
            ) : (
              rooms.map((r) => (
                <tr key={r.id} className="border-b border-charcoal/20 hover:bg-charcoal/10 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-linen whitespace-nowrap">{r.room_code}</td>
                  <td className="p-4 font-body text-sm text-linen whitespace-nowrap">{r.creator?.username}</td>
                  <td className="p-4 whitespace-nowrap">
                    <DifficultyBadge difficulty={(r.difficulty as any) || 'EASY'} />
                  </td>
                  <td className="p-4 font-mono text-xs text-stone whitespace-nowrap text-center">
                    {r.participants?.length || 1} / {r.max_participants || 10}
                  </td>
                  <td className="p-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => onJoinRoom(r.room_code)} 
                      className="border border-charcoal text-linen font-display text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 hover:border-stone hover:bg-washi transition-colors"
                    >
                      Tham gia
                    </button>
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
