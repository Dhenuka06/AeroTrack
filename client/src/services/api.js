import axios from 'axios';
import {
  addDemoCity,
  getDemoCities,
  getDemoCityLatest,
  getDemoComparison,
  getDemoHistory,
  getDemoOverview,
  isDemoResponse,
} from './demoData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

async function withDemoFallback(request, fallback) {
  try {
    return (await request()).data;
  } catch (error) {
    console.warn(`[AQI] API unavailable; using demo data. ${error.message}`);
    return fallback();
  }
}

export const fetchAllCities = () => withDemoFallback(
  () => api.get('/cities'),
  getDemoCities,
);
export const fetchLatestAQIOverview = () => withDemoFallback(
  () => api.get('/aqi/latest'),
  getDemoOverview,
);
export const fetchCityLatestAQI = (cityName) => withDemoFallback(
  () => api.get(`/aqi/latest/${encodeURIComponent(cityName)}`),
  () => getDemoCityLatest(cityName),
);
export const fetchCityHistory = (cityName, hours = 48) => withDemoFallback(
  () => api.get(`/aqi/history/${encodeURIComponent(cityName)}?hours=${hours}`),
  () => getDemoHistory(cityName, hours),
);
export const compareCities = (cityNames) => withDemoFallback(
  () => api.post('/aqi/compare', { cityNames }),
  () => getDemoComparison(cityNames),
);
export const triggerDataRefresh = () => withDemoFallback(
  () => api.post('/aqi/trigger-fetch'),
  () => ({ success: true, demoMode: true, message: 'Demo data is ready.' }),
);
export const fetchHealthAdvisory = (category) => withDemoFallback(
  () => api.get(`/aqi/advisory/${encodeURIComponent(category)}`),
  () => ({ success: true, demoMode: true, data: { category } }),
);
export const addNewCity = (cityData) => withDemoFallback(
  () => api.post('/cities', cityData),
  () => addDemoCity(cityData),
);

export { isDemoResponse };

export default api;
