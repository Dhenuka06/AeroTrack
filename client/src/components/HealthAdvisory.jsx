import React from 'react';
import { HeartHandshake, ShieldAlert, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { getAQICategoryDetails } from '../utils/aqiUtils';

export default function HealthAdvisory({ aqiValue }) {
  const details = getAQICategoryDetails(aqiValue || 0);

  return (
    <div className="health-advisory-card" style={{ borderColor: details.borderColor }}>
      <div className="advisory-header" style={{ backgroundColor: details.bgColor }}>
        <div className="advisory-title-group">
          <HeartHandshake size={24} style={{ color: details.color }} />
          <div>
            <h3>Health Advisory & Recommendations</h3>
            <span className="advisory-sub">Guidance based on current level: <strong>{details.label} ({aqiValue || 0} AQI)</strong></span>
          </div>
        </div>

        <div className="advisory-category-pill" style={{ backgroundColor: details.color }}>
          {details.label}
        </div>
      </div>

      <div className="advisory-body grid-2-col">
        <div className="advisory-box">
          <div className="box-title">
            <UserCheck size={18} className="icon-emerald" />
            <h4>General Population Guidance</h4>
          </div>
          <p className="box-text">{details.description}</p>
        </div>

        <div className="advisory-box">
          <div className="box-title">
            <ShieldAlert size={18} className="icon-amber" />
            <h4>Sensitive Groups Warning</h4>
          </div>
          <p className="box-text">
            {aqiValue <= 50
              ? 'Safe for children, elderly, and individuals with respiratory condition.'
              : aqiValue <= 100
              ? 'People with asthma or heart conditions should monitor for symptoms during outdoor exertion.'
              : 'Sensitive groups (children, elderly, adults with lung/heart conditions) should avoid prolonged outdoor exposure.'}
          </p>
        </div>
      </div>

      <div className="advisory-actions-list">
        <h4><CheckCircle2 size={16} className="inline-icon" /> Recommended Health Actions:</h4>
        <div className="action-tags">
          {aqiValue <= 50 ? (
            <>
              <span className="action-tag green">Outdoor activities safe</span>
              <span className="action-tag green">Open windows for ventilation</span>
              <span className="action-tag green">No mask required</span>
            </>
          ) : aqiValue <= 100 ? (
            <>
              <span className="action-tag yellow">Moderate outdoor activity</span>
              <span className="action-tag yellow">Ventilate during low-traffic hours</span>
              <span className="action-tag yellow">Sensitive groups carry medication</span>
            </>
          ) : aqiValue <= 150 ? (
            <>
              <span className="action-tag orange">Wear N95 mask outdoors if sensitive</span>
              <span className="action-tag orange">Reduce intense outdoor exercise</span>
              <span className="action-tag orange">Close windows during high smog hours</span>
            </>
          ) : (
            <>
              <span className="action-tag red">Wear N95/KN95 masks outside</span>
              <span className="action-tag red">Run indoor HEPA air purifiers</span>
              <span className="action-tag red">Avoid all strenuous outdoor exertion</span>
              <span className="action-tag red">Keep windows and doors closed</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
