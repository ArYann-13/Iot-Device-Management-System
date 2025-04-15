const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/iot_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema
const DataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  ldr: Number,
  fanState: { type: Boolean, default: false },
  lightState: { type: Boolean, default: false },
  manualLight: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Data = mongoose.model('Data', DataSchema);



// GET route (Frontend fetches latest data)
app.get('/api/latest', async (req, res) => {
  const latest = await Data.findOne().sort({ createdAt: -1 });
  if (latest) {
    res.json(latest);
    console.log(latest);
  } else {
    res.status(404).json({ message: 'No data found' });
  }
});

// Update Fan State
app.post('/api/fan', async (req, res) => {
  const { state } = req.body;
  const latest = await Data.findOne().sort({ createdAt: -1 });
  if (latest) {
    latest.fanState = state;
    console.log(latest.fanState);
    await latest.save();
    res.json({ message: 'Fan state updated' });
  } else {
    res.status(404).json({ message: 'No data found' });
  }
});

// Update Light State
app.post('/api/light', async (req, res) => {
  const { state, manualLight } = req.body; //  expect manualLight from frontend
  const latest = await Data.findOne().sort({ createdAt: -1 });

  if (latest) {
    latest.lightState = state;
    latest.manualLight = manualLight;
    await latest.save();
    res.json({ message: 'Light state updated' });
  } else {
    res.status(404).json({ message: 'No data found' });
  }
});


// POST route (ESP32 sends data here)
app.post('/api/data', async (req, res) => {
  const { temperature, humidity, ldr, fanState, lightState } = req.body;
  const newData = new Data({ temperature, humidity, ldr, fanState, lightState });
  await newData.save();
  res.json({ message: 'Data saved' });
});



app.get('/api/history', async (req, res) => {
  const { from, to, page = 1, limit = 10 } = req.query;  // default: page 1, 10 items per page

  if (!from || !to) {
    return res.status(400).json({ message: 'From and To dates are required' });
  }

  try {
    const skip = (page - 1) * limit;

    const historyData = await Data.find({
      createdAt: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Data.countDocuments({
      createdAt: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
    });

    res.json({
      data: historyData,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/stats', async (req, res) => {
  const days = parseInt(req.query.days) || 7;  // 🛠️ default to 7 if not provided
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const data = await Data.find({
    createdAt: { $gte: fromDate }
  });

  if (data.length === 0) {
    return res.status(404).json({ message: 'No data in given period' });
  }

  const temperatures = data.map(d => d.temperature);
  const humidities = data.map(d => d.humidity);

  const tempMax = Math.max(...temperatures);
  const tempMin = Math.min(...temperatures);
  const tempAvg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;

  const humMax = Math.max(...humidities);
  const humMin = Math.min(...humidities);
  const humAvg = humidities.reduce((a, b) => a + b, 0) / humidities.length;

  res.json({
    temperature: {
      max: tempMax,
      min: tempMin,
      avg: tempAvg.toFixed(2)
    },
    humidity: {
      max: humMax,
      min: humMin,
      avg: humAvg.toFixed(2)
    }
  });
});




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
