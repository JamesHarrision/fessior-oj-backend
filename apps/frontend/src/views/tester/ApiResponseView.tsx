import React from 'react';

interface ApiResponseViewProps {
  status: number | null;
  statusText: string | null;
  timeTaken: number | null;
  responseBody: string | null;
}

export const ApiResponseView: React.FC<ApiResponseViewProps> = ({
  status,
  statusText,
  timeTaken,
  responseBody
}) => {
  if (status === null) {
    return (
      <div className="api-response-empty glass-card">
        <p className="placeholder-text">Execute a request to see the response output here.</p>
      </div>
    );
  }

  const isSuccess = status >= 200 && status < 300;
  const badgeClass = isSuccess ? 'status-success' : 'status-error';

  return (
    <div className="api-response-view glass-card">
      <div className="response-header">
        <h3 className="section-title">Response Output</h3>
        <div className="response-meta">
          <span className={`status-badge ${badgeClass}`}>
            {status} {statusText || ''}
          </span>
          {timeTaken !== null && (
            <span className="time-badge">
              Latency: {timeTaken} ms
            </span>
          )}
        </div>
      </div>
      <div className="response-body-container">
        <pre className="response-pre custom-scrollbar code-font">
          <code>{responseBody || 'No response body returned.'}</code>
        </pre>
      </div>
    </div>
  );
};
