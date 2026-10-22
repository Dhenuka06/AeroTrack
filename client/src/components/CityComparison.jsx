import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Scale, Check, Plus, X } from 'lucide-react';
import { compareCities } from '../services/api';
import { getAQICategoryDetails } from '../utils/aqiUtils';

export default function CityComparison({ allCities, defaultSelectedCity }) {
  const [selectedCityNames, setSelectedCityNames] = useState([
    defaultSelectedCity ? defaultSelectedCity.name : 'New Delhi',
    'Tokyo',
    'London',
  ]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (defaultSelectedCity && !selectedCityNames.includes(defaultSelectedCity.name)) {
      setSelectedCityNames(prev => [defaultSelectedCity.name, ...prev.slice(0, 2)]);
    }
  }, [defaultSelectedCity]);

  useEffect(() => {
    fetchComparison();
  }, [selectedCityNames]);

  const fetchComparison = async () => {
    if (selectedCityNames.length === 0) {
      setComparisonData([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await compareCities(selectedCityNames);
      if (res.success) {
        setComparisonData(res.data);
      }
    } catch (err) {
      setError('Failed to load comparison data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCity = (cityName) => {
    if (selectedCityNames.includes(cityName)) {
      if (selectedCityNames.length <= 1) return; // Keep at least one
      setSelectedCityNames(selectedCityNames.filter(c => c !== cityName));
    } else {
      if (selectedCityNames.length >= 4) {
        // Max 4 cities comparison
        setSelectedCityNames([...selectedCityNames.slice(1), cityName]);
      } else {
        setSelectedCityNames([...selectedCityNames, cityName]);
      }
    }
  };

  // Recharts Bar Data setup
  const barChartData = comparisonData.map(item => {
    const r = item.reading || {};
    const p = r.pollutants || {};
    return {
      cityName: item.cityName,
      aqi: r.aqi || 0,
      pm2_5: p.pm2_5?.concentration || 0,
      pm10: p.pm10?.concentration || 0,
      no2: p.no2?.concentration || 0,
    };
  });

  return (
    <div className="comparison-section">
      <div className="section-header flex-between">
        <div>
          <h3><Scale size={20} className="inline-icon" /> Multi-City AQI Comparison</h3>
          <span className="section-sub">Select up to 4 cities to evaluate air quality side-by-side</span>
        </div>
      </div>

      <div className="city-selector-bar">
        <span className="selector-label">Select Cities to Compare:</span>
        <div className="city-toggle-chips">
          {allCities.map(city => {
            const isSelected = selectedCityNames.includes(city.name);
            return (
              <button
                key={city._id || city.name}
                onClick={() => handleToggleCity(city.name)}
                className={`toggle-chip ${isSelected ? 'selected' : ''}`}
              >
                {isSelected ? <Check size={14} /> : <Plus size={14} />}
                <span>{city.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="loading-box">Loading city comparison...</div>
      ) : error ? (
        <div className="error-alert">{error}</div>
      ) : (
        <div className="comparison-content grid-2-col">
          <div className="comparison-chart-wrapper">
            <h4 className="card-subtitle">AQI & Particulate Comparison</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cityName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="aqi" name="Overall AQI" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pm2_5" name="PM2.5 (µg/m³)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pm10" name="PM10 (µg/m³)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="comparison-table-wrapper">
            <h4 className="card-subtitle">Detailed Parameter Matrix</h4>
            <div className="table-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>City</th>
                    <th>AQI</th>
                    <th>Category</th>
                    <th>PM2.5</th>
                    <th>PM10</th>
                    <th>NO2</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map(item => {
                    const r = item.reading || {};
                    const p = r.pollutants || {};
                    const cat = getAQICategoryDetails(r.aqi || 0);

                    return (
                      <tr key={item.cityName}>
                        <td><strong>{item.cityName}</strong> <span className="country-sub">{item.country}</span></td>
                        <td>
                          <span className="table-aqi-pill" style={{ backgroundColor: cat.bgColor, color: cat.color }}>
                            {r.aqi ?? 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="table-cat-badge" style={{ backgroundColor: cat.color }}>
                            {cat.label}
                          </span>
                        </td>
                        <td>{p.pm2_5?.concentration ?? 'N/A'} {p.pm2_5?.unit}</td>
                        <td>{p.pm10?.concentration ?? 'N/A'} {p.pm10?.unit}</td>
                        <td>{p.no2?.concentration ?? 'N/A'} {p.no2?.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
