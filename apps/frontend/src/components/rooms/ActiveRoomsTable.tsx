import React from 'react';
import { Users } from 'lucide-react';
import type { ICustomRoom } from '@ocj/types';

interface ActiveRoomsTableProps {
  rooms: ICustomRoom[];
  onJoinRoom: (code: string) => void;
}

export const ActiveRoomsTable: React.FC<ActiveRoomsTableProps> = ({ rooms, onJoinRoom }) => {
  return (
    <div className="active-rooms-list glass-card">
      <div className="list-title">
        <Users size={18} />
        <h3>Phòng chơi đang mở</h3>
      </div>
      <div className="rooms-table-wrap">
        <table className="rooms-table">
          <thead>
            <tr>
              <th>Mã phòng</th>
              <th>Chủ phòng</th>
              <th>Độ khó</th>
              <th>Người chơi</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  Không có phòng chơi tùy chỉnh nào đang đợi. Hãy tự tạo một phòng!
                </td>
              </tr>
            ) : (
              rooms.map((r) => (
                <tr key={r.id}>
                  <td className="code-font bold">{r.room_code}</td>
                  <td>{r.creator?.username}</td>
                  <td>
                    <span className={`diff-pill diff-${r.difficulty?.toLowerCase() || 'easy'}`}>
                      {r.difficulty || 'ANY'}
                    </span>
                  </td>
                  <td>1 / 2</td>
                  <td>
                    <button onClick={() => onJoinRoom(r.room_code)} className="btn-join-row glass-button">
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
