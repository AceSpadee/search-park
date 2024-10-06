import React, { useState } from 'react';
import axios from 'axios';

const TrackLocation = () => {
  const [location, setLocation] = useState(null);

  // Function to capture and send location to the backend
  const trackLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = {
          lat: latitude,
          lng: longitude,
          timestamp: new Date(),  // You can send a custom timestamp or let the backend handle it
          notes: 'Visited this location',  // Optional notes
        };

        try {
          // Send the location to the backend
          const response = await axios.post('/api/location', locationData, {
            headers: {
              Authorization: `Bearer ${yourJWTToken}`,  // Send the JWT token if needed
            },
          });
          setLocation(locationData);  // Update state with the captured location
          console.log('Location saved:', response.data);
        } catch (error) {
          console.error('Error saving location:', error);
        }
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div>
      <button onClick={trackLocation}>Track My Location</button>
      {location && <p>Location saved: {location.lat}, {location.lng}</p>}
    </div>
  );
};

export default TrackLocation;