import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [alert, setAlert] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('http://localhost:5000/api/data');
      const latest = res.data[res.data.length - 1];
      if (latest.temperature > 35) {
        setAlert('🔥 Warning: High Temperature!');
      } else if (latest.humidity > 70) {
        setAlert('💧 Warning: High Humidity!');
      } else {
        setAlert('');
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    alert && (
      <div className="p-4 bg-red-400 text-white text-center">
        {alert}
      </div>
    )
  );
};

export default Notifications;
