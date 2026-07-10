import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { CodeEditorPane } from '../components/editor/CodeEditorPane';
import { ConsolePane } from '../components/editor/ConsolePane';
import { ProblemDescription } from '../components/editor/ProblemDescription';
import { MatchResultModal } from '../components/editor/MatchResultModal';
import { MultiplayerLeaderboard } from '../components/editor/MultiplayerLeaderboard';
import type { IMatch, IMatchParticipant } from '@ocj/types';

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
  
  // N-player state
  const [participants, setParticipants] = useState<IMatchParticipant[]>([]);

  // ── Load match + problem ──
  useEffect(() => {
    if (!matchId) return;

    // Fetch match details just in case we are entering from Custom Room (which only passes matchId)
    api.getMatchDetails(matchId).then(res => {
      if (res.success && res.data) {
        const matchData = res.data;
        setActiveMatch(matchData);
        if (matchData.participants) {
          setParticipants(matchData.participants);
        } else if (matchData.player1_id && matchData.player2_id) {
          // Convert 1v1 to participants array for unified UI
          setParticipants([
            { user_id: matchData.player1_id, status: matchData.player1_status, user: matchData.player1 } as any,
            { user_id: matchData.player2_id, status: matchData.player2_status, user: matchData.player2 } as any,
          ]);
        }
        
        // Fetch problem if not present
        if (!problem && matchData.problem_id) {
          api.getProblemDetail(matchData.problem_id).then(pres => {
             if (pres.success && pres.data) {
                setProblem(pres.data);
                setCode(pres.data.starterCodes?.[language] ?? '');
             }
          });
        }
      }
    }).catch(console.error);

    // Realtime Events
    socketService.onMatchFound((data: any) => {
      setActiveMatch({ ...data, id: data.matchId } as unknown as IMatch);
      setProblem(data.problem);
      setCode(data.problem?.starterCodes?.[language] ?? '');
      if (data.player1 && data.player2) {
        setParticipants([
          { user_id: data.player1.userId, user: data.player1, status: 'CODING' } as any,
          { user_id: data.player2.userId, user: data.player2, status: 'CODING' } as any
        ]);
      }
    });

    socketService.onMatchEnded((data: any) => {
      setMatchResult(data);
      setShowResult(true);
    });

    // Realtime Submission updates from ANY rival (N-player)
    socketService.onRivalSubmission((data: any) => {
      setParticipants(prev => prev.map(p => {
        if (p.user_id === data.userId) {
          return { ...p, status: data.status === 'ACCEPTED' ? 'ACCEPTED' : 'SUBMITTED_WA' };
        }
        return p;
      }));
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
    <div className="flex flex-col h-full gap-4 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
      {/* ── Multiplayer Leaderboard ── */}
      <MultiplayerLeaderboard participants={participants} currentUserId={user?.id || ''} />

      {/* ── Main layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left: Problem Description */}
        <div className="overflow-y-auto border border-charcoal bg-ink p-4">
          {problem ? (
            <ProblemDescription problem={problem} />
          ) : (
             <div className="flex items-center justify-center h-full text-stone">Đang tải đề bài...</div>
          )}
        </div>

        {/* Right: Editor + Console */}
        <div className="flex flex-col gap-4 min-h-0">
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
