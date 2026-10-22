const City = require('../models/City');
const AQIReading = require('../models/AQIReading');
const HealthAdvisory = require('../models/HealthAdvisory');
const { fetchCityAQI } = require('../services/aqiProviderService');
const { AQI_CATEGORIES } = require('./aqiCalculator');

const INITIAL_CITIES = [
  { name: 'New Delhi',    country: 'India',          latitude: 28.6139,  longitude: 77.2090  },
  { name: 'Beijing',      country: 'China',           latitude: 39.9042,  longitude: 116.4074 },
  { name: 'Tokyo',        country: 'Japan',           latitude: 35.6762,  longitude: 139.6503 },
  { name: 'London',       country: 'United Kingdom',  latitude: 51.5074,  longitude: -0.1278  },
  { name: 'New York',     country: 'United States',   latitude: 40.7128,  longitude: -74.0060 },
  { name: 'Paris',        country: 'France',          latitude: 48.8566,  longitude: 2.3522   },
  { name: 'Los Angeles',  country: 'United States',   latitude: 34.0522,  longitude: -118.2437},
  { name: 'Sydney',       country: 'Australia',       latitude: -33.8688, longitude: 151.2093 },
  { name: 'Sao Paulo',    country: 'Brazil',          latitude: -23.5505, longitude: -46.6333 },
  { name: 'Cairo',        country: 'Egypt',           latitude: 30.0444,  longitude: 31.2357  },
  { name: 'Mumbai',       country: 'India',           latitude: 19.0760,  longitude: 72.8777  },
  { name: 'Singapore',    country: 'Singapore',       latitude: 1.3521,   longitude: 103.8198 },
];

async function saveReading(city, liveData) {
  return AQIReading.create({
    city:             city._id,
    cityName:         city.name,
    aqi:              liveData.aqi,
    category:         liveData.category,
    dominantPollutant:liveData.dominantPollutant,
    pollutants:       liveData.pollutants,
    source:           liveData.source,
    timestamp:        new Date(),
  });
}

async function seedInitialData() {
  try {
    // 1. Seed health advisories
    console.log('[Seed] Upserting health advisories...');
    for (const cat of AQI_CATEGORIES) {
      await HealthAdvisory.findOneAndUpdate(
        { category: cat.category },
        {
          category:                  cat.category,
          aqiRange:                  { min: cat.min, max: cat.max },
          generalAdvisory:           cat.generalAdvisory,
          sensitiveGroupsAdvisory:   cat.sensitiveGroupsAdvisory,
          recommendedActions:        cat.recommendedActions,
          color:                     cat.color,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // 2. Seed cities
    console.log('[Seed] Checking cities...');
    const cityDocs = [];
    for (const c of INITIAL_CITIES) {
      let city = await City.findOne({ name: c.name });
      if (!city) {
        city = await City.create(c);
        console.log(`[Seed]   + Created city: ${city.name}`);
      }
      cityDocs.push(city);
    }

    // 3. Fetch initial readings only if DB is empty
    const readingCount = await AQIReading.countDocuments();
    if (readingCount === 0) {
      console.log('[Seed] No readings in DB — fetching initial live data...');
      for (const city of cityDocs) {
        try {
          const liveData = await fetchCityAQI(city);
          await saveReading(city, liveData);
          console.log(`[Seed]   ✓ ${city.name}: AQI ${liveData.aqi} (${liveData.category})`);
        } catch (err) {
          console.warn(`[Seed]   ✗ Could not fetch ${city.name}: ${err.message}`);
        }
      }
    } else {
      console.log(`[Seed] DB already has ${readingCount} readings — skipping initial fetch.`);
    }

    console.log('[Seed] ✓ Initialization complete.');
  } catch (err) {
    console.error('[Seed] Fatal error during seeding:', err.message);
  }
}

module.exports = seedInitialData;
