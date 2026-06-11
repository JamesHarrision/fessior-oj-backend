import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { TestCaseSelector } from './TestCaseSelector';
import { ExecutionResultPanel } from './ExecutionResultPanel';
import type { IProblem } from '@ocj/types';
import './ConsolePane.css';

interface ConsolePaneProps {
  problem: IProblem | null;
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
        setRunResults([
          {
            status: 'CE',
            error: 'Không thể kết nối đến hệ thống biên dịch.',
            actualOutput: '',
            input: testMode === 'custom' ? customInput : '',
          },
        ]);
      }
    } catch (err: any) {
      setRunResults([
        {
          status: 'CE',
          error: err.message || 'Lỗi không xác định khi thực thi mã nguồn.',
          actualOutput: '',
          input: testMode === 'custom' ? customInput : '',
        },
      ]);
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
          <TestCaseSelector
            testMode={testMode}
            setTestMode={setTestMode}
            sampleTestCases={sampleTestCases}
            activeSampleIdx={activeSampleIdx}
            setActiveSampleIdx={setActiveSampleIdx}
            customInput={customInput}
            setCustomInput={setCustomInput}
          />
        ) : (
          <ExecutionResultPanel
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            runResults={runResults}
            runActiveCaseIdx={runActiveCaseIdx}
            setRunActiveCaseIdx={setRunActiveCaseIdx}
            verdict={verdict}
            verdictDetails={verdictDetails}
          />
        )}
      </div>
    </div>
  );
};
