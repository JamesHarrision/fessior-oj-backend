import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { OpponentStatus } from '../components/editor/OpponentStatus';
import { ProblemDescription } from '../components/editor/ProblemDescription';
import { ProblemComments } from '../components/editor/ProblemComments';
import { ReportForm } from '../components/editor/ReportForm';
import { CodeEditorPane } from '../components/editor/CodeEditorPane';
import { ConsolePane } from '../components/editor/ConsolePane';
import './SoloEditorView.css';

interface SoloEditorViewProps {
  activeMatch?: any;
  problemSlug?: string | null;
}

export const SoloEditorView: React.FC<SoloEditorViewProps> = ({ activeMatch, problemSlug }) => {
  const { user } = useAuth();
  
  // Tabs and problem state
  const [leftTab, setLeftTab] = useState<'desc' | 'comments' | 'report'>('desc');
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
        // Poll for submission evaluation completion
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
        <div className="left-column">
          <div className="left-tabs-header">
            <button 
              className={`left-tab-btn ${leftTab === 'desc' ? 'active' : ''}`}
              onClick={() => setLeftTab('desc')}
            >
              Mô tả
            </button>
            <button 
              className={`left-tab-btn ${leftTab === 'comments' ? 'active' : ''}`}
              onClick={() => setLeftTab('comments')}
            >
              Thảo luận
            </button>
            <button 
              className={`left-tab-btn ${leftTab === 'report' ? 'active' : ''}`}
              onClick={() => setLeftTab('report')}
            >
              Báo cáo
            </button>
          </div>
          <div className="left-tab-content">
            {leftTab === 'desc' ? (
              <ProblemDescription problem={problem} />
            ) : leftTab === 'comments' ? (
              <ProblemComments problemId={problem?.id || problem?._id} />
            ) : (
              <ReportForm problemId={problem?.id || problem?._id} />
            )}
          </div>
        </div>
        
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
        <div className="match-result-overlay">
          <div className="result-modal glass-card">
            <h2>{matchResult.winnerId === user?.id ? '🏆 CHIẾN THẮNG!' : '💀 THẤT BẠI'}</h2>
            <p className="result-subtitle">Kết quả trận đấu PvP Arena</p>
            
            <div className="elo-changes">
              <div className="elo-box">
                <span className="player-label">{user?.username}</span>
                <span className="elo-value">
                  {matchResult.eloUpdates[user?.id || '']?.elo || 1000} 
                  <span className="elo-diff plus">
                    (+{matchResult.eloUpdates[user?.id || '']?.change || 0})
                  </span>
                </span>
              </div>
              {opponent && (
                <div className="elo-box">
                  <span className="player-label">{opponent.username}</span>
                  <span className="elo-value">
                    {matchResult.eloUpdates[opponent.userId]?.elo || 1000}
                    <span className="elo-diff minus">
                      ({matchResult.eloUpdates[opponent.userId]?.change || 0})
                    </span>
                  </span>
                </div>
              )}
            </div>

            <button className="close-result-btn" onClick={() => window.location.reload()}>
              Quay lại sảnh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
