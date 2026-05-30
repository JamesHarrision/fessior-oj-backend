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
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import './App.css';

function AppContent() {
  const { user, token, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    const allowedViews = ['match', 'contest', 'ranking', 'shop', 'editor', 'ai', 'settings'];
    return allowedViews.includes(hash) ? hash : 'match';
  });
  const [activeMatch, setActiveMatch] = useState<any>(null);

  useEffect(() => {
    window.location.hash = currentView;
  }, [currentView]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const allowedViews = ['match', 'contest', 'ranking', 'shop', 'editor', 'ai', 'settings'];
      if (allowedViews.includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleStartMatch = (matchData: any) => {
    setActiveMatch(matchData);
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
            <SoloEditorView activeMatch={activeMatch} />
          )}
          {currentView === 'ai' && (
            <AIView />
          )}
          {currentView === 'settings' && (
            <SettingsView />
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
