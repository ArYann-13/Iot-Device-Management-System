const express = require('express');
const router = express.Router();
const Data = require('../models/Data');

// GET /api/device-status
router.get('/device-status', async (req, res) => {
  try {
    const latest = await Data.findOne().sort({ createdAt: -1 });

    if (!latest || !latest.deviceStatus) {
      return res.json({
        dht22: false,
        ldr: false,
        fan: false
      });
    }

    res.json(latest.deviceStatus);
  } catch (error) {
    console.error('Error getting device status:', error);
    res.status(500).json({ message: 'Error getting device status' });
  }
});

module.exports = router;
