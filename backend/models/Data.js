const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  ldr: Number,
  fanState: { type: Boolean, default: false },
  lightState: { type: Boolean, default: false },
  manualLight: { type: Boolean, default: false },
  deviceStatus: {
    dht22: Boolean,
    ldr: Boolean,
    fan: Boolean
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Data', DataSchema);
