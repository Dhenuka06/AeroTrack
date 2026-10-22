import React from 'react';
import { Wind, CloudDrizzle, Flame, Factory, Car, Sun, AlertTriangle } from 'lucide-react';
import { POLLUTANTS_INFO } from '../utils/aqiUtils';

const ICON_MAP = {
  Wind: Wind,
  CloudDrizzle: CloudDrizzle,
  Flame: Flame,
  Factory: Factory,
  Car: Car,
  Sun: Sun,
};

export default function PollutantCard({ pollutants }) {
  if (!pollutants) return null;

  const pollutantKeys = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3'];

  return (
    <div className="pollutant-section">
      <div className="section-header">
        <h3>Pollutant Breakdown</h3>
        <span className="section-sub">Detailed concentrations & safety standards</span>
      </div>

      <div className="pollutants-grid">
        {pollutantKeys.map((key) => {
          const info = POLLUTANTS_INFO[key];
          const data = pollutants[key] || { concentration: 0, unit: info.unit };
          const IconComp = ICON_MAP[info.icon] || Wind;

          const concentration = data.concentration ?? 0;
          const isExceeded = concentration > info.safeLimit;

          // Calculate percentage against reference max for visual progress bar
          const fillPercent = Math.min(100, Math.max(5, (concentration / info.maxRef) * 100));

          return (
            <div key={key} className={`pollutant-card ${isExceeded ? 'warning-border' : ''}`}>
              <div className="pollutant-header">
                <div className="pollutant-icon-box">
                  <IconComp size={20} />
                </div>
                <div>
                  <h4 className="pollutant-name">{info.name}</h4>
                  <span className="pollutant-fullname">{info.fullName}</span>
                </div>
              </div>

              <div className="pollutant-body">
                <div className="concentration-value">
                  <span className="number">{concentration}</span>
                  <span className="unit">{data.unit || info.unit}</span>
                </div>

                <div className="safe-limit-badge">
                  {isExceeded ? (
                    <span className="badge badge-warning">
                      <AlertTriangle size={12} /> Above Safe Limit ({info.safeLimit} {info.unit})
                    </span>
                  ) : (
                    <span className="badge badge-success">
                      Within Safe Standard (&le;{info.safeLimit} {info.unit})
                    </span>
                  )}
                </div>

                <div className="pollutant-progress-bar">
                  <div
                    className={`progress-fill ${isExceeded ? 'exceeded' : 'normal'}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                <p className="pollutant-description">{info.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
