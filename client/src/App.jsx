import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import 'leaflet/dist/leaflet.css';
import "./styling/App.css";

function App() {
  // Initialize isLoggedIn state based on the presence of the accessToken in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));

  useEffect(() => {
    // Sync with localStorage changes, in case of multi-tab usage
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('accessToken'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main>
        {/* Pass isLoggedIn and setIsLoggedIn to child components via Outlet */}
        <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
      </main>
    </div>
  );
}

export default App;