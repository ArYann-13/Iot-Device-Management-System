const cron = require('node-cron');
const fs = require('fs');
const axios = require('axios');

// Store references to scheduled jobs so they can be stopped if needed
let lightJob = null;
let fanJob = null;

function scheduleAutoOff() {
  if (!fs.existsSync('schedule.json')) return;

  const schedule = JSON.parse(fs.readFileSync('schedule.json', 'utf-8'));
  const { lightOffTime, fanOffTime } = schedule;

  // Cancel previous jobs
  if (lightJob) lightJob.stop();
  if (fanJob) fanJob.stop();

  if (lightOffTime) {
    const [lh, lm] = lightOffTime.split(':');
    lightJob = cron.schedule(`${lm} ${lh} * * *`, async () => {
      console.log('Auto-turning off light');
      await axios.post('http://localhost:5000/api/light', {
        state: false,
        manualLight: true,
      });
    });
  }

  if (fanOffTime) {
    const [fh, fm] = fanOffTime.split(':');
    fanJob = cron.schedule(`${fm} ${fh} * * *`, async () => {
      console.log('Auto-turning off fan');
      await axios.post('http://localhost:5000/api/fan', {
        state: false,
      });
    });
  }
}

module.exports = { scheduleAutoOff };
