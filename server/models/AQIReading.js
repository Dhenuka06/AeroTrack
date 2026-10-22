const mongoose = require('mongoose');

const PollutantSchema = new mongoose.Schema(
  {
    concentration: { type: Number, default: 0 },
    unit: { type: String, default: 'µg/m³' },
  },
  { _id: false }
);

const AQIReadingSchema = new mongoose.Schema(
  {
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    cityName: {
      type: String,
      required: true,
      index: true,
    },
    aqi: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Good',
        'Moderate',
        'Unhealthy for Sensitive Groups',
        'Unhealthy',
        'Very Unhealthy',
        'Hazardous',
      ],
    },
    dominantPollutant: {
      type: String,
      default: 'PM2.5',
    },
    pollutants: {
      pm2_5: PollutantSchema,
      pm10: PollutantSchema,
      no2: PollutantSchema,
      so2: PollutantSchema,
      co: PollutantSchema,
      o3: PollutantSchema,
    },
    source: {
      type: String,
      default: 'Open-Meteo Air Quality API',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient historical queries
AQIReadingSchema.index({ city: 1, timestamp: -1 });
AQIReadingSchema.index({ cityName: 1, timestamp: -1 });

module.exports = mongoose.model('AQIReading', AQIReadingSchema);
