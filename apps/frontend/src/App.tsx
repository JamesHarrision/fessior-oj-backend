import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MatchFindingView } from './views/MatchFindingView';
import { SoloEditorView } from './views/SoloEditorView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import './App.css';

function AppContent() {
  const { user, token, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('match');
  const [activeMatch, setActiveMatch] = useState<any>(null);

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
          {currentView === 'editor' && (
            <SoloEditorView activeMatch={activeMatch} />
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
