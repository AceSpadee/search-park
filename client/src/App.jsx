// App.jsx

// fix this later ================================================================

import React, { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [map, setMap] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [locations, setLocations] = useState([]);

  // Initialize the map
  const initializeMap = () => {
    if (!map) {
      const leafletMap = L.map('map').setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);
      setMap(leafletMap);
    }
  };

  // Handle location tracking
  const trackLocation = (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Add a marker to the map
    L.marker([lat, lon]).addTo(map).bindPopup(`Lat: ${lat}, Lon: ${lon}`).openPopup();

    // Store location in state
    setLocations((prevLocations) => [...prevLocations, { lat, lon }]);

    // Send location to the server
    sendLocationToServer({ lat, lon });
  };

  // Start tracking user location
  const startTracking = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(trackLocation, (err) => {
        console.error(err);
      });
      setWatchId(id);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Stop tracking user location
  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // Send the location to the server via POST request
  const sendLocationToServer = async (location) => {
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      });
      if (!response.ok) {
        console.error('Failed to send location to server');
      }
    } catch (error) {
      console.error('Error while sending location:', error);
    }
  };

  // Initialize the map on component mount
  React.useEffect(() => {
    initializeMap();
  }, []);

  return (
    <div>
      <h3>Track My Location</h3>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
      <button onClick={startTracking} disabled={watchId !== null}>Start Tracking</button>
      <button onClick={stopTracking} disabled={watchId === null}>Stop Tracking</button>
    </div>
  );
}

export default App;