const express = require('express');
const EnergyReading = require('../models/EnergyReading');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/energy/latest - get latest reading
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const reading = await EnergyReading.findOne().sort({ timestamp: -1 });
    res.json({ reading });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/energy/history - get last N readings for chart
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const deviceId = req.query.deviceId || 'AG702_UNIT_01';

    const readings = await EnergyReading
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('activePower voltage current powerFactor frequency energy timestamp');

    res.json({ readings: readings.reverse() });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/energy/stats - get aggregated stats for today
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const stats = await EnergyReading.aggregate([
      { $match: { timestamp: { $gte: startOfDay } } },
      {
        $group: {
          _id: null,
          avgVoltage: { $avg: '$voltage.L1' },
          maxPower: { $max: '$activePower.total' },
          avgPowerFactor: { $avg: '$powerFactor' },
          avgFrequency: { $avg: '$frequency' },
          totalReadings: { $sum: 1 },
          latestEnergy: { $last: '$energy' },
        },
      },
    ]);

    res.json({ stats: stats[0] || {} });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
