import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeviceStatus from './DeviceStatus';

function RealTimeMonitor() {
  const [data, setData] = useState({});
  const [fanState, setFanState] = useState(false);
  const [lightState, setLightState] = useState(false);
 

  const fetchData = async () => {
    const res = await axios.get('http://localhost:5000/api/latest');
    setData(res.data);
    setFanState(res.data.fanState);
    setLightState(res.data.lightState);

    
  };



  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []); // refetch stats if days change

  const toggleFan = async () => {
    await axios.post('http://localhost:5000/api/fan', { state: !fanState });
    setFanState(!fanState);
  };

  const toggleLight = async () => {
    try {
      await axios.post('http://localhost:5000/api/light', {
        state: !lightState,
        manualLight: true, // ✅ Set manual override
      });
      setLightState(!lightState);
    } catch (err) {
      console.error('Failed to toggle light:', err);
    }
  };



  return (
    <div className='flex flex-wrap gap-6 p-4'>
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
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${fanState ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {fanState ? '🛑 Turn Fan Off' : '🌀 Turn Fan On'}
          </button>

          <button
            onClick={toggleLight}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${lightState ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            {lightState ? '💡 Turn Light Off' : '💡 Turn Light On'}
          </button>
        </div>
      </div>


      <div className='flex-[1] flex-col  '>
        <div className="flex-[1] bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-5 transition-transform hover:scale-105 h-fit">
          <DeviceStatus />
        </div>
        <div className=" flex flex-col mt-8  bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 transition-transform hover:scale-105 h-fit">
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
