import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrackMovement = ({ addLocation }) => {
  const [watchId, setWatchId] = useState(null);  // Store the geolocation watch ID
  const [error, setError] = useState(null);  // Track errors
  const [lastSavedTime, setLastSavedTime] = useState(0);  // Track the last time the location was saved

  // Dynamically determine the backend URL based on environment
  const isProduction = import.meta.env.MODE === 'production';
  const apiUrl = isProduction 
    ? import.meta.env.VITE_PROD_BACKEND_URL 
    : import.meta.env.VITE_BACKEND_URL;

  // Utility function to get the JWT token
  const getToken = () => localStorage.getItem('token');

  // Function to handle errors
  const handleError = (error) => {
    setError(error.message || 'Error tracking movement');
    console.error('Tracking error:', error);
  };

  // Function to save movement to the backend every 5 seconds
  const saveMovement = async (locationData) => {
    const currentTime = Date.now();
    if (currentTime - lastSavedTime >= 5000) {  // Check if 5 seconds have passed
      try {
        const token = getToken();
        if (!token) {
          setError('User not logged in. Please log in to track your movement.');
          return;
        }

        console.log('Sending movement data to backend:', locationData);  // Log data

        const response = await axios.post(`${apiUrl}/api/movement`, locationData, {
          headers: { 'x-auth-token': token },
        });

        console.log('Response from backend:', response.data);  // Log response
        addLocation(response.data);  // Add movement to the map

        setLastSavedTime(currentTime);  // Update the last saved time
      } catch (error) {
        console.error('Error saving movement:', error);
        setError('Failed to save movement');
      }
    }
  };

  // Function to start tracking the user's movement
  const startTracking = () => {
    setError(null);  // Clear previous errors

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = {
            lat: latitude,
            lng: longitude,
            timestamp: new Date(),
          };

          // Save the movement data every 5 seconds
          saveMovement(locationData);
        },
        (geoError) => {
          handleError(`Geolocation error: ${geoError.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);  // Store the watch ID to stop tracking later
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // Function to stop tracking the user's movement
  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);  // Clear the geolocation watch
      setWatchId(null);  // Reset the watchId
    }
  };

  // Clean up the geolocation watch when the component is unmounted
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div>
      {/* Start Tracking Button */}
      <button onClick={startTracking} disabled={watchId !== null}>
        Start Tracking Movement
      </button>

      {/* Stop Tracking Button */}
      <button onClick={stopTracking} disabled={watchId === null}>
        Stop Tracking Movement
      </button>

      {/* Display any error messages */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default TrackMovement;