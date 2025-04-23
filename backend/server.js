const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dataRoutes = require('./routes/dataRoutes');
const statusRoutes = require('./routes/statusRoutes');

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/iot_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected")).catch(err => console.error(err));

app.use('/api', dataRoutes);
app.use('/api', statusRoutes);
// app.use('/api', deviceStatusRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
