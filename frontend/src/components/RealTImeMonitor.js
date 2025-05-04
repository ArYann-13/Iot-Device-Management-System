import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeviceStatus from './DeviceStatus';
import { toast } from 'react-toastify';

function RealTimeMonitor() {
  const [data, setData] = useState({});
  const [fanState, setFanState] = useState(false);
  const [lightState, setLightState] = useState(false);
  const [lightOffTime, setLightOffTime] = useState('');
  const [fanOffTime, setFanOffTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/latest');
      setData(res.data);
      setFanState(res.data.fanState);
      setLightState(res.data.lightState);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto mode logic for light control based on LDR value
  useEffect(() => {
    if (isAutoMode) {
      const threshold = 300; // Adjust this threshold based on your LDR value range
      if (data.ldr < threshold) {
        if (!lightState) {
          toggleLight(); // Turn on light if it's night
        }
      } else {
        if (lightState) {
          toggleLight(); // Turn off light if it's day
        }
      }
    }
  }, [data.ldr, isAutoMode, lightState]); // Re-run this effect when LDR value or auto mode changes

  const toggleFan = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/fan', { state: !fanState });
      setFanState(!fanState);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error('Failed to toggle fan');
      console.error('Failed to toggle fan:', err);
    }
  };

  const toggleLight = async () => {
    if (isAutoMode) {
      toast.info('Light is in Auto mode, cannot toggle manually.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/light', {
        state: !lightState,
        manualLight: true, // Manual override
      });
      setLightState(!lightState);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error('Failed to toggle light');
      console.error('Failed to toggle light:', err);
    }
  };

  const updateLightSchedule = async () => {
    await axios.post('http://localhost:5000/api/schedule', { lightOffTime });
    alert('Light schedule saved');
  };

  const updateFanSchedule = async () => {
    await axios.post('http://localhost:5000/api/schedule', { fanOffTime });
    alert('Fan schedule saved');
  };

  return (
    <div className="flex flex-wrap gap-6 p-4">
      {/* Real-Time Dashboard */}
      <div className="flex-[2] bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 transition-transform hover:scale-105">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">Real Time Dashboard</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded-xl text-center">
            <p className="text-lg font-semibold text-blue-700">Temperature</p>
            <p className="text-2xl font-bold text-blue-900">{data.temperature}°C</p>
          </div>

          <div className="p-4 bg-green-100 rounded-xl text-center">
            <p className="text-lg font-semibold text-green-700">Humidity</p>
            <p className="text-2xl font-bold text-green-900">{data.humidity}%</p>
          </div>

          <div className="p-4 bg-yellow-100 rounded-xl text-center col-span-2">
            <p className="text-lg font-semibold text-yellow-700">Light Intensity</p>
            <p className="text-2xl font-bold text-yellow-900">{data.ldr}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={toggleFan}
            disabled={loading} // Disable button when loading
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${fanState ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? 'Processing...' : (fanState ? '🛑 Turn Fan Off' : '🌀 Turn Fan On')}
          </button>

          <div className="flex items-center justify-between mb-4">
            <label className="font-semibold text-gray-700">Light Mode:</label>
            <div className="flex items-center gap-4">
              <span className={isAutoMode ? "text-blue-600 font-bold" : "text-gray-400"}>Auto</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!isAutoMode}
                  onChange={() => setIsAutoMode(prev => !prev)} // Toggle mode
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
              <span className={!isAutoMode ? "text-blue-600 font-bold" : "text-gray-400"}>Manual</span>
            </div>
          </div>

          <button
            onClick={toggleLight}
            disabled={loading} // Disable button when loading
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${lightState ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            {loading ? 'Processing...' : (lightState ? '💡 Turn Light Off' : '💡 Turn Light On')}
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-100">
            <h2 className="text-xl font-bold mb-4">Schedule Settings</h2>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label>Light Off Time:</label>
                <input
                  type="time"
                  value={lightOffTime}
                  onChange={(e) => setLightOffTime(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button onClick={updateLightSchedule} className="bg-blue-500 text-white px-4 py-1 rounded">
                  Save Light Schedule
                </button>
              </div>

              <div className="flex items-center gap-4">
                <label>Fan Off Time:</label>
                <input
                  type="time"
                  value={fanOffTime}
                  onChange={(e) => setFanOffTime(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button onClick={updateFanSchedule} className="bg-green-500 text-white px-4 py-1 rounded">
                  Save Fan Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-[1] flex-col'>
        <div className="flex-[1] bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-5 transition-transform hover:scale-105 h-fit">
          <DeviceStatus />
        </div>
        <div className="flex flex-col mt-8 bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 transition-transform hover:scale-105 h-fit">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-4 text-center">Quick Stats</h2>
          <div className="mt-6 text-center">
            <button
              onClick={() => window.open('/graph-data', '_blank')}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition"
            >
              Custom Graph
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealTimeMonitor;
