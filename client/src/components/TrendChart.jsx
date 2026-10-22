import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { getAQICategoryDetails } from '../utils/aqiUtils';

export default function TrendChart({ historyData, cityName }) {
  const [metric, setMetric] = useState('aqi'); // 'aqi', 'pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3'

  if (!historyData || historyData.length < 2) {
    return (
      <div className="chart-section">
        <div className="section-header">
          <h3>Historical AQI Trend (24-48h)</h3>
          <span className="section-sub">{cityName || 'Selected City'}</span>
        </div>
        <div className="insufficient-data-card">
          <AlertCircle size={28} className="warning-icon" />
          <h4>Insufficient Historical Readings Available</h4>
          <p>
            The background scheduled collector is building the time series for {cityName || 'this location'}.
            Historical trends will automatically render here as cron polling runs over the next few cycles.
          </p>
        </div>
      </div>
    );
  }

  // Format chart items for Recharts
  const chartData = historyData.map((item) => {
    const d = new Date(item.timestamp);
    const formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });

    return {
      time: formattedTime,
      rawTime: d.getTime(),
      aqi: item.aqi,
      pm2_5: item.pollutants?.pm2_5?.concentration ?? 0,
      pm10: item.pollutants?.pm10?.concentration ?? 0,
      no2: item.pollutants?.no2?.concentration ?? 0,
      so2: item.pollutants?.so2?.concentration ?? 0,
      co: item.pollutants?.co?.concentration ?? 0,
      o3: item.pollutants?.o3?.concentration ?? 0,
      category: item.category,
    };
  });

  const METRIC_CONFIG = {
    aqi: { label: 'Overall AQI', color: '#6366F1', unit: 'AQI' },
    pm2_5: { label: 'PM2.5', color: '#EF4444', unit: 'µg/m³' },
    pm10: { label: 'PM10', color: '#F59E0B', unit: 'µg/m³' },
    no2: { label: 'NO2', color: '#10B981', unit: 'µg/m³' },
    so2: { label: 'SO2', color: '#8B5CF6', unit: 'µg/m³' },
    co: { label: 'CO', color: '#EC4899', unit: 'mg/m³' },
    o3: { label: 'O3', color: '#06B6D4', unit: 'µg/m³' },
  };

  const activeConfig = METRIC_CONFIG[metric];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const cat = metric === 'aqi' ? getAQICategoryDetails(val) : null;

      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-time">{label}</p>
          <p className="tooltip-value" style={{ color: activeConfig.color }}>
            <strong>{activeConfig.label}:</strong> {val} {activeConfig.unit}
          </p>
          {cat && (
            <div className="tooltip-cat" style={{ color: cat.color }}>
              Category: {cat.label}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-section">
      <div className="section-header flex-between">
        <div>
          <h3>Historical Trend Analysis</h3>
          <span className="section-sub">Tracking {cityName} over past 24-48 hours</span>
        </div>

        <div className="metric-selector">
          {Object.keys(METRIC_CONFIG).map((key) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`metric-tab ${metric === key ? 'active' : ''}`}
              style={{
                borderColor: metric === key ? METRIC_CONFIG[key].color : 'transparent',
                color: metric === key ? METRIC_CONFIG[key].color : undefined,
              }}
            >
              {METRIC_CONFIG[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={metric}
              name={`${activeConfig.label} (${activeConfig.unit})`}
              stroke={activeConfig.color}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
