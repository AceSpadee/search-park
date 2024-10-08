import React, { useState } from 'react';
import axios from 'axios';

const TrackLocation = ({ addLocation }) => {
  const [location, setLocation] = useState(null);
  const [note, setNote] = useState('');  // State to track the user's note input
  const [error, setError] = useState(null);  // State to track errors

  // Function to capture and send location to the backend
  const trackLocation = () => {
    setError(null);  // Clear any previous error when attempting to track location

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
          const token = localStorage.getItem('token');  // Get JWT token from localStorage
          if (!token) {
            setError('User not logged in. Please log in to track your location.');
            return;
          }

          // Send the location to the backend with the token
          const response = await axios.post('/api/location', locationData, {
            headers: {
              'x-auth-token': token,  // Send the JWT token in the request header
            },
          });

          setLocation(locationData);
          addLocation(locationData);  // Update the map with the new location
          console.log('Location saved:', response.data);
        } catch (error) {
          // Handle specific Axios errors
          if (error.response) {
            // Server responded with a status code that falls out of the range of 2xx
            if (error.response.status === 401) {
              setError('Authentication failed. Please log in again.');
            } else if (error.response.status === 403) {
              setError('You do not have permission to perform this action.');
            } else if (error.response.status === 500) {
              setError('Server error occurred. Please try again later.');
            } else {
              setError(`Failed to save location: ${error.response.data.message || 'Unknown error'}`);
            }
          } else if (error.request) {
            // The request was made but no response was received
            setError('No response from server. Please check your internet connection.');
          } else {
            // Something else caused the error
            setError(`Unexpected error: ${error.message}`);
          }
          console.error('Error saving location:', error);
        }
      }, (geoError) => {
        // Handle geolocation errors
        setError(`Geolocation error: ${geoError.message}`);
      });
    } else {
      setError('Geolocation is not supported by this browser.');
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
      
      {/* Display error message if it exists */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display saved location */}
      {location && <p>Location saved: {location.lat}, {location.lng}</p>}
    </div>
  );
};

export default TrackLocation;