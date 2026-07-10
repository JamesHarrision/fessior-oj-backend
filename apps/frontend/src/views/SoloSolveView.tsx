import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { CodeEditorPane } from '../components/editor/CodeEditorPane';
import { ConsolePane } from '../components/editor/ConsolePane';
import { ProblemDescription } from '../components/editor/ProblemDescription';

export function SoloSolveView() {
  const { problemSlug } = useParams<{ problemSlug: string }>();
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'cpp' | 'java' | 'python'>('cpp');

  useEffect(() => {
    if (!problemSlug) return;
    const fetchProblem = async () => {
      try {
        const res = await api.getProblemDetail(problemSlug);
        if (res.success && res.data) {
          setProblem(res.data);
          setCode(res.data.starterCodes?.[language] ?? '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblem();
  }, [problemSlug, language]);

  const handleSubmit = async () => {
    if (!problem) return;
    await api.submitCode({
      problemId: problem.id || problem._id || problem.slug,
      code,
      language,
    });
  };

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="font-body text-sm text-stone">Đang tải bài toán...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
      {/* Left: Problem Description */}
      <div className="overflow-y-auto">
        <ProblemDescription problem={problem} />
      </div>

      {/* Right: Editor + Console */}
      <div className="flex flex-col gap-3 min-h-0">
        <CodeEditorPane
          code={code}
          language={language}
          onCodeChange={setCode}
          onLanguageChange={(lang) => setLanguage(lang as any)}
        />
        <ConsolePane
          problem={problem}
          code={code}
          language={language}
          onSubmit={handleSubmit}
          isSubmitting={false}
          verdict={""}
        />
      </div>
    </div>
  );
}
