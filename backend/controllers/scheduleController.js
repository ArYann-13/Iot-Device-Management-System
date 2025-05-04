const Data = require('../models/Data');

exports.updateSchedule = async (req, res) => {
  const { lightOff, fanOff } = req.body;

  const latest = await Data.findOne().sort({ createdAt: -1 });
  if (!latest) return res.status(404).json({ message: 'No record found to attach schedule' });

  latest.schedule = { lightOff, fanOff };
  await latest.save();

  res.json({ message: 'Schedule updated' });
};

exports.getSchedule = async (req, res) => {
  const latest = await Data.findOne().sort({ createdAt: -1 });
  if (!latest || !latest.schedule) return res.status(404).json({ message: 'No schedule set' });

  res.json(latest.schedule);
};
