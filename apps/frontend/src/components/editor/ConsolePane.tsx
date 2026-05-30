import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle, AlertCircle, Clock, Cpu } from 'lucide-react';
import { api } from '../../services/api';
import './ConsolePane.css';

interface ConsolePaneProps {
  problem: any;
  code: string;
  language: string;
  onSubmit: () => void;
  isSubmitting: boolean;
  verdict: string;
  verdictDetails?: any;
}

export const ConsolePane: React.FC<ConsolePaneProps> = ({
  problem,
  code,
  language,
  onSubmit,
  isSubmitting,
  verdict,
  verdictDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'result'>('cases');
  const [testMode, setTestMode] = useState<'sample' | 'custom'>('sample');
  const [sampleTestCases, setSampleTestCases] = useState<any[]>([]);
  const [activeSampleIdx, setActiveSampleIdx] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>('');
  
  // Local execution/running states
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<any[] | null>(null);
  const [runActiveCaseIdx, setRunActiveCaseIdx] = useState<number>(0);

  const problemId = problem?.id || problem?._id || problem?.slug;

  // Fetch sample test cases when problem changes
  useEffect(() => {
    if (problemId) {
      api.getTestcases(problemId, true).then((res) => {
        if (res.success && res.data) {
          setSampleTestCases(res.data);
          setActiveSampleIdx(0);
          // Set initial custom input placeholder based on first sample if available
          if (res.data.length > 0) {
            setCustomInput(res.data[0].input);
          }
        }
      });
    }
  }, [problemId]);

  // Synchronize submission state to automatically open Results tab
  useEffect(() => {
    if (verdict || isSubmitting) {
      setActiveTab('result');
      // Clear local runs when a real submission is made
      setRunResults(null);
    }
  }, [verdict, isSubmitting]);

  const handleRunCode = async () => {
    if (!problemId) return;
    setIsRunning(true);
    setRunResults(null);
    setActiveTab('result');
    
    try {
      const payload = {
        problemId,
        code,
        language,
        customInput: testMode === 'custom' ? customInput : undefined,
      };
      
      const res = await api.runCode(payload);
      if (res.success && res.data) {
        setRunResults(res.data);
        setRunActiveCaseIdx(0);
      } else {
        setRunResults([{
          status: 'CE',
          error: 'Không thể kết nối đến hệ thống biên dịch.',
          actualOutput: '',
          input: testMode === 'custom' ? customInput : '',
        }]);
      }
    } catch (err: any) {
      setRunResults([{
        status: 'CE',
        error: err.message || 'Lỗi không xác định khi thực thi mã nguồn.',
        actualOutput: '',
        input: testMode === 'custom' ? customInput : '',
      }]);
    } finally {
      setIsRunning(false);
    }
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
            <span>Kiểm thử</span>
          </button>
          <button
            className={`console-tab ${activeTab === 'result' ? 'active' : ''}`}
            onClick={() => setActiveTab('result')}
          >
            <CheckCircle size={14} />
            <span>Kết quả</span>
          </button>
        </div>

        <div className="action-buttons">
          <button className="run-btn" onClick={handleRunCode} disabled={isRunning || isSubmitting}>
            <Play size={14} />
            <span>{isRunning ? 'Đang chạy...' : 'Chạy thử'}</span>
          </button>
          <button className="submit-btn" onClick={onSubmit} disabled={isRunning || isSubmitting}>
            <span>{isSubmitting ? 'Đang nộp...' : 'Nộp bài'}</span>
          </button>
        </div>
      </div>

      <div className="console-body">
        {activeTab === 'cases' ? (
          <div className="testcase-tab-content">
            <div className="test-mode-selector">
              <button
                className={`mode-btn ${testMode === 'sample' ? 'active' : ''}`}
                onClick={() => setTestMode('sample')}
              >
                Testcase mẫu
              </button>
              <button
                className={`mode-btn ${testMode === 'custom' ? 'active' : ''}`}
                onClick={() => setTestMode('custom')}
              >
                Tùy biến Input
              </button>
            </div>

            {testMode === 'sample' ? (
              <>
                <div className="case-tabs">
                  {sampleTestCases.map((_, idx) => (
                    <button
                      key={idx}
                      className={`case-tab-btn ${activeSampleIdx === idx ? 'active' : ''}`}
                      onClick={() => setActiveSampleIdx(idx)}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                  {sampleTestCases.length === 0 && (
                    <span className="no-cases-text">Không có testcase mẫu</span>
                  )}
                </div>

                {sampleTestCases[activeSampleIdx] && (
                  <div className="case-params">
                    <div className="param-group">
                      <span className="param-label">Input</span>
                      <pre className="param-value-box">
                        {sampleTestCases[activeSampleIdx].input || 'Empty input'}
                      </pre>
                    </div>
                    <div className="param-group">
                      <span className="param-label">Expected Output</span>
                      <pre className="param-value-box">
                        {sampleTestCases[activeSampleIdx].output || 'Empty output'}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="custom-input-wrapper">
                <span className="param-label">Dữ liệu đầu vào (stdin)</span>
                <textarea
                  className="custom-input-textarea"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Nhập stdin cho chương trình của bạn..."
                  spellCheck="false"
                />
              </div>
            )}
          </div>
        ) : (
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
                {runResults.some(r => r.status === 'CE') ? (
                  <div className="error-card CE">
                    <div className="error-header">
                      <AlertCircle size={18} className="error-icon" />
                      <span>Lỗi Biên Dịch (Compilation Error)</span>
                    </div>
                    <pre className="error-details">
                      {runResults[0].error || runResults[0].actualOutput || 'No output details provided.'}
                    </pre>
                  </div>
                ) : runResults.some(r => r.status === 'RE') ? (
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
                              {runResults[runActiveCaseIdx].time} ms
                            </span>
                            <span className="metric-item">
                              <Cpu size={12} />
                              {runResults[runActiveCaseIdx].memory} KB
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
        )}
      </div>
    </div>
  );
};
