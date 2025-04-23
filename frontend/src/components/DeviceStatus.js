import React, { useEffect, useState } from 'react';

const DeviceStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/device-status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error('Error fetching device status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // auto-refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4  w-full max-w-md mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Device Status</h2>
      {loading ? (
        <p className="text-gray-500 text-center">Loading status...</p>
      ) : (
        <ul className="space-y-2 text-center">
          <li>
            DHT22 Sensor:{" "}
            <span className={status?.dht22 ? "text-green-600" : "text-red-500"}>
              {status?.dht22 ? "Connected" : "Disconnected"}
            </span>
          </li>
          <li>
            LDR Sensor:{" "}
            <span className={status?.ldr ? "text-green-600" : "text-red-500"}>
              {status?.ldr ? "Connected" : "Disconnected"}
            </span>
          </li>
          <li>
            Fan Relay:{" "}
            <span className={status?.fan ? "text-green-600" : "text-red-500"}>
              {status?.fan ? "Connected" : "Disconnected"}
            </span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default DeviceStatus;
