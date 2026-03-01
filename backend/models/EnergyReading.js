const mongoose = require('mongoose');

const energyReadingSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    default: 'AG702_UNIT_01',
  },
  voltage: {
    L1: { type: Number, default: 0 },
    L2: { type: Number, default: 0 },
    L3: { type: Number, default: 0 },
  },
  current: {
    L1: { type: Number, default: 0 },
    L2: { type: Number, default: 0 },
    L3: { type: Number, default: 0 },
  },
  activePower: {
    total: { type: Number, default: 0 },
    L1: { type: Number, default: 0 },
    L2: { type: Number, default: 0 },
    L3: { type: Number, default: 0 },
  },
  powerFactor: { type: Number, default: 0 },
  frequency: { type: Number, default: 50 },
  energy: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

energyReadingSchema.index({ timestamp: -1 });
energyReadingSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('EnergyReading', energyReadingSchema);
