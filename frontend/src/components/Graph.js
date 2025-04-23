import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

const Graph = ({ onClose, chartData }) => {
    // Function to format date for tooltip
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString(); // Shows date and time in a readable format
    };
 

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg relative w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
      >
        &times;
      </button>

      {/* Temperature & Humidity Graph */}
      <div className="my-8 p-4 bg-white rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold text-center mb-4">Temperature & Humidity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="createdAt" hide={true} /> {/* Hide X-axis labels */}
            <YAxis />
            <Tooltip labelFormatter={formatDate} />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature (°C)"
              stroke="#ef4444"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              name="Humidity (%)"
              stroke="#3b82f6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Light Intensity (LDR) Graph */}
      <div className="my-8 p-4 bg-white rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold text-center mb-4">LDR (Light Intensity) Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="createdAt" hide={true} />
            <YAxis />
            <Tooltip labelFormatter={formatDate} />
            <Legend />
            <Line
              type="monotone"
              dataKey="ldr"
              name="Light (LDR)"
              stroke="#facc15"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Graph;
