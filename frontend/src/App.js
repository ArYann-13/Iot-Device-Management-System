import React, { useState, useEffect } from 'react';
import RealTimeMonitor from './components/RealTImeMonitor';
import Graph from './components/Graph';

import axios from 'axios';

function App() {
  const [showGraph, setShowGraph] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [ldrChartData, setLdrChartData] = useState({ labels: [], datasets: [] });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/latest');
        const now = new Date().toLocaleTimeString();

        setChartData(prev => ({
          labels: [...prev.labels.slice(-9), now],
          datasets: [
            {
              label: 'Temperature (°C)',
              data: [...(prev.datasets[0]?.data || []), res.data.temperature].slice(-10),
              borderColor: 'red',
              fill: false
            },
            {
              label: 'Humidity (%)',
              data: [...(prev.datasets[1]?.data || []), res.data.humidity].slice(-10),
              borderColor: 'blue',
              fill: false
            }
          ]
        }));

        setLdrChartData(prev => ({
          labels: [...prev.labels.slice(-9), now],
          datasets: [
            {
              label: 'Light Intensity (LDR Value)',
              data: [...(prev.datasets[0]?.data || []), res.data.ldr].slice(-10),
              borderColor: 'yellow',
              fill: false
            }
          ]
        }));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData(); // initial fetch

    const interval = setInterval(fetchData, 5000); // fetch every 5 seconds
    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="p-4 bg-blue-300 min-h-screen">
      <div className='flex justify-between'>
        <h1 className="text-3xl font-bold mb-6">IoT Device Management System</h1>

       <div className='flex items-center justify-center gap-2 w-[300px]'>
       <button
          onClick={() => setShowGraph(true)}
          className="bg-green-500 text-white rounded-lg font-bold w-full py-2 hover:bg-green-600 transition-all"
        >
          Show Graph
        </button>
        <button
          onClick={() => window.open('/history', '_blank')}
          className="w-full py-2 rounded-lg font-bold text-white bg-purple-500 hover:bg-purple-600 transition-all"
        >
          View History
        </button>
       </div>

      </div>
      <RealTimeMonitor />


      {showGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <Graph
            onClose={() => setShowGraph(false)}
            chartData={chartData}
            ldrChartData={ldrChartData}
          />
        </div>
      )}

      
    </div>
  );
}

export default App;
