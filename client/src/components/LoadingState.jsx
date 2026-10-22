import React from 'react';

export default function LoadingState() {
  return (
    <div className="loading-state-container">
      <div className="skeleton skeleton-banner"></div>
      <div className="grid-layout">
        <div className="skeleton skeleton-card-lg"></div>
        <div className="skeleton skeleton-card-md"></div>
      </div>
      <div className="skeleton skeleton-map"></div>
    </div>
  );
}
