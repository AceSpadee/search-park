import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrackMovement = ({ addLocation }) => {
  const [watchId, setWatchId] = useState(null);  // Store the geolocation watch ID
  const [error, setError] = useState(null);  // Track errors
  const [path, setPathState] = useState([]);  // Local state to store the path
  const [lastLocation, setLastLocation] = useState(null);  // State to show last known location

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

  // Function to save movement to the backend and update the path
  const saveMovement = async (locationData) => {
    try {
      const token = getToken();
      if (!token) {
        setError('User not logged in. Please log in to track your movement.');
        return;
      }

      const response = await axios.post(`${apiUrl}/api/movement`, locationData, {
        headers: { 'x-auth-token': token },
      });

      addLocation(response.data);
      setPathState((prevPath) => [...prevPath, [locationData.lat, locationData.lng]]);
    } catch (error) {
      console.error('Error saving movement:', error);
      setError('Failed to save movement');
    }
  };

  // Function to start tracking the user's movement
  const startTracking = () => {
    setError(null);

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = {
            lat: latitude,
            lng: longitude,
            timestamp: new Date(),
          };

          // Save the movement and update the path
          saveMovement(locationData);

          // Update the last known location for visual feedback
          setLastLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        },
        (geoError) => {
          handleError(new Error(`Geolocation error: ${geoError.message}`));
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // Function to stop tracking the user's movement
  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setError('Tracking stopped.');
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

      {/* Display last known location for feedback */}
      {lastLocation && (
        <p>
          <strong>Last known location:</strong> {lastLocation}
        </p>
      )}
    </div>
  );
};

export default TrackMovement;