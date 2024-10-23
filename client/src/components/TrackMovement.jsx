import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styling/TrackMovement.css";

const TrackMovement = ({ addLocation, setIsNewSession }) => {
  const [watchId, setWatchId] = useState(null);  // Store the geolocation watch ID
  const [error, setError] = useState(null);  // Track errors
  const [lastLocation, setLastLocation] = useState(null);  // State to show last known location
  const [sessionId, setSessionId] = useState(null);  // State to track the current session
  const [loading, setLoading] = useState(false); // Track loading state
  const [tracking, setTracking] = useState(false); // Track whether tracking is active

  const apiUrl = import.meta.env.VITE_BACKEND_URL;

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

      const newSessionId = response.data.sessionId;
      setSessionId(newSessionId);
      setTracking(true);
      setLoading(false);

      // Notify the parent about the new session
      setIsNewSession(true);
      console.log('New session created:', newSessionId);
      return newSessionId;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  // Function to start tracking the user's movement
  const startTracking = async () => {
    setError(null);

    const activeSessionId = await fetchOrCreateSession();
    if (!activeSessionId) {
      setError('Failed to start tracking. No session found.');
      return;
    }

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = { lat: latitude, lng: longitude, timestamp: new Date() };

          saveMovement(locationData, activeSessionId);
          setLastLocation(`Lat: ${latitude}, Lng: ${longitude}`);
          addLocation(locationData, true); // Update the parent component's path
        },
        (geoError) => handleError(new Error(`Geolocation error: ${geoError.message}`)),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      // Periodically fetch the current position every 15 seconds
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationData = { lat: latitude, lng: longitude, timestamp: new Date() };

            saveMovement(locationData, activeSessionId);
            setLastLocation(`Lat: ${latitude}, Lng: ${longitude}`);
            addLocation(locationData, true); // Update the parent component's path
          },
          (geoError) => handleError(new Error(`Geolocation error: ${geoError.message}`)),
          { enableHighAccuracy: true }
        );
      }, 15000);

      setWatchId({ id, intervalId });
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
  
      const response = await axios.post(`${apiUrl}/api/session/${activeSessionId}/movement`, locationData, {
        headers: { 'x-auth-token': token },
      });
  
      const movementData = response.data;
  
      // Ensure the response contains an _id
      if (!movementData._id) {
        setError('Failed to add movement: Missing movement ID.');
        return;
      }
  
      addLocation(movementData, true); // Update the parent component
    } catch (error) {
      console.error('Error saving movement:', error);
      setError(error.response?.data.message || 'Failed to save movement due to a network error');
    }
  };

  // Function to stop tracking the user's movement
  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId.id);
      clearInterval(watchId.intervalId);
      setWatchId(null);
      setError('Tracking stopped.');
    }

    setSessionId(null);
    setTracking(false);

    // Reset the session state in the parent component
    setIsNewSession(false);
  };

  // Clean up the geolocation watch and stop tracking when the component is unmounted
  useEffect(() => {
    return () => {
      if (watchId && watchId.id) {
        navigator.geolocation.clearWatch(watchId.id);
      }
      stopTracking();
    };
  }, [watchId]);

  return (
    <div className="track-movement-container">
      <button
        className="start-button"
        onClick={startTracking}
        disabled={watchId !== null || loading}
      >
        {loading ? 'Starting...' : 'Start Tracking Movement'}
      </button>

      <button
        className="stop-button"
        onClick={stopTracking}
        disabled={watchId === null}
      >
        Stop Tracking Movement
      </button>

      {error && <p className="error">{error}</p>}
      {lastLocation && (
        <p className="last-location">
          <strong>Last known location:</strong> {lastLocation}
        </p>
      )}
    </div>
  );
};

export default TrackMovement;