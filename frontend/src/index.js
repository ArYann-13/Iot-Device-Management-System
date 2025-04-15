import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HistorySection from './components/HistorySection';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<App />} />
    <Route path="/history" element={<HistorySection />} />
    
    </Routes>
    </BrowserRouter>
    
  </React.StrictMode>
);


