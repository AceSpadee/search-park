import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrackMovement = ({ addLocation }) => {
  const [watchId, setWatchId] = useState(null);  // Store the geolocation watch ID
  const [error, setError] = useState(null);  // Track errors
  const [intervalId, setIntervalId] = useState(null); // Interval ID for saving movement

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

  // Function to save movement to the backend
  const saveMovement = async (locationData) => {
    try {
      const token = getToken();
      const response = await axios.post(`${apiUrl}/api/movement`, locationData, {
        headers: { 'x-auth-token': token },
      });
  
      console.log('Response from backend:', response.data);  // Log the response to see if it includes _id
      addLocation(response.data);  // Add movement to the map
    } catch (error) {
      console.error('Error saving movement:', error);
      setError('Failed to save movement');
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

          saveMovement(locationData);  // Send the current location as movement data to the backend
        },
        (geoError) => {
          handleError(`Geolocation error: ${geoError.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);  // Store the watch ID to stop tracking later

      // Set up a 5-second interval to send movement updates
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationData = {
              lat: latitude,
              lng: longitude,
              timestamp: new Date(),
            };
            saveMovement(locationData);  // Save the movement data to the backend every 5 seconds
          },
          (geoError) => {
            handleError(`Geolocation error: ${geoError.message}`);
          },
          { enableHighAccuracy: true }
        );
      }, 5000);  // Save movement data every 5 seconds
      setIntervalId(interval);
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
    if (intervalId) {
      clearInterval(intervalId);  // Clear the 5-second interval
      setIntervalId(null);  // Reset the intervalId
    }
  };

  // Clean up the geolocation watch and interval when the component is unmounted
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId) {
        clearInterval(intervalId);  // Clear the interval on unmount
      }
    };
  }, [watchId, intervalId]);

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