import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MatchFindingView } from './views/MatchFindingView';
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
            <div className="glass-card" style={{ textAlign: 'center', marginTop: '40px' }}>
              <h2>Solo Editor Screen</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                (Chúng ta sẽ tích hợp các thành phần của trình soạn thảo mã tại đây ở bước tiếp theo)
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
