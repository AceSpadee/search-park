import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrackMovement = ({ addLocation }) => {
  const [watchId, setWatchId] = useState(null);  // Store the geolocation watch ID
  const [error, setError] = useState(null);  // Track errors
  const [path, setPathState] = useState([]);  // Local state to store the path
  const [lastLocation, setLastLocation] = useState(null);  // State to show last known location
  const [sessionId, setSessionId] = useState(null);  // State to track the current session
  const [loading, setLoading] = useState(false); // Track loading state
  const [tracking, setTracking] = useState(false); // Track whether tracking is active

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
    setLoading(false);
  };

  // Function to start a new session or fetch the current session
  const fetchOrCreateSession = async () => {
    try {
      if (tracking && sessionId) {
        // If already tracking with a session, do not create a new session
        console.log('Tracking is already active. Using the existing session:', sessionId);
        return sessionId;
      }

      setLoading(true);
      const token = getToken();
      if (!token) {
        setError('User not logged in. Please log in to start tracking.');
        setLoading(false);
        return null;
      }

      const response = await axios.post(`${apiUrl}/api/session/start`, {}, {
        headers: { 'x-auth-token': token },
      });

      // Set the active session ID and mark tracking as active
      const newSessionId = response.data.sessionId;
      setSessionId(newSessionId);
      setTracking(true);
      setLoading(false);
      console.log('New session created:', newSessionId);
      return newSessionId; // Return the sessionId for further use
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  // Function to start tracking the user's movement
  const startTracking = async () => {
    setError(null);
    setLoading(true);

    // Wait for the session to be created if it's not already active
    const activeSessionId = await fetchOrCreateSession();

    if (!activeSessionId) {
      setError('Failed to start tracking. No session found.');
      setLoading(false);
      return;
    }

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
          saveMovement(locationData, activeSessionId);

          // Update the last known location for visual feedback
          setLastLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        },
        (geoError) => {
          handleError(new Error(`Geolocation error: ${geoError.message}`));
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);
      setLoading(false);
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  // Function to save movement to the backend and update the path
  const saveMovement = async (locationData, activeSessionId) => {
    try {
      const token = getToken();
      if (!token) {
        setError('User not logged in. Please log in to track your movement.');
        return;
      }

      // Make the request to save the movement
      const response = await axios.post(`${apiUrl}/api/session/${activeSessionId}/movement`, locationData, {
        headers: { 'x-auth-token': token },
      });

      const movementData = response.data;

      if (!movementData._id) {
        setError('Failed to add movement: Missing movement ID.');
        return;
      }

      // Add the new movement to the map and update the state
      addLocation(movementData);
      setPathState((prevPath) => [...prevPath, [movementData.lat, movementData.lng]]);
    } catch (error) {
      console.error('Error saving movement:', error);

      // Handle error correctly
      if (error.response && error.response.status) {
        setError(`Failed to save movement: ${error.response.data.message || 'Unknown error'}`);
      } else {
        setError('Failed to save movement due to a network error');
      }
    }
  };

  // Function to stop tracking the user's movement
  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setError('Tracking stopped.');
    }

    // Clear the active session and reset tracking state
    setSessionId(null);
    setTracking(false);
  };

  // Clean up the geolocation watch and stop tracking when the component is unmounted
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      stopTracking();
    };
  }, [watchId]);

  return (
    <div>
      {/* Start Tracking Button */}
      <button onClick={startTracking} disabled={watchId !== null || loading}>
        {loading ? 'Starting...' : 'Start Tracking Movement'}
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