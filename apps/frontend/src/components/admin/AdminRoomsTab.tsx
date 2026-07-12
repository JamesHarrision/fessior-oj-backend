import React, { useEffect, useState } from 'react';
import { Plus, Users, Trash2, Key } from 'lucide-react';
import { api } from '../../services/api';
import type { ICustomRoom, IProblem } from '@ocj/types';
import { AdminCard, AdminHeader, AdminButton, AdminSelect, AdminListRow, AdminBadge, AdminFormGroup } from './ui/AdminUI';

export const AdminRoomsTab: React.FC = () => {
  const [rooms, setRooms] = useState<ICustomRoom[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create Room state
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.getActiveRooms();
      if (res.success) {
        setRooms(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await api.getProblems();
      const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
      setProblems(items);
      if (items.length > 0) setSelectedProblemId(items[0].id || items[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchProblems();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createRoom({
        problemId: selectedProblemId || undefined,
        difficulty: selectedProblemId ? undefined : difficulty
      });
      if (res.success) {
        alert(`Tạo phòng thành công! Room Code: ${res.data?.roomCode || res.data?.code}`);
        fetchRooms();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo phòng custom');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Hủy phòng custom này? Thao tác này sẽ đẩy toàn bộ người chơi ra ngoài.')) return;
    try {
      const res = await api.deleteRoom(roomId);
      if (res.success) {
        setRooms(prev => prev.filter(r => r.id !== roomId));
        alert('Đã đóng phòng thi đấu.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa phòng');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left side: Create Custom Room */}
      <AdminCard>
        <AdminHeader>Tạo Phòng Đấu Custom Mới</AdminHeader>
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
          <AdminFormGroup label="Chọn Đề Bài Cố Định (Tùy chọn)">
            <AdminSelect
              value={selectedProblemId}
              onChange={e => setSelectedProblemId(e.target.value)}
            >
              <option value="">-- Chọn ngẫu nhiên theo độ khó --</option>
              {problems.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.title} ({p.difficulty})</option>
              ))}
            </AdminSelect>
          </AdminFormGroup>

          {!selectedProblemId && (
            <AdminFormGroup label="Độ Khó Phòng Đấu (Nếu chọn ngẫu nhiên)">
              <AdminSelect
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </AdminSelect>
            </AdminFormGroup>
          )}

          <AdminButton type="submit" className="mt-2">
            <Plus size={16} /> Tạo phòng PvP Custom
          </AdminButton>
        </form>
      </AdminCard>

      {/* Right side: Active Rooms List */}
      <AdminCard>
        <AdminHeader>Danh Sách Phòng Đấu PvP Đang Hoạt Động</AdminHeader>
        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-stone text-sm">Đang tải...</p>
          ) : rooms.length === 0 ? (
            <p className="text-stone text-sm">Hiện tại không có phòng PvP nào đang chờ hoặc đang thi đấu.</p>
          ) : (
            rooms.map((r, idx) => {
              const roomId = r.id;
              return (
                <AdminListRow key={roomId || idx}>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-sm text-linen font-body flex items-center gap-2">
                      <Key size={14} className="text-blue-400" />
                      Mã Phòng: {r.room_code}
                    </span>
                    <div className="flex items-center gap-2">
                      <AdminBadge className="flex items-center gap-1.5">
                        <Users size={12} />
                        {r._count?.participants || 1} người chơi
                      </AdminBadge>
                      <AdminBadge color={r.status === 'WAITING' ? 'yellow' : 'green'}>
                        Trạng thái: {r.status || 'WAITING'}
                      </AdminBadge>
                    </div>
                  </div>

                  <AdminButton variant="icon-delete" onClick={() => handleDeleteRoom(roomId)} title="Đóng phòng đấu">
                    <Trash2 size={14} />
                  </AdminButton>
                </AdminListRow>
              );
            })
          )}
        </div>
      </AdminCard>
    </div>
  );
};
