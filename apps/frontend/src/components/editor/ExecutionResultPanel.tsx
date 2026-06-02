import React from 'react';
import { AlertCircle, Clock, Cpu } from 'lucide-react';
import { formatExecutionTime, formatMemoryKb } from '@ocj/utils';

interface ExecutionResultPanelProps {
  isRunning: boolean;
  isSubmitting: boolean;
  runResults: any[] | null;
  runActiveCaseIdx: number;
  setRunActiveCaseIdx: (idx: number) => void;
  verdict: string;
  verdictDetails?: any;
}

export const ExecutionResultPanel: React.FC<ExecutionResultPanelProps> = ({
  isRunning,
  isSubmitting,
  runResults,
  runActiveCaseIdx,
  setRunActiveCaseIdx,
  verdict,
  verdictDetails,
}) => {
  return (
    <div className="console-tab-content">
      {isRunning && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p className="console-loading">Đang biên dịch và thực thi mã nguồn...</p>
        </div>
      )}
      {isSubmitting && (
        <div className="loading-state">
          <div className="spinner submissions"></div>
          <p className="console-loading">Đang chấm điểm trên hệ thống Sandbox...</p>
        </div>
      )}

      {!isRunning && !isSubmitting && !runResults && !verdict && (
        <p className="console-empty">Chưa có kết quả chạy thử. Hãy nhấn nút Chạy thử hoặc Nộp bài.</p>
      )}

      {/* Run Results (Local Chạy Thử) */}
      {!isRunning && !isSubmitting && runResults && (
        <div className="results-container">
          {runResults.some((r) => r.status === 'CE') ? (
            <div className="error-card CE">
              <div className="error-header">
                <AlertCircle size={18} className="error-icon" />
                <span>Lỗi Biên Dịch (Compilation Error)</span>
              </div>
              <pre className="error-details">
                {runResults[0].error || runResults[0].actualOutput || 'No output details provided.'}
              </pre>
            </div>
          ) : runResults.some((r) => r.status === 'RE') ? (
            <div className="error-card RE">
              <div className="error-header">
                <AlertCircle size={18} className="error-icon" />
                <span>Lỗi Thực Thi (Runtime Error)</span>
              </div>
              <pre className="error-details">
                {runResults[0].error || 'Chương trình kết thúc với mã lỗi khác 0.'}
              </pre>
            </div>
          ) : (
            <>
              <div className="case-tabs">
                {runResults.map((result, idx) => (
                  <button
                     key={idx}
                    className={`case-tab-btn ${runActiveCaseIdx === idx ? 'active' : ''} ${result.status}`}
                    onClick={() => setRunActiveCaseIdx(idx)}
                  >
                    Case {idx + 1} ({result.status})
                  </button>
                ))}
              </div>

              {runResults[runActiveCaseIdx] && (
                <div className="case-params">
                  <div className="verdict-banner-container">
                    <span className={`verdict-badge ${runResults[runActiveCaseIdx].status}`}>
                      {runResults[runActiveCaseIdx].status === 'ACCEPTED' ? 'ACCEPTED' : 'WRONG ANSWER'}
                    </span>
                    <div className="metrics-group">
                      <span className="metric-item">
                        <Clock size={12} />
                        {formatExecutionTime(runResults[runActiveCaseIdx].time)}
                      </span>
                      <span className="metric-item">
                        <Cpu size={12} />
                        {formatMemoryKb(runResults[runActiveCaseIdx].memory)}
                      </span>
                    </div>
                  </div>

                  <div className="param-group">
                    <span className="param-label">Input</span>
                    <pre className="param-value-box font-mono">
                      {runResults[runActiveCaseIdx].input || 'Empty input'}
                    </pre>
                  </div>
                  <div className="param-group">
                    <span className="param-label">Your Output</span>
                    <pre className="param-value-box font-mono actual">
                      {runResults[runActiveCaseIdx].actualOutput || 'No output'}
                    </pre>
                  </div>
                  {runResults[runActiveCaseIdx].expectedOutput && (
                    <div className="param-group">
                      <span className="param-label">Expected Output</span>
                      <pre className="param-value-box font-mono expected">
                        {runResults[runActiveCaseIdx].expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Official Verdict Results (Nộp Bài) */}
      {!isRunning && !isSubmitting && verdict && (
        <div className="results-container">
          <div className={`verdict-banner ${verdict}`}>
            {verdict === 'ACCEPTED' ? '✓ ACCEPTED' : `✗ ${verdict}`}
          </div>

          {verdictDetails && (
            <div className="verdict-logs">
              <p>
                <strong>Số lượng Testcases đạt:</strong>{' '}
                <span className="highlight-passed">
                  {verdictDetails.testCasesPassed} / {verdictDetails.testCasesTotal}
                </span>
              </p>
              {verdictDetails.error && (
                <div className="error-card CE mt-3">
                  <div className="error-header">
                    <AlertCircle size={16} />
                    <span>Chi tiết thông báo lỗi</span>
                  </div>
                  <pre className="error-details">{verdictDetails.error}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
