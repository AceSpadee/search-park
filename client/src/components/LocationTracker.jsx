import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LocationTracker = () => {
  const [map, setMap] = useState(null);
  const [location, setLocation] = useState(null);
  const IPBASE_API_KEY = import.meta.env.VITE_IPBASE_API_KEY; // Access env variable

  // Define a custom icon (you can use your own image here)
  const customIcon = L.icon({
    iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png', // Replace with your icon URL
    shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  // Function to fetch location from IPbase API
  const fetchLocationFromIPbase = async () => {
    try {
      const response = await fetch(`https://api.ipbase.com/v2/info?apikey=${IPBASE_API_KEY}`);
      const data = await response.json();

      if (data && data.data && data.data.location) {
        const { latitude, longitude } = data.data.location;
        setLocation({ latitude, longitude });
      } else {
        console.error("Unable to fetch location from IPbase.");
      }
    } catch (error) {
      console.error("Error fetching location from IPbase: ", error);
    }
  };

  useEffect(() => {
    fetchLocationFromIPbase(); // Fetch location on mount
  }, []);

  useEffect(() => {
    if (location && !map) {
      // Initialize the map when location is available
      const mapInstance = L.map('map').setView([location.latitude, location.longitude], 13);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance);

      // Add marker or custom icon to the map
      L.marker([location.latitude, location.longitude], { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup('Your Approximate Location')
        .openPopup();

      setMap(mapInstance);
    } else if (location && map) {
      // Update map location when the location changes
      map.setView([location.latitude, location.longitude], 13);
      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup('Your Approximate Location')
        .openPopup();
    }
  }, [location, map, customIcon]);

  return (
    <div>
      <h1>IP-based Location Tracker</h1>
      <div>
        <button onClick={fetchLocationFromIPbase}>Refetch Location</button>
      </div>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
};

export default LocationTracker;