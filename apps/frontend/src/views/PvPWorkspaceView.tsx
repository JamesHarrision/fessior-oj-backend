import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { CodeEditorPane } from '../components/editor/CodeEditorPane';
import { ConsolePane } from '../components/editor/ConsolePane';
import { ProblemDescription } from '../components/editor/ProblemDescription';
import { OpponentStatus } from '../components/editor/OpponentStatus';
import { MatchResultModal } from '../components/editor/MatchResultModal';
import type { IMatch } from '@ocj/types';

export function PvPWorkspaceView() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeMatch, setActiveMatch] = useState<IMatch | null>(null);
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'cpp' | 'java' | 'python'>('cpp');
  const [showResult, setShowResult] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  // ── Load match + problem ──
  useEffect(() => {
    if (!matchId) return;
    // Match data came from socket/store; for now, load problem from match
    socketService.onMatchFound((data: any) => {
      setActiveMatch({ ...data, id: data.matchId } as unknown as IMatch);
      setProblem(data.problem);
      setCode(data.problem?.starterCodes?.[language] ?? '');
    });
    socketService.onMatchEnded((data: any) => {
      setMatchResult(data);
      setShowResult(true);
    });
    return () => {
      socketService.leaveQueue();
    };
  }, [matchId, language]);

  const handleSubmit = async () => {
    if (!problem || !activeMatch?.id) return;
    await api.submitCode({
      problemId: problem.id || problem._id || problem.slug,
      code,
      language,
      matchId: activeMatch.id,
    });
  };

  const handleCloseResult = () => {
    setShowResult(false);
    navigate('/match');
  };

  if (!matchId) return null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ── Opponent Status ── */}
      <OpponentStatus matchId={matchId} />

      {/* ── Main layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left: Problem Description */}
        <div className="overflow-y-auto">
          {problem && (
            <ProblemDescription
              problem={problem}
              onSelectLanguage={setLanguage}
            />
          )}
        </div>

        {/* Right: Editor + Console */}
        <div className="flex flex-col gap-3 min-h-0">
          <CodeEditorPane
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
          />
          <ConsolePane
            problem={problem}
            code={code}
            language={language}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* ── Match Result Modal ── */}
      {showResult && matchResult && (
        <MatchResultModal
          result={matchResult}
          currentUserId={user?.id ?? ''}
          onClose={handleCloseResult}
        />
      )}
    </div>
  );
}
