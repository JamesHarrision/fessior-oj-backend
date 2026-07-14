import { useState, useEffect } from 'react';

export interface CustomRoadmap {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

const STORAGE_KEY = 'ocj.customRoadmaps';

export function useCustomRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<CustomRoadmap[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setRoadmaps(JSON.parse(raw));
      }
    } catch (err) {
      console.error('Failed to load custom roadmaps', err);
    }
  }, []);

  const saveRoadmaps = (newRoadmaps: CustomRoadmap[]) => {
    setRoadmaps(newRoadmaps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRoadmaps));
  };

  const addRoadmap = (content: string) => {
    // Generate a simple title based on the first line or a default
    const firstLine = content.split('\n')[0].replace(/[#*]/g, '').trim();
    const title = firstLine.length > 5 ? firstLine.slice(0, 40) + '...' : 'Lộ trình mới';
    
    const newRoadmap: CustomRoadmap = {
      id: `cm-rm-${Date.now()}`,
      title,
      content,
      createdAt: Date.now(),
    };
    
    saveRoadmaps([newRoadmap, ...roadmaps]);
  };

  const deleteRoadmap = (id: string) => {
    saveRoadmaps(roadmaps.filter(rm => rm.id !== id));
  };

  return { roadmaps, addRoadmap, deleteRoadmap };
}
