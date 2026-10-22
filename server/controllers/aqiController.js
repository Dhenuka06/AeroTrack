const axios = require('axios');
const City = require('../models/City');
const AQIReading = require('../models/AQIReading');
const HealthAdvisory = require('../models/HealthAdvisory');
const { fetchCityAQI } = require('../services/aqiProviderService');
const { collectAQIData } = require('../jobs/cronCollector');
const { getAQICategory } = require('../utils/aqiCalculator');

// ─── helpers ──────────────────────────────────────────────────────────────────

function caseInsensitiveRegex(str) {
  // Escape special regex chars to prevent injection
  const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
}

async function saveReading(city, liveData) {
  return AQIReading.create({
    city:              city._id,
    cityName:          city.name,
    aqi:               liveData.aqi,
    category:          liveData.category,
    dominantPollutant: liveData.dominantPollutant,
    pollutants:        liveData.pollutants,
    source:            liveData.source,
    timestamp:         new Date(),
  });
}

async function ensureReading(city) {
  let reading = await AQIReading.findOne({ city: city._id }).sort({ timestamp: -1 });
  if (!reading) {
    const liveData = await fetchCityAQI(city);
    reading = await saveReading(city, liveData);
  }
  return reading;
}

// ─── GET /api/aqi/latest ──────────────────────────────────────────────────────
exports.getLatestOverview = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true });

    const results = await Promise.all(
      cities.map(async (city) => {
        let reading = null;
        try {
          reading = await ensureReading(city);
        } catch (e) {
          console.error(`[overview] ${city.name}: ${e.message}`);
        }
        return {
          cityId:    city._id,
          cityName:  city.name,
          country:   city.country,
          latitude:  city.latitude,
          longitude: city.longitude,
          reading,
        };
      })
    );

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch AQI overview.', error: err.message });
  }
};

// ─── GET /api/aqi/latest/:cityName ───────────────────────────────────────────
exports.getCityLatest = async (req, res) => {
  try {
    const city = await City.findOne({ name: caseInsensitiveRegex(req.params.cityName) });
    if (!city) return res.status(404).json({ success: false, message: `City '${req.params.cityName}' not found.` });

    const reading  = await ensureReading(city);
    const advisory = getAQICategory(reading.aqi);

    res.json({
      success: true,
      city: {
        id:        city._id,
        name:      city.name,
        country:   city.country,
        latitude:  city.latitude,
        longitude: city.longitude,
      },
      reading,
      advisory,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch city AQI.', error: err.message });
  }
};

// ─── GET /api/aqi/history/:cityName?hours=48 ─────────────────────────────────
exports.getCityHistory = async (req, res) => {
  try {
    const city = await City.findOne({ name: caseInsensitiveRegex(req.params.cityName) });
    if (!city) return res.status(404).json({ success: false, message: `City '${req.params.cityName}' not found.` });

    const hours     = Math.min(parseInt(req.query.hours) || 48, 168); // cap at 7 days
    const startTime = new Date(Date.now() - hours * 3600 * 1000);

    let history = await AQIReading.find({ city: city._id, timestamp: { $gte: startTime } }).sort({ timestamp: 1 });

    // If fewer than 2 datapoints in DB, backfill from Open-Meteo historical hourly endpoint
    if (history.length < 2) {
      try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality`;
        const params = {
          latitude:  city.latitude,
          longitude: city.longitude,
          hourly:    'us_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone',
          past_days: 2,
        };
        const resp   = await axios.get(url, { params, timeout: 15000 });
        const hourly = resp.data?.hourly;

        if (hourly?.time?.length) {
          const INTERVAL = 3; // save every 3rd hourly datapoint to keep DB lean
          for (let i = 0; i < hourly.time.length; i += INTERVAL) {
            const ts     = new Date(hourly.time[i]);
            if (ts < startTime) continue;

            const aqiVal = hourly.us_aqi?.[i] ?? 50;
            const cat    = getAQICategory(aqiVal);
            const coRaw  = hourly.carbon_monoxide?.[i] ?? 0;

            // Skip saving if a reading for this city around this timestamp already exists (±90 min)
            const exists = await AQIReading.findOne({
              city:      city._id,
              timestamp: { $gte: new Date(ts.getTime() - 90 * 60000), $lte: new Date(ts.getTime() + 90 * 60000) },
            });
            if (exists) continue;

            await AQIReading.create({
              city:              city._id,
              cityName:          city.name,
              aqi:               Math.round(aqiVal),
              category:          cat.category,
              dominantPollutant: 'PM2.5',
              pollutants: {
                pm2_5: { concentration: parseFloat((hourly.pm2_5?.[i]  ?? 0).toFixed(1)), unit: 'µg/m³' },
                pm10:  { concentration: parseFloat((hourly.pm10?.[i]   ?? 0).toFixed(1)), unit: 'µg/m³' },
                no2:   { concentration: parseFloat((hourly.nitrogen_dioxide?.[i]  ?? 0).toFixed(1)), unit: 'µg/m³' },
                so2:   { concentration: parseFloat((hourly.sulphur_dioxide?.[i]   ?? 0).toFixed(1)), unit: 'µg/m³' },
                co:    { concentration: parseFloat((coRaw / 1000).toFixed(3)),                       unit: 'mg/m³' },
                o3:    { concentration: parseFloat((hourly.ozone?.[i]  ?? 0).toFixed(1)), unit: 'µg/m³' },
              },
              source:    'Open-Meteo Historical API',
              timestamp: ts,
            });
          }

          // Re-query after backfill
          history = await AQIReading.find({ city: city._id, timestamp: { $gte: startTime } }).sort({ timestamp: 1 });
        }
      } catch (backfillErr) {
        console.warn(`[history] Backfill failed for ${city.name}: ${backfillErr.message}`);
      }
    }

    res.json({
      success:        true,
      cityName:       city.name,
      hoursRequested: hours,
      count:          history.length,
      data:           history,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch history.', error: err.message });
  }
};

// ─── POST /api/aqi/compare ───────────────────────────────────────────────────
exports.compareCities = async (req, res) => {
  try {
    const { cityNames } = req.body;
    if (!Array.isArray(cityNames) || cityNames.length === 0)
      return res.status(400).json({ success: false, message: 'Provide a non-empty cityNames array.' });

    const results = await Promise.all(
      cityNames.map(async (name) => {
        const city = await City.findOne({ name: caseInsensitiveRegex(name) });
        if (!city) return null;
        let reading = null;
        try { reading = await ensureReading(city); } catch (e) { /* leave null */ }
        return {
          cityName:  city.name,
          country:   city.country,
          latitude:  city.latitude,
          longitude: city.longitude,
          reading,
          advisory:  getAQICategory(reading?.aqi ?? 0),
        };
      })
    );

    const filtered = results.filter(Boolean);
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Comparison failed.', error: err.message });
  }
};

// ─── POST /api/aqi/trigger-fetch ─────────────────────────────────────────────
exports.triggerCollectionJob = async (req, res) => {
  // Fire-and-forget — respond immediately
  collectAQIData();
  res.json({ success: true, message: 'AQI data collection triggered.' });
};

// ─── GET /api/aqi/advisory/:category ─────────────────────────────────────────
exports.getHealthAdvisory = async (req, res) => {
  try {
    const advisory = await HealthAdvisory.findOne({ category: caseInsensitiveRegex(req.params.category) });
    if (!advisory) return res.status(404).json({ success: false, message: 'Advisory not found.' });
    res.json({ success: true, data: advisory });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch advisory.', error: err.message });
  }
};
