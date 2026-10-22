import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export default function Header({ onRefresh, isRefreshing, demoMode = false }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-section">
          <div className="brand-icon">
            <Activity size={26} />
          </div>
          <div>
            <h1 className="brand-title">
              AeroTrack <span className="highlight-badge">AQI</span>
            </h1>
            <p className="brand-subtitle">Real-Time Global Air Quality Aggregator & Mapping System</p>
          </div>
        </div>

        <div className="header-actions">
          <div className={`status-badge${demoMode ? ' demo-status' : ''}`}>
            <span className="live-dot" />
            <span>{demoMode ? 'Demo data active' : 'Live Collector Active'}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`btn btn-secondary${isRefreshing ? ' spinning' : ''}`}
            title="Trigger background data sync now"
          >
            <RefreshCw size={15} />
            <span>{isRefreshing ? 'Syncing…' : 'Sync Data'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
