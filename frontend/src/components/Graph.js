import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function Graph({ onClose, chartData, ldrChartData }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg relative w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
      
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
      >
        &times;
      </button>

      <h2 className="text-xl font-bold mb-4">Temperature & Humidity Graph</h2>

      <div className="mb-8">
        <Line data={chartData} />
      </div>

      <h2 className="text-xl font-bold mb-4">Light Intensity Graph</h2>

      <div className="mb-8">
        <Line data={ldrChartData} />
      </div>

    </div>
  );
}

export default Graph;
