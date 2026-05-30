import React, { useState } from 'react';
import { ScreenShare, ChevronDown } from 'lucide-react';
import './CodeEditorPane.css';

interface CodeEditorPaneProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
}) => {
  const [shareActive, setShareActive] = useState(false);
  const lineCount = code.split('\n').length;

  const getExtension = () => {
    if (language === 'python') return 'py';
    if (language === 'cpp') return 'cpp';
    if (language === 'java') return 'java';
    return 'js';
  };

  return (
    <div className="code-editor-pane glass-card">
      <div className="editor-header">
        <div className="active-tab">
          <span className="tab-indicator"></span>
          <span className="tab-label">solution.{getExtension()}</span>
        </div>

        <div className="editor-actions">
          <button
            className={`share-screen-btn ${shareActive ? 'active' : ''}`}
            onClick={() => setShareActive(!shareActive)}
          >
            <ScreenShare size={16} />
            <span>{shareActive ? 'Sharing' : 'Share'}</span>
          </button>

          <div className="select-wrapper">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="lang-select"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        </div>
      </div>

      <div className="editor-body">
        <div className="line-numbers">
          {Array.from({ length: Math.max(lineCount, 8) }).map((_, i) => (
            <div key={i} className="line-num">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="code-textarea"
          spellCheck="false"
          placeholder="// Gõ mã nguồn của bạn tại đây"
        />
      </div>
    </div>
  );
};
