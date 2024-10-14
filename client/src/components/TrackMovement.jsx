import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrackMovement = ({ addLocation }) => {
  const [watchId, setWatchId] = useState(null);  // Store the geolocation watch ID
  const [error, setError] = useState(null);  // Track errors
  const [intervalId, setIntervalId] = useState(null); // Interval ID for saving location

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

  // Function to save location to the backend
  const saveLocation = async (locationData) => {
    try {
      const token = getToken();
      if (!token) {
        setError('User not logged in. Please log in to track your movement.');
        return;
      }

      // Post the location data to the server
      const response = await axios.post(`${apiUrl}/api/location`, locationData, {
        headers: { 'x-auth-token': token },
      });
      
      addLocation(response.data.location);  // Update the map with the new location
    } catch (error) {
      handleError(error);
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

          saveLocation(locationData);  // Send the current location to the backend
        },
        (geoError) => {
          handleError(`Geolocation error: ${geoError.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);  // Store the watch ID to stop tracking later

      // Set up a 5-second interval to send location updates
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationData = {
              lat: latitude,
              lng: longitude,
              timestamp: new Date(),
            };
            saveLocation(locationData);  // Save the location to the backend every 5 seconds
          },
          (geoError) => {
            handleError(`Geolocation error: ${geoError.message}`);
          },
          { enableHighAccuracy: true }
        );
      }, 5000);  // Save location every 5 seconds
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