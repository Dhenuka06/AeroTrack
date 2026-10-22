const cron = require('node-cron');
const City = require('../models/City');
const AQIReading = require('../models/AQIReading');
const { fetchCityAQI } = require('../services/aqiProviderService');

async function collectAQIData() {
  console.log(`[Cron] Collecting AQI data at ${new Date().toISOString()}`);
  try {
    const cities = await City.find({ isActive: true });
    if (!cities.length) {
      console.log('[Cron] No active cities found.');
      return;
    }

    let saved = 0, skipped = 0, failed = 0;

    for (const city of cities) {
      try {
        const liveData = await fetchCityAQI(city);

        // Deduplication: skip if the latest reading was <5 min ago AND AQI unchanged
        const latest = await AQIReading.findOne({ city: city._id }).sort({ timestamp: -1 });
        if (latest) {
          const ageMins = (Date.now() - new Date(latest.timestamp).getTime()) / 60000;
          if (ageMins < 5 && latest.aqi === liveData.aqi) {
            skipped++;
            continue;
          }
        }

        await AQIReading.create({
          city:              city._id,
          cityName:          city.name,
          aqi:               liveData.aqi,
          category:          liveData.category,
          dominantPollutant: liveData.dominantPollutant,
          pollutants:        liveData.pollutants,
          source:            liveData.source,
          timestamp:         new Date(),
        });
        saved++;
      } catch (err) {
        failed++;
        console.error(`[Cron] Failed for ${city.name}: ${err.message}`);
      }
    }

    console.log(`[Cron] Done — saved: ${saved}, skipped: ${skipped}, failed: ${failed}`);
  } catch (err) {
    console.error('[Cron] Unexpected error:', err.message);
  }
}

function initCronCollector() {
  const schedule = process.env.CRON_SCHEDULE || '*/15 * * * *';
  console.log(`[Cron] Scheduler active — running every '${schedule}'`);
  cron.schedule(schedule, () => collectAQIData());
}

module.exports = { initCronCollector, collectAQIData };
