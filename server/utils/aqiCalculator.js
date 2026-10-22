/**
 * US EPA AQI categories with colors, descriptions, and breakpoints.
 * All category data is centralised here — change it in one place if the AQI scale changes.
 */

const AQI_CATEGORIES = [
  {
    min: 0,
    max: 50,
    category: 'Good',
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    generalAdvisory: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    sensitiveGroupsAdvisory: 'Air quality is safe for all groups.',
    recommendedActions: ['Enjoy outdoor activities', 'Open windows for fresh air'],
  },
  {
    min: 51,
    max: 100,
    category: 'Moderate',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    generalAdvisory:
      'Air quality is acceptable. There may be a risk for some people who are unusually sensitive to air pollution.',
    sensitiveGroupsAdvisory:
      'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
    recommendedActions: [
      'Sensitive individuals should monitor symptoms',
      'Keep outdoor exertion reasonable',
    ],
  },
  {
    min: 101,
    max: 150,
    category: 'Unhealthy for Sensitive Groups',
    color: '#F97316',
    bgColor: '#FFEDD5',
    borderColor: '#FED7AA',
    generalAdvisory:
      'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    sensitiveGroupsAdvisory:
      'People with respiratory or heart conditions, children, and older adults should reduce outdoor exertion.',
    recommendedActions: [
      'Wear N95 mask outdoors if sensitive',
      'Reduce prolonged outdoor exertion',
      'Close windows during peak pollution hours',
    ],
  },
  {
    min: 151,
    max: 200,
    category: 'Unhealthy',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    generalAdvisory:
      'Some members of the general public may experience health effects; sensitive groups may experience more serious effects.',
    sensitiveGroupsAdvisory:
      'Sensitive groups should avoid outdoor activity. Everyone should limit prolonged outdoor exertion.',
    recommendedActions: [
      'Wear masks outdoors',
      'Use air purifiers indoors',
      'Keep windows and doors closed',
    ],
  },
  {
    min: 201,
    max: 300,
    category: 'Very Unhealthy',
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
    borderColor: '#DDD6FE',
    generalAdvisory: 'Health alert: The risk of health effects is increased for everyone.',
    sensitiveGroupsAdvisory:
      'Sensitive groups should remain indoors and keep activity levels low.',
    recommendedActions: [
      'Avoid all outdoor physical activity',
      'Run indoor air filtration',
      'Keep doors & windows tightly sealed',
    ],
  },
  {
    min: 301,
    max: 9999,
    category: 'Hazardous',
    color: '#7F1D1D',
    bgColor: '#FEF2F2',
    borderColor: '#991B1B',
    generalAdvisory:
      'Health warning of emergency conditions: everyone is more likely to be affected.',
    sensitiveGroupsAdvisory: 'All individuals must remain indoors and restrict movement.',
    recommendedActions: [
      'Stay strictly indoors',
      'Use high-efficiency HEPA air purifiers',
      'Avoid any outdoor exposure',
    ],
  },
];

/**
 * Returns the full category object for a given AQI value.
 */
function getAQICategory(aqiValue) {
  const val = Math.max(0, Math.round(aqiValue || 0));
  return (
    AQI_CATEGORIES.find((c) => val >= c.min && val <= c.max) ||
    AQI_CATEGORIES[AQI_CATEGORIES.length - 1]
  );
}

// EPA breakpoints for PM2.5 (µg/m³)
const PM25_BREAKPOINTS = [
  { cLow: 0.0,  cHigh: 12.0,  iLow: 0,   iHigh: 50  },
  { cLow: 12.1, cHigh: 35.4,  iLow: 51,  iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4,  iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5,cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5,cHigh: 500.4, iLow: 301, iHigh: 500 },
];

// EPA breakpoints for PM10 (µg/m³)
const PM10_BREAKPOINTS = [
  { cLow: 0,   cHigh: 54,  iLow: 0,   iHigh: 50  },
  { cLow: 55,  cHigh: 154, iLow: 51,  iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
];

function calculateSubIndex(concentration, breakpoints) {
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow
      );
    }
  }
  return 0;
}

/**
 * Compute overall US AQI from raw pollutant values (used as fallback).
 */
function calculateOverallAQI(pollutants) {
  const indices = [];
  if (pollutants.pm2_5?.concentration != null)
    indices.push({ name: 'PM2.5', value: calculateSubIndex(pollutants.pm2_5.concentration, PM25_BREAKPOINTS) });
  if (pollutants.pm10?.concentration != null)
    indices.push({ name: 'PM10', value: calculateSubIndex(pollutants.pm10.concentration, PM10_BREAKPOINTS) });

  if (indices.length === 0) return { aqi: 50, dominantPollutant: 'PM2.5' };
  indices.sort((a, b) => b.value - a.value);
  return { aqi: indices[0].value, dominantPollutant: indices[0].name };
}

module.exports = { AQI_CATEGORIES, getAQICategory, calculateSubIndex, calculateOverallAQI };
