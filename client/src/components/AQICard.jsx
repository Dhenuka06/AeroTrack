import React from 'react';
import { MapPin, Clock, ShieldCheck, Database } from 'lucide-react';
import { getAQICategoryDetails, formatDate } from '../utils/aqiUtils';

export default function AQICard({ reading, city }) {
  if (!reading && !city) return null;

  const aqiValue = reading ? reading.aqi : 0;
  const categoryDetails = getAQICategoryDetails(aqiValue);
  const cityName = city ? city.name : (reading ? reading.cityName : 'Selected Location');
  const country = city ? city.country : '';

  // Calculate percentage along 0-500 scale for progress indicator
  const progressPercent = Math.min(100, Math.max(0, (aqiValue / 350) * 100));

  return (
    <div className="aqi-card" style={{ borderColor: categoryDetails.borderColor }}>
      <div className="aqi-card-header">
        <div className="location-info">
          <div className="location-title">
            <MapPin size={20} className="pin-icon" />
            <h2>{cityName}</h2>
            {country && <span className="country-tag">{country}</span>}
          </div>
          <p className="aqi-card-subtitle">{categoryDetails.description}</p>
        </div>

        <div className="dominant-badge">
          <span>Dominant: <strong>{reading?.dominantPollutant || 'PM2.5'}</strong></span>
        </div>
      </div>

      <div className="aqi-main-display">
        <div className="aqi-score-container" style={{ backgroundColor: categoryDetails.bgColor }}>
          <span className="aqi-number" style={{ color: categoryDetails.color }}>
            {aqiValue}
          </span>
          <span className="aqi-unit">AQI (US EPA)</span>
        </div>

        <div className="aqi-status-details">
          <div className="status-pill" style={{ backgroundColor: categoryDetails.color, color: '#fff' }}>
            <ShieldCheck size={16} />
            <span>{categoryDetails.label}</span>
          </div>

          <div className="severity-meter-container">
            <div className="severity-bar-track">
              <div
                className="severity-bar-fill"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: categoryDetails.color,
                }}
              />
            </div>
            <div className="severity-labels">
              <span>0 (Good)</span>
              <span>100</span>
              <span>200</span>
              <span>300+ (Hazardous)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="aqi-card-footer">
        <div className="footer-item">
          <Clock size={14} />
          <span>Last Updated: {formatDate(reading?.timestamp)}</span>
        </div>
        <div className="footer-item">
          <Database size={14} />
          <span>Source: {reading?.source || 'Open-Meteo Air Quality'}</span>
        </div>
      </div>
    </div>
  );
}
