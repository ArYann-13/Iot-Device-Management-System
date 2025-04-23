// utils/checkSensorConnection.js
const Data = require('../models/Data');

// Function to check sensor connection by ensuring values were updated recently
async function checkSensorConnection() {
  const latest = await Data.findOne().sort({ createdAt: -1 });  // Get the most recent data

  if (!latest) return { dht22: false, ldr: false, fan: false };

  const now = new Date();
  const diff = (now - new Date(latest.createdAt)) / 1000; // Difference in seconds

  // Check if the data was updated recently (within 10 seconds) and ensure the values are not the same as before
  const isDht22Connected = diff < 10 && latest.temperature != null && latest.humidity != null;
  const isLdrConnected = latest.ldr != null;  // Assuming LDR data exists
  const isFanConnected = latest.fanState !== undefined;  // Assuming fan state exists

  // We only want to mark the sensor as "connected" if the values are actually changing
  const previous = await Data.findOne().sort({ createdAt: -2 }); // Get the previous data

  // Check if values haven't changed in the recent data
  const isDht22DataChanged = latest.temperature !== previous?.temperature || latest.humidity !== previous?.humidity;

  // If the data has not changed, we assume the sensor is disconnected
  const dht22Status = isDht22Connected && isDht22DataChanged;
  
  return {
    dht22: dht22Status,  // Sensor connected if data is recent and changed
    ldr: isLdrConnected,  // LDR is connected if LDR value exists
    fan: isFanConnected,  // Fan is connected if the fan state is stored
  };
}

module.exports = checkSensorConnection;
