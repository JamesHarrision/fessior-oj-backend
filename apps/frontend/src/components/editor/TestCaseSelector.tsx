import React from 'react';

interface TestCaseSelectorProps {
  testMode: 'sample' | 'custom';
  setTestMode: (mode: 'sample' | 'custom') => void;
  sampleTestCases: any[];
  activeSampleIdx: number;
  setActiveSampleIdx: (idx: number) => void;
  customInput: string;
  setCustomInput: (input: string) => void;
}

export const TestCaseSelector: React.FC<TestCaseSelectorProps> = ({
  testMode,
  setTestMode,
  sampleTestCases,
  activeSampleIdx,
  setActiveSampleIdx,
  customInput,
  setCustomInput,
}) => {
  return (
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
  );
};
