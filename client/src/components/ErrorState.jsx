import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state-container">
      <div className="error-icon-box">
        <AlertOctagon size={48} className="error-pulse" />
      </div>
      <h2>Connection or Service Interruption</h2>
      <p className="error-message">
        {message || 'Unable to communicate with backend API server. Please ensure the server is running on port 5000.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          <RefreshCw size={18} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
