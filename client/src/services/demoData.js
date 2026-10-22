import { getAQICategoryDetails } from '../utils/aqiUtils';

const seedCities = [
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
  { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
];

let cities = seedCities.map((city, index) => ({ ...city, _id: `demo-${index + 1}` }));

function scoreFor(cityName) {
  return 28 + [...cityName].reduce((total, char) => total + char.charCodeAt(0), 0) % 145;
}

function makeReading(city, aqi, timestamp = new Date()) {
  const category = getAQICategoryDetails(aqi);
  const pm2_5 = Math.max(3, Math.round(aqi * 0.31));
  const pm10 = Math.max(8, Math.round(aqi * 0.58));
  return {
    city: city._id,
    cityName: city.name,
    aqi,
    category: category.label,
    dominantPollutant: 'PM2.5',
    pollutants: {
      pm2_5: { concentration: pm2_5, unit: 'µg/m³' },
      pm10: { concentration: pm10, unit: 'µg/m³' },
      no2: { concentration: Math.round(aqi * 0.42), unit: 'µg/m³' },
      so2: { concentration: Math.round(aqi * 0.18), unit: 'µg/m³' },
      co: { concentration: Number((aqi * 0.025).toFixed(2)), unit: 'mg/m³' },
      o3: { concentration: Math.round(aqi * 0.35), unit: 'µg/m³' },
    },
    source: 'AeroTrack demo data',
    timestamp: timestamp.toISOString(),
  };
}

function cityOverview(city) {
  return {
    cityId: city._id,
    cityName: city.name,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
    reading: makeReading(city, scoreFor(city.name)),
  };
}

export function getDemoCities() {
  return { success: true, demoMode: true, count: cities.length, data: cities };
}

export function getDemoOverview() {
  return { success: true, demoMode: true, count: cities.length, data: cities.map(cityOverview) };
}

export function getDemoCityLatest(cityName) {
  const city = cities.find((item) => item.name.toLowerCase() === cityName.toLowerCase());
  if (!city) throw new Error(`City '${cityName}' is not in the demo dataset.`);
  return { success: true, demoMode: true, city, reading: makeReading(city, scoreFor(city.name)) };
}

export function getDemoHistory(cityName, hours = 48) {
  const city = cities.find((item) => item.name.toLowerCase() === cityName.toLowerCase()) || cities[0];
  const now = Date.now();
  const count = Math.min(24, Math.max(2, Math.floor(hours / 2)));
  const base = scoreFor(city.name);
  const data = Array.from({ length: count }, (_, index) => {
    const timestamp = new Date(now - (count - index - 1) * (hours * 3600000 / (count - 1)));
    const variation = Math.round(Math.sin(index * 0.8) * 13 + Math.cos(index * 0.35) * 7);
    return makeReading(city, Math.max(5, base + variation), timestamp);
  });
  return { success: true, demoMode: true, cityName: city.name, hoursRequested: hours, count: data.length, data };
}

export function getDemoComparison(cityNames = []) {
  const data = cityNames.map((name) => cities.find((city) => city.name.toLowerCase() === name.toLowerCase()))
    .filter(Boolean)
    .map((city) => ({ ...city, reading: makeReading(city, scoreFor(city.name)) }));
  return { success: true, demoMode: true, count: data.length, data };
}

export function addDemoCity(cityData) {
  const name = cityData.name.trim();
  const existing = cities.find((city) => city.name.toLowerCase() === name.toLowerCase());
  if (existing) return { success: true, demoMode: true, data: existing };
  const city = { ...cityData, name, country: cityData.country.trim(), _id: `demo-${Date.now()}` };
  cities = [city, ...cities];
  return { success: true, demoMode: true, data: city };
}

export function isDemoResponse(response) {
  return Boolean(response?.demoMode);
}
