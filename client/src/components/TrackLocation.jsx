import React, { useState } from 'react';
import axios from 'axios';

const TrackLocation = ({ addLocation }) => {
  const [location, setLocation] = useState(null);
  const [note, setNote] = useState(''); // State to track the user's note input

  // Function to capture and send location to the backend
  const trackLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = {
          lat: latitude,
          lng: longitude,
          timestamp: new Date(),
          notes: note || '',  // Use the user's note or an empty string if no note is provided
        };

        try {
          const token = localStorage.getItem('token'); // Get JWT token from localStorage
          if (!token) {
            console.error('User not logged in');
            return;
          }
          
          const response = await axios.post('/api/location', locationData, {
            headers: {
              'x-auth-token': token,  // Send the token in the request header
            },
          });
          setLocation(locationData);
          addLocation(locationData);  // Update the map with the new location
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
      <textarea 
        placeholder="Enter a note (optional)" 
        value={note} 
        onChange={(e) => setNote(e.target.value)} 
      />
      <button onClick={trackLocation}>Track My Location</button>
      {location && <p>Location saved: {location.lat}, {location.lng}</p>}
    </div>
  );
};

export default TrackLocation;