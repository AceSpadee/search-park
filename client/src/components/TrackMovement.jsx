import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/axios';
import "../styling/TrackMovement.css";

const TrackMovement = ({ updateMap }) => {
  const [watchId, setWatchId] = useState(null);
  const [error, setError] = useState(null);
  const [path, setPath] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);

  const intervalRef = useRef(null); // To track the interval ID

  const handleError = (error) => {
    setError(error.message || 'Error tracking movement');
    console.error('Tracking error:', error);
    setLoading(false);
  };

  const fetchOrCreateSession = async () => {
    try {
      if (tracking && sessionId) {
        console.log('Using existing session:', sessionId);
        return sessionId;
      }

      setLoading(true);

      const response = await api.post(`/api/session/start`); // No need to attach the token manually

      const newSessionId = response.data.sessionId;
      setSessionId(newSessionId);
      setTracking(true);
      setLoading(false);
      console.log('New session created:', newSessionId);
      return newSessionId;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const saveMovement = async (locationData, activeSessionId) => {
    try {
      console.log('Saving movement:', locationData);

      await api.post(`/api/session/${activeSessionId}/movement`, locationData);

      console.log('Movement saved successfully:', locationData);
    } catch (error) {
      console.error('Error saving movement:', error.message);
      setError('Failed to save movement.');
    }
  };

  const startTracking = async () => {
    setError(null);
    setLoading(true);
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
  
          // Update current position and path
          setCurrentPosition([latitude, longitude]);
          setPath((prevPath) => {
            const newPath = [...prevPath, [latitude, longitude]];
            console.log('Path in TrackMovement before updateMap:', newPath); // Debugging log
            updateMap({ currentPosition: [latitude, longitude], path: newPath });
            console.log("Path in TrackMovement:", newPath); // Debugging log
            return newPath;
          });
  
          // Save the movement
          saveMovement(locationData, activeSessionId);
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

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setSessionId(null);
    setTracking(false);
    setError('Tracking stopped.');
  };

  useEffect(() => {
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (intervalRef.current) clearInterval(intervalRef.current);
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
      {currentPosition && (
        <p className="current-position">
          <strong>Current location:</strong> Lat: {currentPosition[0]}, Lng: {currentPosition[1]}
        </p>
      )}
    </div>
  );
};

export default TrackMovement;