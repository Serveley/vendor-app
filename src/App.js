import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    const vendorData = localStorage.getItem('vendorData');
    if (token && vendorData) {
      setVendor(JSON.parse(vendorData));
    }
  }, []);

  const handleLogin = (token, vendorData) => {
    localStorage.setItem('vendorToken', token);
    localStorage.setItem('vendorData', JSON.stringify(vendorData));
    setVendor(vendorData);
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorData');
    setVendor(null);
  };

  if (!vendor) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Box>
      <Dashboard vendor={vendor} onLogout={handleLogout} />
    </Box>
  );
}

export default App;
