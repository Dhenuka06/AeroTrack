const mongoose = require('mongoose');

const HealthAdvisorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true, unique: true },
    aqiRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    generalAdvisory: { type: String, required: true },
    sensitiveGroupsAdvisory: { type: String, required: true },
    recommendedActions: [{ type: String }],
    color: { type: String, default: '#10B981' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthAdvisory', HealthAdvisorySchema);
