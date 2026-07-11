import { useEffect, useState } from 'react';
import { message } from 'antd';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        }
        
        // Fetch problem if not present
        if (!problem && matchData.problem_id) {
          api.getProblemDetail(matchData.problem_id).then(pres => {
             if (pres.success && pres.data) {
               setProblem(pres.data);
               setCode(pres.data.starterCodes?.[0]?.code || '');
               setLanguage(pres.data.starterCodes?.[0]?.language || 'cpp');
             }
          });
        }
      }
    });

    socketService.onMatchEnded((data: any) => {
      if (data.matchId === matchId) {
        setMatchResult(data);
        setShowResult(true);
      }
    });

    socketService.onSubmissionUpdate((data: any) => {
      if (data.matchId === matchId) {
        // Update participant state
        setParticipants(prev => prev.map(p => {
           if (p.user_id === data.userId) {
             return {
               ...p,
               score_change: data.score_change !== undefined ? data.score_change : p.score_change,
               status: data.new_status || p.status,
               is_winner: data.is_winner !== undefined ? data.is_winner : p.is_winner
             };
           }
           return p;
        }));
      }
    });

    return () => {
      // socket.off happens in socketService if needed, or component unmounts
    };
  }, [matchId]); // Removed problem dependency to avoid infinite loops

  const handleRunCode = async () => {
    // Basic run functionality if needed
  };

  const handleSubmit = async () => {
    if (!problem || !activeMatch?.id) return;
    
    setIsSubmitting(true);
    try {
      const res = await api.submitCode({
        problemId: problem.id || problem._id || problem.slug,
        code,
        language,
        matchId: activeMatch.id,
      });

      if (res.success) {
        message.success('Đã nộp bài thành công! Đang chờ chấm điểm...');
      } else {
        message.error(res.message || 'Lỗi khi nộp bài');
      }
    } catch (err: any) {
      message.error(err.message || 'Lỗi hệ thống khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-0">
        {/* Left Side: Problem Statement */}
        <div className="bg-washi border border-charcoal flex flex-col min-h-0 shadow-lg">
          <ProblemDescription problem={problem} />
        </div>

        {/* Right Side: Code Editor & Console */}
        <div className="flex flex-col gap-4 lg:gap-6 min-h-0">
          <div className="flex-1 bg-ink border border-charcoal shadow-lg min-h-0">
            <CodeEditorPane
              code={code}
              onCodeChange={setCode}
              language={language}
              onLanguageChange={setLanguage as any}
            />
          </div>
          <div className="h-[280px] bg-washi border border-charcoal shadow-lg shrink-0">
            <ConsolePane
              onRun={handleRunCode}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              verdict={""}
            />
          </div>
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
