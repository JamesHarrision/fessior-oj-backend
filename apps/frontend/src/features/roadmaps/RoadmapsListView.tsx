import React, { useEffect, useState } from 'react';
import { Plus, Compass, Map as MapIcon } from 'lucide-react';
import { api } from '../../services/api';
import type { IRoadmap } from '@ocj/types';
import { message } from 'antd';
import { RoadmapCard } from './RoadmapCard';
import { CreateRoadmapModal } from './CreateRoadmapModal';

export function RoadmapsListView() {
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    try {
      const res = await api.getUserRoadmaps();
      if (res.success) {
        setRoadmaps(res.data);
      } else {
        message.error('Không thể tải danh sách lộ trình');
      }
    } catch (err) {
      message.error('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleShareToggle = async (id: string, isShared: boolean) => {
    // We will implement this in the detail view as well
  };

  const handleDelete = async (id: string) => {
    // Delete logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-linen tracking-tight uppercase flex items-center gap-3">
            <MapIcon className="text-vermilion" size={32} />
            My Roadmaps
          </h1>
          <p className="text-stone mt-2">
            AI-generated learning paths tailored to your goals.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-vermilion hover:bg-vermilion/90 text-linen px-5 py-2.5 font-display font-bold uppercase tracking-wider transition-colors"
        >
          <Plus size={18} />
          Tạo Mới
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-charcoal/20 animate-pulse border border-charcoal/50" />
          ))}
        </div>
      ) : roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map(roadmap => (
            <RoadmapCard 
              key={roadmap.id} 
              roadmap={roadmap} 
              onShareToggle={handleShareToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-washi border border-charcoal">
          <Compass size={48} className="text-stone/50 mb-4" />
          <h3 className="text-xl font-display font-bold text-linen">Chưa có lộ trình nào</h3>
          <p className="text-stone mt-2 max-w-md text-center">
            Bạn chưa tạo lộ trình học tập nào. Hãy để AI Mentor giúp bạn lên kế hoạch!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 flex items-center gap-2 border border-vermilion text-vermilion hover:bg-vermilion hover:text-linen px-6 py-2.5 font-display font-bold uppercase tracking-wider transition-colors"
          >
            Tạo Lộ Trình Đầu Tiên
          </button>
        </div>
      )}

      {/* Modal */}
      <CreateRoadmapModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchRoadmaps} 
      />
    </div>
  );
}
