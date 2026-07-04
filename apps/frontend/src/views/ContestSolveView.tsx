import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CodeEditorPane } from '../components/editor/CodeEditorPane';
import { ConsolePane } from '../components/editor/ConsolePane';

export function ContestSolveView() {
  const { contestId, problemId } = useParams<{ contestId: string; problemId: string }>();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'cpp' | 'java' | 'python'>('cpp');

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      <div className="font-body text-sm text-stone p-4">
        Contest solving placeholder — /contest/{contestId}/problem/{problemId}
      </div>
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
        isSubmitting={false}
        verdict=""
        showSubmit={false}
        showSampleTests={false}
      />
    </div>
  );
}
