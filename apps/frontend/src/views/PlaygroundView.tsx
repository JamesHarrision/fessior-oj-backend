import { useState } from 'react';
import { CodeEditorPane } from '../components/editor/CodeEditorPane';
import { ConsolePane } from '../components/editor/ConsolePane';

export function PlaygroundView() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'cpp' | 'java' | 'python'>('cpp');

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      <CodeEditorPane
        code={code}
        language={language}
        onCodeChange={setCode}
        onLanguageChange={setLanguage}
      />
      <ConsolePane
        problem={null}
        code={code}
        language={language}
        onSubmit={() => {}}
      />
    </div>
  );
}
