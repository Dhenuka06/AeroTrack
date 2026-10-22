const axios = require('axios');
const { getAQICategory, calculateOverallAQI } = require('../utils/aqiCalculator');

/**
 * Fetch live air quality data from the Open-Meteo Air Quality API.
 * No API key required.
 */
async function fetchFromOpenMeteo(latitude, longitude) {
  const url = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  const params = {
    latitude,
    longitude,
    current:
      'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi',
  };

  const response = await axios.get(url, { params, timeout: 15000 });
  const current = response.data?.current;

  if (!current) {
    throw new Error('Open-Meteo API returned an unexpected response structure.');
  }

  const pm2_5 = current.pm2_5 ?? 0;
  const pm10  = current.pm10  ?? 0;
  const no2   = current.nitrogen_dioxide  ?? 0;
  const so2   = current.sulphur_dioxide   ?? 0;
  const coRaw = current.carbon_monoxide   ?? 0;   // µg/m³ from API
  const o3    = current.ozone             ?? 0;

  let rawAqi    = current.us_aqi;
  let dominant  = 'PM2.5';

  // Fall back to EPA sub-index calculation when API doesn't return us_aqi
  if (rawAqi === undefined || rawAqi === null || isNaN(rawAqi)) {
    const computed = calculateOverallAQI({
      pm2_5: { concentration: pm2_5 },
      pm10:  { concentration: pm10  },
    });
    rawAqi   = computed.aqi;
    dominant = computed.dominantPollutant;
  }

  const categoryInfo = getAQICategory(rawAqi);

  return {
    aqi: Math.round(rawAqi),
    category: categoryInfo.category,
    dominantPollutant: dominant,
    pollutants: {
      pm2_5: { concentration: parseFloat(pm2_5.toFixed(1)),           unit: 'µg/m³' },
      pm10:  { concentration: parseFloat(pm10.toFixed(1)),            unit: 'µg/m³' },
      no2:   { concentration: parseFloat(no2.toFixed(1)),             unit: 'µg/m³' },
      so2:   { concentration: parseFloat(so2.toFixed(1)),             unit: 'µg/m³' },
      co:    { concentration: parseFloat((coRaw / 1000).toFixed(3)),  unit: 'mg/m³' },
      o3:    { concentration: parseFloat(o3.toFixed(1)),              unit: 'µg/m³' },
    },
    source: 'Open-Meteo Air Quality API',
  };
}

/**
 * Fetch live air quality data from the WAQI (World Air Quality Index) API.
 * Requires a free API token from https://aqicn.org/api/
 */
async function fetchFromWAQI(latitude, longitude, apiToken) {
  const url = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${apiToken}`;
  const response = await axios.get(url, { timeout: 15000 });

  if (response.data?.status !== 'ok') {
    throw new Error(`WAQI API returned status: ${response.data?.status}`);
  }

  const data  = response.data.data;
  const rawAqi = Number(data.aqi) || 50;
  const iaqi   = data.iaqi || {};
  const categoryInfo = getAQICategory(rawAqi);

  return {
    aqi: Math.round(rawAqi),
    category: categoryInfo.category,
    dominantPollutant: (data.dominentpol || 'pm25').toUpperCase(),
    pollutants: {
      pm2_5: { concentration: iaqi.pm25?.v ?? 0, unit: 'µg/m³' },
      pm10:  { concentration: iaqi.pm10?.v  ?? 0, unit: 'µg/m³' },
      no2:   { concentration: iaqi.no2?.v   ?? 0, unit: 'µg/m³' },
      so2:   { concentration: iaqi.so2?.v   ?? 0, unit: 'µg/m³' },
      co:    { concentration: iaqi.co?.v    ?? 0, unit: 'mg/m³'  },
      o3:    { concentration: iaqi.o3?.v    ?? 0, unit: 'µg/m³' },
    },
    source: 'WAQI Public API',
  };
}

/**
 * Dispatcher: tries WAQI if key is set, otherwise uses Open-Meteo.
 */
async function fetchCityAQI(city) {
  const waqiToken = process.env.WAQI_API_KEY;

  if (waqiToken && waqiToken !== 'your_waqi_api_key_here') {
    try {
      return await fetchFromWAQI(city.latitude, city.longitude, waqiToken);
    } catch (err) {
      console.warn(`[AQI Provider] WAQI failed for ${city.name} — falling back to Open-Meteo: ${err.message}`);
    }
  }

  return await fetchFromOpenMeteo(city.latitude, city.longitude);
}

module.exports = { fetchCityAQI, fetchFromOpenMeteo, fetchFromWAQI };
