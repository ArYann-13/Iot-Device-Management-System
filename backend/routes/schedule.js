// routes/schedule.js
const express = require('express');
const router = express.Router();
const fs = require('fs');

router.post('/', (req, res) => {
  let currentSchedule = {};

  if (fs.existsSync('schedule.json')) {
    currentSchedule = JSON.parse(fs.readFileSync('schedule.json', 'utf-8'));
  }

  const updatedSchedule = {
    ...currentSchedule,
    ...req.body, // either lightOffTime or fanOffTime or both
  };

  fs.writeFileSync('schedule.json', JSON.stringify(updatedSchedule));
  res.json({ message: 'Schedule updated' });
});

module.exports = router; 
