import React, { useState, useEffect } from 'react';
import type { ApiEndpoint } from './apiListData';
import { Play } from 'lucide-react';

interface ApiRequestFormProps {
  endpoint: ApiEndpoint;
  token: string | null;
  onSend: (path: string, options: RequestInit) => Promise<void>;
  isLoading: boolean;
}

export const ApiRequestForm: React.FC<ApiRequestFormProps> = ({
  endpoint,
  token,
  onSend,
  isLoading
}) => {
  const [body, setBody] = useState('');
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    setBody(endpoint.defaultBody || '');
    const initialParams: Record<string, string> = {};
    if (endpoint.pathParams) {
      endpoint.pathParams.forEach(p => {
        initialParams[p] = '';
      });
    }
    setParams(initialParams);
  }, [endpoint]);

  const handleParamChange = (name: string, value: string) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Replace parameters in path
    let requestPath = endpoint.path;
    if (endpoint.pathParams) {
      Object.entries(params).forEach(([name, val]) => {
        requestPath = requestPath.replace(`:${name}`, val || `:${name}`);
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (endpoint.requiresAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method: endpoint.method,
      headers
    };

    if (endpoint.method !== 'GET' && body) {
      try {
        // Validate JSON
        JSON.parse(body);
        options.body = body;
      } catch (err) {
        alert('Invalid JSON in request body');
        return;
      }
    }

    onSend(requestPath, options);
  };

  return (
    <form onSubmit={handleSubmit} className="api-request-form">
      {endpoint.pathParams && endpoint.pathParams.length > 0 && (
        <div className="form-group-params">
          <h3 className="section-title">Path Parameters</h3>
          {endpoint.pathParams.map(param => (
            <div key={param} className="param-input-group">
              <label htmlFor={`param-${param}`}>:{param}</label>
              <input
                id={`param-${param}`}
                type="text"
                value={params[param] || ''}
                onChange={(e) => handleParamChange(param, e.target.value)}
                placeholder={`Value for ${param}`}
                required
                className="glass-input"
              />
            </div>
          ))}
        </div>
      )}

      {endpoint.method !== 'GET' && (
        <div className="form-group-body">
          <h3 className="section-title">Request Body (JSON)</h3>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="{}"
            rows={8}
            className="glass-textarea code-font"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-send-request glass-button"
      >
        <Play size={16} />
        {isLoading ? 'Sending...' : 'Execute Request'}
      </button>
    </form>
  );
};
