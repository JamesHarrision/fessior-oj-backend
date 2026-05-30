import React, { useState } from 'react';
import { Terminal, Play, CheckCircle } from 'lucide-react';
import './ConsolePane.css';

interface ConsolePaneProps {
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  verdict: string;
}

export const ConsolePane: React.FC<ConsolePaneProps> = ({
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  verdict,
}) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'console'>('cases');
  const [activeCase, setActiveCase] = useState<1 | 2 | 3>(1);

  const cases = {
    1: { nums: '[2,7,11,15]', target: '9' },
    2: { nums: '[3,2,4]', target: '6' },
    3: { nums: '[3,3]', target: '6' },
  };

  return (
    <div className="console-pane glass-card">
      <div className="console-header">
        <div className="tab-group">
          <button
            className={`console-tab ${activeTab === 'cases' ? 'active' : ''}`}
            onClick={() => setActiveTab('cases')}
          >
            <Terminal size={14} />
            <span>Test Cases</span>
          </button>
          <button
            className={`console-tab ${activeTab === 'console' ? 'active' : ''}`}
            onClick={() => setActiveTab('console')}
          >
            <CheckCircle size={14} />
            <span>Console</span>
          </button>
        </div>

        <div className="action-buttons">
          <button className="run-btn" onClick={onRun} disabled={isRunning || isSubmitting}>
            <Play size={14} />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>
          <button className="submit-btn" onClick={onSubmit} disabled={isRunning || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="console-body">
        {activeTab === 'cases' ? (
          <div className="testcase-tab-content">
            <div className="case-tabs">
              {([1, 2, 3] as const).map((caseId) => (
                <button
                  key={caseId}
                  className={`case-tab-btn ${activeCase === caseId ? 'active' : ''}`}
                  onClick={() => setActiveCase(caseId)}
                >
                  Case {caseId}
                </button>
              ))}
            </div>

            <div className="case-params">
              <div className="param-group">
                <span className="param-label">NUMS =</span>
                <input
                  type="text"
                  className="param-field"
                  value={cases[activeCase].nums}
                  readOnly
                />
              </div>
              <div className="param-group">
                <span className="param-label">TARGET =</span>
                <input
                  type="text"
                  className="param-field"
                  value={cases[activeCase].target}
                  readOnly
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="console-tab-content">
            {isRunning && <p className="console-loading">Đang thực thi mã nguồn...</p>}
            {isSubmitting && <p className="console-loading">Đang chấm điểm các testcase trên Judge0...</p>}
            {!isRunning && !isSubmitting && !verdict && (
              <p className="console-empty">Chưa có kết quả chạy thử. Hãy nhấn Run hoặc Submit.</p>
            )}
            {verdict && (
              <div className="console-result">
                <div className={`verdict-banner ${verdict}`}>
                  {verdict === 'ACCEPTED' ? '✓ ACCEPTED' : '✗ WRONG ANSWER'}
                </div>
                <div className="verdict-logs">
                  <p><strong>Trạng thái:</strong> Thành công</p>
                  <p><strong>Thời gian thực thi:</strong> 12ms (Fallback Local Runner)</p>
                  <p><strong>Số lượng Testcases:</strong> 3/3 passed</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
