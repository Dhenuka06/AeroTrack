const City = require('../models/City');
const AQIReading = require('../models/AQIReading');
const { fetchCityAQI } = require('../services/aqiProviderService');

// ─── helpers ──────────────────────────────────────────────────────────────────

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

// ─── controllers ──────────────────────────────────────────────────────────────

/** GET /api/cities */
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: cities.length, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch cities.', error: err.message });
  }
};

/** POST /api/cities */
exports.addCity = async (req, res) => {
  try {
    const { name, country, latitude, longitude } = req.body;
    if (!name || !country || latitude == null || longitude == null)
      return res.status(400).json({ success: false, message: 'name, country, latitude, and longitude are required.' });

    if (await City.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }))
      return res.status(400).json({ success: false, message: `City '${name}' is already tracked.` });

    const city = await City.create({ name, country, latitude: +latitude, longitude: +longitude });

    // Kick off an immediate reading
    try {
      const liveData = await fetchCityAQI(city);
      await saveReading(city, liveData);
    } catch (e) {
      console.warn(`[cityController] Could not fetch initial reading for ${name}: ${e.message}`);
    }

    res.status(201).json({ success: true, data: city });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add city.', error: err.message });
  }
};
