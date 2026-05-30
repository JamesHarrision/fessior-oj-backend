import React from 'react';
import { BookOpen } from 'lucide-react';
import './ProblemDescription.css';

interface ProblemProps {
  problem?: {
    title: string;
    description: string;
    difficulty: string;
    tags?: string[];
  };
}

export const ProblemDescription: React.FC<ProblemProps> = ({ problem }) => {
  const title = problem?.title || '1. Two Sum';
  const difficulty = problem?.difficulty || 'EASY';
  const description = problem?.description || '<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p>';
  const tags = problem?.tags || ['Array', 'Hash Table'];

  return (
    <div className="problem-description glass-card">
      <div className="desc-header">
        <BookOpen size={16} className="desc-icon" />
        <span>Description</span>
      </div>

      <div className="desc-content">
        <h1 className="problem-title">{title}</h1>
        
        <div className="badge-row">
          <span className={`badge difficulty ${difficulty.toLowerCase()}`}>
            {difficulty}
          </span>
          {tags.map((tag, idx) => (
            <span key={idx} className="badge tag">
              {tag}
            </span>
          ))}
        </div>

        <div 
          className="problem-text" 
          dangerouslySetInnerHTML={{ __html: description }} 
        />
      </div>
    </div>
  );
};
