import React, { useEffect, useState } from 'react';
import { ShieldAlert, Plus, Users, Trash2, Key } from 'lucide-react';
import { api } from '../../services/api';
import type { ICustomRoom, IProblem } from '@ocj/types';

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
        setRooms(prev => prev.filter(r => r.id !== roomId && r._id !== roomId));
        alert('Đã đóng phòng thi đấu.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa phòng');
    }
  };

  return (
    <div className="problems-tab-grid">
      {/* Left side: Create Custom Room */}
      <div className="prob-admin-card">
        <h3>Tạo Phòng Đấu Custom Mới</h3>
        <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="prob-form-group">
            <label>Chọn Đề Bài Cố Định (Tùy chọn)</label>
            <select
              value={selectedProblemId}
              onChange={e => setSelectedProblemId(e.target.value)}
              className="prob-admin-select"
            >
              <option value="">-- Chọn ngẫu nhiên theo độ khó --</option>
              {problems.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.title} ({p.difficulty})</option>
              ))}
            </select>
          </div>

          {!selectedProblemId && (
            <div className="prob-form-group">
              <label>Độ Khó Phòng Đấu (Nếu chọn ngẫu nhiên)</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="prob-admin-select"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-prob-primary">
            <Plus size={16} /> Tạo phòng PvP Custom
          </button>
        </form>
      </div>

      {/* Right side: Active Rooms List */}
      <div className="prob-admin-card">
        <h3>Danh Sách Phòng Đấu PvP Đang Hoạt Động</h3>
        <div className="prob-list-scroll">
          {loading ? (
            <p>Đang tải...</p>
          ) : rooms.length === 0 ? (
            <p style={{ color: '#64748b' }}>Hiện tại không có phòng PvP nào đang chờ hoặc đang thi đấu.</p>
          ) : (
            rooms.map((r, idx) => {
              const roomId = r.id || r._id;
              return (
                <div key={roomId || idx} className="prob-item-row">
                  <div className="prob-item-details">
                    <span className="prob-item-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Key size={14} style={{ color: '#60a5fa' }} />
                      Mã Phòng: {r.roomCode || r.code}
                    </span>
                    <div className="prob-item-meta">
                      <span className="prob-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                        <Users size={10} />
                        {r.players?.length || 0} người chơi
                      </span>
                      <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                        Trạng thái: {r.status || 'WAITING'}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleDeleteRoom(roomId)} className="btn-action-icon delete" title="Đóng phòng đấu">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
