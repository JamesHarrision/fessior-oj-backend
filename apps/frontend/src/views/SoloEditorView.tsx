import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { OpponentStatus } from '../components/editor/OpponentStatus';
import { LeftTabPanel } from '../components/editor/LeftTabPanel';
import { MatchResultModal } from '../components/editor/MatchResultModal';
import { CodeEditorPane } from '../components/editor/CodeEditorPane';
import { ConsolePane } from '../components/editor/ConsolePane';
import './SoloEditorView.css';

interface SoloEditorViewProps {
  activeMatch?: any;
  problemSlug?: string | null;
}

export const SoloEditorView: React.FC<SoloEditorViewProps> = ({ activeMatch, problemSlug }) => {
  const { user } = useAuth();
  
  // Problem states
  const [problem, setProblem] = useState<any>(activeMatch?.problem || null);
  const [problemsList, setProblemsList] = useState<any[]>([]);
  
  // Code editor states
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'python' | 'cpp' | 'java'>('python');
  
  // Evaluation/Console states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [verdictDetails, setVerdictDetails] = useState<any>(null);

  // Match / Competitor states
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [userProgress, setUserProgress] = useState(0);
  const [matchResult, setMatchResult] = useState<any>(null);

  // Log to avoid unused var compiler error
  useEffect(() => {
    if (verdictDetails) {
      console.log('Verdict detail stats:', verdictDetails);
    }
  }, [verdictDetails]);

  const fetchProblemDetail = async (slug: string) => {
    try {
      const res = await api.getProblemDetail(slug);
      if (res.success && res.data) {
        setProblem(res.data);
      }
    } catch (err) {
      console.error('Error fetching problem details:', err);
    }
  };

  // Fetch problems if not in active match
  useEffect(() => {
    if (activeMatch) return;
    
    if (problemSlug) {
      fetchProblemDetail(problemSlug);
    } else {
      api.getProblems().then((res) => {
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
          if (list.length > 0) {
            setProblemsList(list);
            fetchProblemDetail(list[0].slug);
          }
        }
      });
    }
  }, [activeMatch, problemSlug]);

  // Set default starter code whenever problem or language changes
  useEffect(() => {
    if (problem) {
      const templates = problem.starterCodes || {};
      setCode(templates[language] || `// Viết code của bạn tại đây (${language})`);
    }
  }, [problem, language]);

  // Listen to live socket events for matchmaking/duels
  useEffect(() => {
    if (!activeMatch) return;

    socketService.onRivalSubmission((data) => {
      const percent = data.testCasesTotal > 0 
        ? Math.round((data.testCasesPassed / data.testCasesTotal) * 100)
        : 0;
      setOpponentProgress(percent);
      if (data.status === 'ACCEPTED') {
        setOpponentSubmitted(true);
      }
    });

    socketService.onMatchEnded((data) => {
      setMatchResult(data);
    });
  }, [activeMatch]);

  const runSubmissionPoll = async (submissionId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.getSubmissionDetail(submissionId);
        if (res.success && res.data && res.data.status !== 'PENDING') {
          clearInterval(interval);
          setIsSubmitting(false);
          
          const details = res.data;
          setVerdict(details.status);
          setVerdictDetails({
            timeLimit: details.timeLimit || 2000,
            memoryLimit: details.memoryLimit || 256,
            testCasesPassed: details.testCasesPassed || 0,
            testCasesTotal: details.testCasesTotal || 0,
            error: details.errorMessage,
          });

          const percent = details.testCasesTotal > 0
            ? Math.round((details.testCasesPassed / details.testCasesTotal) * 100)
            : 0;
          setUserProgress(percent);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setIsSubmitting(false);
      }
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setVerdict('');
    setVerdictDetails(null);

    try {
      const res = await api.submitCode({
        problemId: problem.id || problem._id || problem.slug,
        code,
        language,
      });

      if (res.success && res.data) {
        runSubmissionPoll(res.data.id || res.data._id);
      } else {
        setIsSubmitting(false);
        setVerdict('ERROR');
      }
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setVerdict('ERROR');
    }
  };

  // Identify opponent profile details
  const opponent = activeMatch 
    ? (activeMatch.player1.userId === user?.id ? activeMatch.player2 : activeMatch.player1)
    : null;

  return (
    <div className="solo-editor-view">
      {opponent && (
        <div className="status-row">
          <OpponentStatus
            opponentName={opponent.username}
            opponentAvatar={`https://api.dicebear.com/7.x/adventurer/svg?seed=${opponent.username}`}
            isSubmitted={opponentSubmitted}
            timeLeftSeconds={600} // 10 minutes default match length
            userProgress={userProgress}
            opponentProgress={opponentProgress}
          />
        </div>
      )}

      {!activeMatch && problemsList.length > 0 && (
        <div className="problem-selector-row">
          <label>Chọn đề bài luyện tập: </label>
          <select 
            value={problem?.slug} 
            onChange={(e) => fetchProblemDetail(e.target.value)}
            className="problems-dropdown"
          >
            {problemsList.map(p => (
              <option key={p.slug} value={p.slug}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="editor-main-layout">
        <LeftTabPanel problem={problem} />
        
        <div className="right-column">
          <CodeEditorPane
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={(lang: any) => setLanguage(lang)}
          />
          
          <ConsolePane
            problem={problem}
            code={code}
            language={language}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            verdict={verdict}
            verdictDetails={verdictDetails}
          />
        </div>
      </div>

      {matchResult && (
        <MatchResultModal
          matchResult={matchResult}
          user={user}
          opponent={opponent}
          onClose={() => window.location.reload()}
        />
      )}
    </div>
  );
};
