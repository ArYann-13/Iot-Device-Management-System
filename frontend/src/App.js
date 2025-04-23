import React, { useEffect, useState} from 'react';
import RealTimeMonitor from './components/RealTImeMonitor';
import Graph from './components/Graph';
import axios from 'axios';

function App() {
  const [showGraph, setShowGraph] = useState(false);
  const [chartData, setChartData] = useState([]);
 
   
   const fetchRealTimeData = async () => {
     try {
       const response = await axios.get('http://localhost:5000/api/latest');
       const latestData = response.data;
 
       // Ensure that createdAt is valid
       if (latestData && latestData.createdAt) {
         setChartData((prevData) => [...prevData, latestData].slice(-50)); // Keep last 50 data points
       }
     } catch (error) {
       console.error('Error fetching real-time data:', error);
     }
   };
 
   useEffect(() => {
     fetchRealTimeData(); // Fetch first data immediately when the app loads
 
     const interval = setInterval(() => {
       fetchRealTimeData();
     }, 5000);
 
   
     return () => clearInterval(interval);
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
          />
        </div>
      )}

      
    </div>
  );
}

export default App;
