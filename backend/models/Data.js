const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  ldr: { type: Number, required: true },
  fanState: { type: Boolean, default: false },
  lightState: { type: Boolean, default: false },
  manualLight: { type: Boolean, default: false },
  deviceStatus: {
    dht22: { type: Boolean, required: true },
    ldr: { type: Boolean, required: true },
    fan: { type: Boolean, required: true }
  },
  schedule: {
    lightOff: { type: String, required: false },  // Format: "HH:mm"
    fanOff: { type: String, required: false }     // Format: "HH:mm"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Data', DataSchema);
