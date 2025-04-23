import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReChart from './ReChart';

const CustomGraph = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    tempMax: null,
    tempMin: null,
    tempAvg: null,
    humidityMax: null,
    humidityMin: null,
    humidityAvg: null,
  });

  // Calculate stats for temperature and humidity
  const calculateStats = (data) => {
    const temperatures = data.map(d => d.temperature);
    const humidity = data.map(d => d.humidity);

    const tempMax = Math.max(...temperatures);
    const tempMin = Math.min(...temperatures);
    const tempAvg = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;

    const humidityMax = Math.max(...humidity);
    const humidityMin = Math.min(...humidity);
    const humidityAvg = humidity.reduce((sum, hum) => sum + hum, 0) / humidity.length;

    setStats({
      tempMax,
      tempMin,
      tempAvg,
      humidityMax,
      humidityMin,
      humidityAvg,
    });
  };

  // Fetch graph data from the backend
  const fetchGraphData = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/graph-data`, {
        params: { startDate, endDate },
      });
      console.log(response.data);
      const formatted = response.data.map(d => ({
        ...d,
        createdAt: new Date(d.createdAt).toLocaleString(),
      }));
      setGraphData(formatted);
      calculateStats(formatted); // Calculate stats after fetching data
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [startDate, endDate]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') setStartDate(value);
    else setEndDate(value);
  };

  const handleQuickSelect = (days) => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    setStartDate(past.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  return (
    <div className="p-4">
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Custom Date Range Graph</h2>

        {/* Date Pickers & Quick Buttons */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center items-center flex-[1] bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 h-fit">
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={fetchGraphData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            Graph
          </button>
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg"
          >
            Last 30 Days
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading data...</p>
        ) : graphData.length === 0 ? (
          <p className="text-center text-gray-500">No data available for selected range</p>
        ) : (
          <div className="">
            <div className='flex h-56 w-auto justify-center gap-4 bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 transition-transform hover:scale-105' >
              <div className="p-4 bg-blue-100 rounded-xl text-center w-72">
                <h3 className="text-xl font-bold mb-2">Temperature</h3>
                <p>Max: <span className="font-semibold">{stats.tempMax}°C</span></p>
                <p>Min: <span className="font-semibold">{stats.tempMin}°C</span></p>
                <p>Avg: <span className="font-semibold">{stats.tempAvg.toFixed(2)}°C</span></p>

              </div>

              <div className="p-4 bg-green-100 rounded-xl w-72 text-center">
                <h3 className="text-xl font-bold mb-2">Humidity</h3>
                <p>Max: <span className="font-semibold">{stats.humidityMax}%</span></p>
                <p>Min: <span className="font-semibold">{stats.humidityMin}%</span></p>
                <p>Avg: <span className="font-semibold">{stats.humidityAvg.toFixed(2)}%</span></p>
              </div>
            </div>
            <ReChart
              title="Temperature and Humidity Over Time"
              data={graphData}
              xKey="createdAt"
              lines={[
                { key: 'temperature', label: 'Temperature (°C)', color: '#FF5733' },
                { key: 'humidity', label: 'Humidity (%)', color: '#33C1FF' },
              ]}
              zoomable
            />
            <ReChart
              title="Light Intensity Over Time"
              data={graphData}
              xKey="createdAt"
              lines={[
                { key: 'ldr', label: 'Light Intensity', color: '#FFEB3B' },
              ]}
              zoomable
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomGraph;
