const Data = require('../models/Data');

exports.getLatest = async (req, res) => {
  const latest = await Data.findOne().sort({ createdAt: -1 });
  latest ? res.json(latest) : res.status(404).json({ message: 'No data found' });
};


exports.postData = async (req, res) => {
  const { temperature, humidity, ldr, fanState, lightState,deviceStatus } = req.body;
  if (temperature == null || humidity == null || ldr == null) {
    return res.status(400).json({ message: 'Sensor is not connected or data is invalid' });
  }

  const newData = new Data({ temperature, humidity, ldr, fanState, lightState,deviceStatus });
  console.log(newData);

  await newData.save();
  res.json({ message: 'Data saved' });
};

exports.updateFan = async (req, res) => {
  const { state } = req.body;
  const latest = await Data.findOne().sort({ createdAt: -1 });
  if (latest) {
    latest.fanState = state;
    await latest.save();
    res.json({ message: 'Fan state updated' });
  } else {
    res.status(404).json({ message: 'No data found' });
  }
};

exports.updateLight = async (req, res) => {
  const { state, manualLight } = req.body;
  const latest = await Data.findOne().sort({ createdAt: -1 });
  if (latest) {
    latest.lightState = state;
    latest.manualLight = manualLight;
    await latest.save();
    res.json({ message: 'Light state updated' });
  } else {
    res.status(404).json({ message: 'No data found' });
  }
};

exports.getHistory = async (req, res) => {
  const { from, to, page = 1, limit = 10 } = req.query;
  if (!from || !to) return res.status(400).json({ message: 'From and To dates are required' });

  const skip = (page - 1) * limit;

  const historyData = await Data.find({
    createdAt: { $gte: new Date(from), $lte: new Date(to) }
  }, { manualLight: 0 }).sort({ createdAt: 1 }).skip(skip).limit(parseInt(limit));

  const total = await Data.countDocuments({
    createdAt: { $gte: new Date(from), $lte: new Date(to) },
  });

  res.json({
    data: historyData,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  });
};

exports.getStats = async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const data = await Data.find({ createdAt: { $gte: fromDate } });

  if (data.length === 0) return res.status(404).json({ message: 'No data in given period' });

  const temperatures = data.map(d => d.temperature);
  const humidities = data.map(d => d.humidity);

  const tempMax = Math.max(...temperatures);
  const tempMin = Math.min(...temperatures);
  const tempAvg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;

  const humMax = Math.max(...humidities);
  const humMin = Math.min(...humidities);
  const humAvg = humidities.reduce((a, b) => a + b, 0) / humidities.length;

  res.json({
    temperature: { max: tempMax, min: tempMin, avg: tempAvg.toFixed(2) },
    humidity: { max: humMax, min: humMin, avg: humAvg.toFixed(2) }
  });
};



exports.getGraph = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const data = await Data.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ createdAt: 1 }); // optional: sort by time

    res.json(data);
  } catch (err) {
    console.error('Error fetching graph data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
