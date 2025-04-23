import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Brush, ResponsiveContainer
} from 'recharts';

const ReChart = ({ title, data, lines, xKey = 'createdAt', zoomable = false }) => {
  // Format for tooltip only
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString(); // Shows date + time
  };

  return (
    <div className="my-8 p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-xl font-semibold text-center mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} hide={true} /> {/* Hide labels on axis */}
          <YAxis />
          <Tooltip labelFormatter={formatDate} />
          <Legend />
          {lines.map((line, idx) => (
            <Line
              key={idx}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              dot={false}
            />
          ))}
          {zoomable && <Brush dataKey={xKey} height={30} stroke="#8884d8" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReChart;
