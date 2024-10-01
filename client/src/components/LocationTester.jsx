import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LocationTester = () => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [latitude, setLatitude] = useState(0);  // Default latitude for testing
  const [longitude, setLongitude] = useState(0); // Default longitude for testing

  useEffect(() => {
    // Check if the map is already initialized
    if (map) {
      map.remove(); // Properly remove the previous map before re-initializing
    }

    // Initialize the map
    const mapInstance = L.map('map', {
      dragging: true,                // Enable dragging
      touchZoom: true,               // Enable zooming on touch
      scrollWheelZoom: true,         // Enable zooming with scroll wheel
      doubleClickZoom: true,         // Enable zooming on double click
      zoomControl: true,             // Show zoom controls
      attributionControl: true       // Show attribution control
    }).setView([0, 0], 2);           // Initial zoom level for the world view

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance);

    console.log("Map initialized!");
    setMap(mapInstance); // Store the map instance in state

    // Cleanup on component unmount
    return () => {
      if (mapInstance) {
        mapInstance.remove(); // Ensure the map instance is destroyed if the component is unmounted
      }
    };
  }, []); // Only run this effect once when the component mounts

  // Function to update the location manually
  const updateLocation = () => {
    if (map) {
      console.log("Updating location to:", latitude, longitude); // Debugging log
      // Set the map view to the new coordinates
      map.setView([latitude, longitude], 13);

      // Add or update the marker
      if (!marker) {
        const newMarker = L.marker([latitude, longitude]).addTo(map);
        newMarker.bindPopup(`Latitude: ${latitude}, Longitude: ${longitude}`).openPopup();
        setMarker(newMarker);
      } else {
        marker.setLatLng([latitude, longitude]).bindPopup(`Latitude: ${latitude}, Longitude: ${longitude}`).openPopup();
      }
    }
  };

  return (
    <div>
      <h1>Manual Location Tester</h1>
      <div>
        <label>
          Latitude:
          <input
            type="number"
            value={latitude !== null ? latitude : ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setLatitude(!isNaN(value) ? value : 0);  // Ensure valid number or fallback to 0
            }}
            placeholder="Enter latitude"
          />
        </label>
        <label>
          Longitude:
          <input
            type="number"
            value={longitude !== null ? longitude : ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setLongitude(!isNaN(value) ? value : 0);  // Ensure valid number or fallback to 0
            }}
            placeholder="Enter longitude"
          />
        </label>
        <button onClick={updateLocation}>Set Location</button>
      </div>
      {/* The map container */}
      <div id="map" style={{ height: '500px', width: '100%', zIndex: '1', position: 'relative', marginTop: '10px' }}></div>
    </div>
  );
};

export default LocationTester;