import React, { useState } from 'react';
import { API_LIST, ApiEndpoint } from './apiListData';
import { ApiRequestForm } from './ApiRequestForm';
import { ApiResponseView } from './ApiResponseView';
import { useAuth } from '../../context/AuthContext';
import './ApiTesterView.css';

export const ApiTesterView: React.FC = () => {
  const { token } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_LIST[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [status, setStatus] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [timeTaken, setTimeTaken] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);

  const handleSendRequest = async (path: string, options: RequestInit) => {
    setIsLoading(true);
    setStatus(null);
    setResponseBody(null);
    
    const startTime = performance.now();
    const finalUrl = `http://localhost:6868${path}`;

    try {
      const res = await fetch(finalUrl, options);
      const endTime = performance.now();
      
      setStatus(res.status);
      setStatusText(res.statusText);
      setTimeTaken(Math.round(endTime - startTime));

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
      } catch {
        setResponseBody(text);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setStatus(0);
      setStatusText('Network Error');
      setTimeTaken(Math.round(endTime - startTime));
      setResponseBody(err.message || 'Error occurred while contacting the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Group endpoints by category
  const categories = Array.from(new Set(API_LIST.map(api => api.category)));

  return (
    <div className="api-tester-container">
      <aside className="api-sidebar glass-card">
        {categories.map(cat => (
          <div key={cat} className="category-group">
            <h4 className="category-title">{cat}</h4>
            {API_LIST.filter(api => api.category === cat).map(api => (
              <button
                key={api.id}
                onClick={() => setSelectedEndpoint(api)}
                className={`api-item-btn ${selectedEndpoint.id === api.id ? 'active' : ''}`}
              >
                <span className={`method-badge method-${api.method}`}>{api.method}</span>
                <span>{api.name}</span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      <main className="api-main-content">
        <div className="endpoint-header">
          <h2>{selectedEndpoint.name}</h2>
          <p>{selectedEndpoint.description}</p>
          <div className="endpoint-path-row">
            <span className={`method-badge method-${selectedEndpoint.method}`}>
              {selectedEndpoint.method}
            </span>
            <span className="endpoint-path">{selectedEndpoint.path}</span>
            {selectedEndpoint.requiresAuth && (
              <span className="auth-lock-badge">Requires Authentication</span>
            )}
          </div>
        </div>

        <div className="request-section glass-card">
          <ApiRequestForm
            endpoint={selectedEndpoint}
            token={token}
            onSend={handleSendRequest}
            isLoading={isLoading}
          />
        </div>

        <ApiResponseView
          status={status}
          statusText={statusText}
          timeTaken={timeTaken}
          responseBody={responseBody}
        />
      </main>
    </div>
  );
};
