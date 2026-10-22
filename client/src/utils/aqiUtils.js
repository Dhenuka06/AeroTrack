// ─── AQI Category Definitions (US EPA Scale) ─────────────────────────────────
// All category data is centralised here. Change this object to adapt to any AQI scale.
export const AQI_CATEGORIES = {
  'Good': {
    label: 'Good', min: 0, max: 50,
    color: '#10B981', bgColor: 'rgba(16,185,129,0.1)', borderColor: '#10B981', textColor: '#065F46',
    description: 'Air quality is satisfactory and poses little or no risk.',
  },
  'Moderate': {
    label: 'Moderate', min: 51, max: 100,
    color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)', borderColor: '#F59E0B', textColor: '#92400E',
    description: 'Acceptable quality; unusually sensitive people may experience mild effects.',
  },
  'Unhealthy for Sensitive Groups': {
    label: 'Unhealthy for Sensitive Groups', min: 101, max: 150,
    color: '#F97316', bgColor: 'rgba(249,115,22,0.1)', borderColor: '#F97316', textColor: '#9A3412',
    description: 'Sensitive groups (asthma, heart conditions, elderly) may experience health effects.',
  },
  'Unhealthy': {
    label: 'Unhealthy', min: 151, max: 200,
    color: '#EF4444', bgColor: 'rgba(239,68,68,0.1)', borderColor: '#EF4444', textColor: '#991B1B',
    description: 'General public may experience health effects; sensitive groups may experience serious effects.',
  },
  'Very Unhealthy': {
    label: 'Very Unhealthy', min: 201, max: 300,
    color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.1)', borderColor: '#8B5CF6', textColor: '#5B21B6',
    description: 'Health alert: Increased risk for the entire population.',
  },
  'Hazardous': {
    label: 'Hazardous', min: 301, max: 9999,
    color: '#7F1D1D', bgColor: 'rgba(127,29,29,0.1)', borderColor: '#7F1D1D', textColor: '#7F1D1D',
    description: 'Health warning of emergency conditions. Everyone is likely to be affected.',
  },
};

export function getAQICategoryDetails(aqi) {
  const val = Math.max(0, Math.round(aqi || 0));
  if (val <= 50)  return AQI_CATEGORIES['Good'];
  if (val <= 100) return AQI_CATEGORIES['Moderate'];
  if (val <= 150) return AQI_CATEGORIES['Unhealthy for Sensitive Groups'];
  if (val <= 200) return AQI_CATEGORIES['Unhealthy'];
  if (val <= 300) return AQI_CATEGORIES['Very Unhealthy'];
  return AQI_CATEGORIES['Hazardous'];
}

// ─── Pollutant Metadata ────────────────────────────────────────────────────────
export const POLLUTANTS_INFO = {
  pm2_5: {
    name: 'PM2.5', fullName: 'Fine Particulate Matter (<2.5µm)', unit: 'µg/m³',
    safeLimit: 15, maxRef: 150, icon: 'Wind',
    description: 'Tiny particles that penetrate deep into the lungs and bloodstream.',
  },
  pm10: {
    name: 'PM10', fullName: 'Coarse Particulate Matter (<10µm)', unit: 'µg/m³',
    safeLimit: 45, maxRef: 250, icon: 'CloudDrizzle',
    description: 'Inhalable dust, pollen, and mould particles that irritate airways.',
  },
  no2: {
    name: 'NO₂', fullName: 'Nitrogen Dioxide', unit: 'µg/m³',
    safeLimit: 25, maxRef: 200, icon: 'Flame',
    description: 'Emitted from vehicle exhausts and power plants; irritates the respiratory tract.',
  },
  so2: {
    name: 'SO₂', fullName: 'Sulphur Dioxide', unit: 'µg/m³',
    safeLimit: 40, maxRef: 350, icon: 'Factory',
    description: 'From industrial combustion of fossil fuels; causes throat and lung irritation.',
  },
  co: {
    name: 'CO', fullName: 'Carbon Monoxide', unit: 'mg/m³',
    safeLimit: 4.0, maxRef: 30.0, icon: 'Car',
    description: 'Odourless gas that reduces oxygen delivery to organs.',
  },
  o3: {
    name: 'O₃', fullName: 'Ground-Level Ozone', unit: 'µg/m³',
    safeLimit: 100, maxRef: 240, icon: 'Sun',
    description: 'Formed when sunlight reacts with pollutants; triggers coughing and asthma.',
  },
};

// ─── Date helper ──────────────────────────────────────────────────────────────
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
