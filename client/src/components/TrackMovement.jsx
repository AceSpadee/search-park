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
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(null);

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

      const response = await api.post(`/api/session/start`);

      const newSessionId = response.data.sessionId;
      setSessionId(newSessionId);
      setStartTime(new Date(response.data.startTime)); // Capture session start time
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
  
    // Set the start time when tracking begins
    setStartTime(new Date());
  
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
            updateMap({ currentPosition: [latitude, longitude], path: newPath });
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

  const stopTracking = async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  
    if (startTime && sessionId) {
      const endTime = new Date();
  
      try {
        // Send endTime to the backend
        await api.put(`/api/session/${sessionId}/stop`, { endTime });
  
        // Calculate duration
        const durationMs = endTime - new Date(startTime);
        const durationMinutes = Math.floor(durationMs / 1000 / 60);
        setDuration(durationMinutes);
        console.log(`Duration: ${durationMinutes} minute(s)`);
      } catch (error) {
        console.error('Error stopping session:', error.message);
        setError('Failed to stop tracking session.');
      }
    }
  
    setSessionId(null);
    setTracking(false);
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
      {duration !== null && (
        <p className="tracking-duration">
          <strong>Duration:</strong> {duration} minute(s)
        </p>
      )}
    </div>
  );
};

export default TrackMovement;