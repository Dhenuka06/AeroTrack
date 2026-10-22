import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AQICard from '../components/AQICard';
import PollutantCard from '../components/PollutantCard';
import AQIMap from '../components/AQIMap';
import TrendChart from '../components/TrendChart';
import CityComparison from '../components/CityComparison';
import HealthAdvisory from '../components/HealthAdvisory';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

import {
  fetchAllCities,
  fetchLatestAQIOverview,
  fetchCityLatestAQI,
  fetchCityHistory,
  triggerDataRefresh,
  isDemoResponse,
} from '../services/api';

export default function Dashboard() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityOverviewList, setCityOverviewList] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  // Initial Data Load
  useEffect(() => {
    loadInitialDashboard();
  }, []);

  // Load city details & historical readings whenever selectedCity changes
  useEffect(() => {
    if (selectedCity && selectedCity.name) {
      loadCityDetails(selectedCity.name);
    }
  }, [selectedCity]);

  const loadInitialDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cities and map overview in parallel
      const [citiesRes, overviewRes] = await Promise.all([
        fetchAllCities(),
        fetchLatestAQIOverview(),
      ]);
      setDemoMode(isDemoResponse(citiesRes) || isDemoResponse(overviewRes));

      if (citiesRes.success) {
        setCities(citiesRes.data);
        if (citiesRes.data.length > 0) {
          setSelectedCity(citiesRes.data[0]); // Default: New Delhi
        }
      }

      if (overviewRes.success) {
        setCityOverviewList(overviewRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.message || 'Failed to connect to backend server. Make sure the Node.js backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadCityDetails = async (cityName) => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetchCityLatestAQI(cityName),
        fetchCityHistory(cityName, 48),
      ]);
      setDemoMode((current) => current || isDemoResponse(latestRes) || isDemoResponse(historyRes));

      if (latestRes.success) {
        setCurrentReading(latestRes.reading);
      }

      if (historyRes.success) {
        setHistoryData(historyRes.data);
      }
    } catch (err) {
      console.error(`Error loading details for ${cityName}:`, err);
    }
  };

  const handleManualSync = async () => {
    try {
      setRefreshing(true);
      const refreshResult = await triggerDataRefresh();
      setDemoMode((current) => current || isDemoResponse(refreshResult));
      // Wait 1.5s for job to finish fetching
      setTimeout(async () => {
        await loadInitialDashboard();
        if (selectedCity) {
          await loadCityDetails(selectedCity.name);
        }
        setRefreshing(false);
      }, 1500);
    } catch (err) {
      console.error('Manual sync failed:', err);
      setRefreshing(false);
    }
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCityAdded = (newCity, usingDemoData) => {
    setCities(prev => [newCity, ...prev]);
    setSelectedCity(newCity);
    if (usingDemoData) setDemoMode(true);
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Header onRefresh={handleManualSync} isRefreshing={refreshing} demoMode={demoMode} />
        <main className="dashboard-content">
          <LoadingState />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <Header onRefresh={handleManualSync} isRefreshing={refreshing} demoMode={demoMode} />
        <main className="dashboard-content">
          <ErrorState message={error} onRetry={loadInitialDashboard} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header onRefresh={handleManualSync} isRefreshing={refreshing} demoMode={demoMode} />

      <main className="dashboard-content">
        <SearchBar
          cities={cities}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          onCityAdded={handleCityAdded}
        />

        {/* Top Hero Grid: AQI Overview Card + Health Advisory */}
        <div className="grid-layout top-hero-grid">
          <AQICard reading={currentReading} city={selectedCity} />
          <HealthAdvisory aqiValue={currentReading?.aqi} />
        </div>

        {/* Interactive Leaflet Map */}
        <AQIMap
          cityOverviewList={cityOverviewList}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
        />

        {/* Pollutant Breakdown Cards */}
        <PollutantCard pollutants={currentReading?.pollutants} />

        {/* Historical Trend Chart */}
        <TrendChart
          historyData={historyData}
          cityName={selectedCity?.name}
        />

        {/* Multi-City Comparison Section */}
        <CityComparison
          allCities={cities}
          defaultSelectedCity={selectedCity}
        />
      </main>

      <footer className="app-footer">
        <p>Real-Time Air Quality Index Aggregator & Mapping System &copy; {new Date().getFullYear()}</p>
        <p className="footer-sub">Built with MERN Stack • React.js, Express, Node-Cron, MongoDB, Leaflet & Recharts</p>
      </footer>
    </div>
  );
}
