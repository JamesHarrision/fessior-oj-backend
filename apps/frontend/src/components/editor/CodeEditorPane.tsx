import React from 'react';
import { ScreenShare, ChevronDown } from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
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
  const [shareActive, setShareActive] = React.useState(false);

  const getExtension = () => {
    if (language === 'python') return 'py';
    if (language === 'cpp') return 'cpp';
    if (language === 'java') return 'java';
    return 'js';
  };

  const getMonacoLanguage = () => {
    if (language === 'cpp') return 'cpp';
    if (language === 'java') return 'java';
    if (language === 'python') return 'python';
    return 'javascript';
  };

  const handleEditorDidMount = (_editor: any, monaco: Monaco) => {
    // Register custom C++ Autocomplete completions
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          { label: 'vector', kind: monaco.languages.CompletionItemKind.Class, insertText: 'vector<${1:int}> ', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::vector', range },
          { label: 'unordered_map', kind: monaco.languages.CompletionItemKind.Class, insertText: 'unordered_map<${1:int}, ${2:int}> ', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::unordered_map', range },
          { label: 'unordered_set', kind: monaco.languages.CompletionItemKind.Class, insertText: 'unordered_set<${1:int}> ', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::unordered_set', range },
          { label: 'sort', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sort(${1:v}.begin(), ${1:v}.end());', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::sort', range },
          { label: 'push_back', kind: monaco.languages.CompletionItemKind.Method, insertText: 'push_back(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: 'pair', kind: monaco.languages.CompletionItemKind.Class, insertText: 'pair<${1:int}, ${2:int}> ', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range }
        ];
        return { suggestions };
      }
    });

    // Register custom Python Autocomplete completions
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          { label: 'defaultdict', kind: monaco.languages.CompletionItemKind.Class, insertText: 'defaultdict(${1:list})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'collections.defaultdict', range },
          { label: 'Counter', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Counter(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'collections.Counter', range },
          { label: 'heappush', kind: monaco.languages.CompletionItemKind.Function, insertText: 'heapq.heappush(${1:heap}, ${2:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'heapq.heappush', range },
          { label: 'heappop', kind: monaco.languages.CompletionItemKind.Function, insertText: 'heapq.heappop(${1:heap})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'heapq.heappop', range },
          { label: 'bisect_left', kind: monaco.languages.CompletionItemKind.Function, insertText: 'bisect.bisect_left(${1:a}, ${2:x})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range }
        ];
        return { suggestions };
      }
    });

    // Register custom Java Autocomplete completions
    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          { label: 'ArrayList', kind: monaco.languages.CompletionItemKind.Class, insertText: 'ArrayList<${1:Integer}> ${2:list} = new ArrayList<>();', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: 'HashMap', kind: monaco.languages.CompletionItemKind.Class, insertText: 'HashMap<${1:Integer}, ${2:Integer}> ${3:map} = new HashMap<>();', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: 'HashSet', kind: monaco.languages.CompletionItemKind.Class, insertText: 'HashSet<${1:Integer}> ${2:set} = new HashSet<>();', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: 'PriorityQueue', kind: monaco.languages.CompletionItemKind.Class, insertText: 'PriorityQueue<${1:Integer}> ${2:pq} = new PriorityQueue<>();', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range }
        ];
        return { suggestions };
      }
    });
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

      <div className="editor-body-monaco">
        <Editor
          height="100%"
          language={getMonacoLanguage()}
          value={code}
          onChange={(val) => onChange(val || '')}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-mono)",
            automaticLayout: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
            },
            padding: { top: 12 },
            lineNumbersMinChars: 3,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
};
