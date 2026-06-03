import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MatchFindingView } from './views/MatchFindingView';
import { SoloEditorView } from './views/SoloEditorView';
import { RankingView } from './views/RankingView';
import { ShopView } from './views/ShopView';
import { ContestView } from './views/ContestView';
import { SettingsView } from './views/SettingsView';
import { AIView } from './views/AIView';
import { ApiTesterView } from './views/tester/ApiTesterView';
import { ProblemsView } from './views/ProblemsView';
import { SubmissionsView } from './views/SubmissionsView';
import { CustomRoomsView } from './views/CustomRoomsView';
import { AdminDashboard } from './views/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import './App.css';

function AppContent() {
  const { user, token, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    const cleaned = hash.startsWith('/') ? hash.substring(1) : hash;
    if (cleaned.startsWith('admin')) {
      return cleaned;
    }
    const allowed = ['match', 'contest', 'ranking', 'shop', 'editor', 'ai', 'settings', 'tester', 'problems', 'submissions', 'custom-rooms'];
    return allowed.includes(cleaned) ? cleaned : 'match';
  });
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [selectedProblemSlug, setSelectedProblemSlug] = useState<string | null>(null);

  useEffect(() => {
    window.location.hash = '/' + currentView;
  }, [currentView]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const cleaned = hash.startsWith('/') ? hash.substring(1) : hash;
      const allowed = ['match', 'contest', 'ranking', 'shop', 'editor', 'ai', 'settings', 'tester', 'problems', 'submissions', 'custom-rooms'];
      if (cleaned.startsWith('admin') || allowed.includes(cleaned)) {
        setCurrentView(cleaned);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleStartMatch = (matchData: any) => {
    setActiveMatch(matchData);
    setSelectedProblemSlug(null);
    setCurrentView('editor');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin phiên đăng nhập...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <AuthModal />;
  }

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="main-content">
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="view-container">
          {currentView === 'match' && (
            <MatchFindingView onStartMatch={handleStartMatch} />
          )}
          {currentView === 'contest' && (
            <ContestView />
          )}
          {currentView === 'ranking' && (
            <RankingView />
          )}
          {currentView === 'shop' && (
            <ShopView />
          )}
          {currentView === 'editor' && (
            <SoloEditorView activeMatch={activeMatch} problemSlug={selectedProblemSlug} />
          )}
          {currentView === 'ai' && (
            <AIView />
          )}
          {currentView === 'settings' && (
            <SettingsView />
          )}
          {currentView === 'tester' && (
            <ApiTesterView />
          )}
          {currentView === 'problems' && (
            <ProblemsView onSelectProblem={(slug) => {
              setSelectedProblemSlug(slug);
              setCurrentView('editor');
            }} />
          )}
          {currentView === 'submissions' && (
            <SubmissionsView />
          )}
          {currentView === 'custom-rooms' && (
            <CustomRoomsView onStartCustomMatch={(matchId, problemId) => {
              setActiveMatch({ id: matchId, problem_id: problemId });
              setCurrentView('editor');
            }} />
          )}
          {currentView.startsWith('admin') && (
            <AdminDashboard currentSubView={currentView} onViewChange={setCurrentView} />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
