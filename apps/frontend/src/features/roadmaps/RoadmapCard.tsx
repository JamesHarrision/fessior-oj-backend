import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IRoadmap } from '@ocj/types';
import { Calendar, ChevronRight, Share2, Target } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  roadmap: IRoadmap;
  onShareToggle: (id: string, isShared: boolean) => void;
  onDelete: (id: string) => void;
}

export function RoadmapCard({ roadmap, onShareToggle, onDelete }: Props) {
  const navigate = useNavigate();

  // Calculate progress
  let totalSessions = 0;
  let completedSessions = 0;

  roadmap.phases?.forEach(phase => {
    phase.sessions?.forEach(session => {
      totalSessions++;
      if (session.is_completed) completedSessions++;
    });
  });

  const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  return (
    <div 
      onClick={() => navigate(`/roadmaps/${roadmap.id}`)}
      className="bg-washi border border-charcoal p-5 hover:border-vermilion transition-colors cursor-pointer group relative flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-linen group-hover:text-vermilion transition-colors">
            {roadmap.title}
          </h3>
          <p className="text-sm text-stone mt-1 line-clamp-2">
            {roadmap.description || 'Chưa có mô tả'}
          </p>
        </div>
        <div className="flex gap-2">
          {roadmap.is_shared && (
            <div className="bg-charcoal/50 text-stone px-2 py-1 text-xs flex items-center gap-1" title="Đang chia sẻ">
              <Share2 size={12} /> Public
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-stone mb-1">
            <span>Tiến độ</span>
            <span className="text-linen font-bold">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-charcoal overflow-hidden">
            <div 
              className="h-full bg-vermilion transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone pt-3 border-t border-charcoal/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {format(new Date(roadmap.created_at), 'dd/MM/yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Target size={14} />
              {completedSessions}/{totalSessions} sessions
            </span>
          </div>
          <ChevronRight size={16} className="text-stone group-hover:text-vermilion transition-colors" />
        </div>
      </div>
    </div>
  );
}
