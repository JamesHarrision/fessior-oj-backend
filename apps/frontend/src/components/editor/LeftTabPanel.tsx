import React, { useState } from 'react';
import { ProblemDescription } from './ProblemDescription';
import { ProblemComments } from './ProblemComments';
import type { IProblem } from '@ocj/types';

interface LeftTabPanelProps {
  problem: IProblem | null;
}

export const LeftTabPanel: React.FC<LeftTabPanelProps> = ({ problem }) => {
  const [leftTab, setLeftTab] = useState<'desc' | 'comments'>('desc');

  return (
    <div className="left-column">
      <div className="left-tabs-header">
        <button
          className={`left-tab-btn ${leftTab === 'desc' ? 'active' : ''}`}
          onClick={() => setLeftTab('desc')}
        >
          Mô tả
        </button>
        <button
          className={`left-tab-btn ${leftTab === 'comments' ? 'active' : ''}`}
          onClick={() => setLeftTab('comments')}
        >
          Thảo luận
        </button>
      </div>
      <div className="left-tab-content">
        {leftTab === 'desc' ? (
          <ProblemDescription problem={problem} />
        ) : (
          <ProblemComments targetId={problem?.id || ""} targetType="PROBLEM" />
        )}
      </div>
    </div>
  );
};
