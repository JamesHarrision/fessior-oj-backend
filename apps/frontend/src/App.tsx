import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MatchFindingView } from './views/MatchFindingView';
import { SoloEditorView } from './views/SoloEditorView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<string>('match');

  const handleStartMatch = () => {
    setCurrentView('editor');
  };

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
            <SoloEditorView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
