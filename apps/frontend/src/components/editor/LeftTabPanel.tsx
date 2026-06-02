import React, { useState } from 'react';
import { ProblemDescription } from './ProblemDescription';
import { ProblemComments } from './ProblemComments';
import { ReportForm } from './ReportForm';

interface LeftTabPanelProps {
  problem: any;
}

export const LeftTabPanel: React.FC<LeftTabPanelProps> = ({ problem }) => {
  const [leftTab, setLeftTab] = useState<'desc' | 'comments' | 'report'>('desc');
  const problemId = problem?.id || problem?._id;

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
        <button
          className={`left-tab-btn ${leftTab === 'report' ? 'active' : ''}`}
          onClick={() => setLeftTab('report')}
        >
          Báo cáo
        </button>
      </div>
      <div className="left-tab-content">
        {leftTab === 'desc' ? (
          <ProblemDescription problem={problem} />
        ) : leftTab === 'comments' ? (
          <ProblemComments problemId={problemId} />
        ) : (
          <ReportForm problemId={problemId} />
        )}
      </div>
    </div>
  );
};
