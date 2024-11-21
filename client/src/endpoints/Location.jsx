import React, { useState, useEffect } from 'react';
import api from '../utils/axios'
import TrackLocation from '../components/TrackLocation';
import TrackMovement from '../components/TrackMovement';
import MapComponent from '../components/MapComponent';
import "../styling/Location.css";

const LocationApp = () => {
  const [locations, setLocations] = useState([]); // Initialize as an empty array
  const [currentPosition, setCurrentPosition] = useState(null);
  const [sessionPaths, setSessionPaths] = useState([]); // Initialize as an empty array
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleError = (error) => {
    console.error('Error:', error);
    setError(error?.message || 'An unexpected error occurred.');
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/api/location');
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);

      // Fetch sessions with grouped movements
      const response = await api.get('/api/session');

      const sessionsData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched session data:', sessionsData);

      // Map movements into session paths
      const paths = sessionsData.map((session) =>
        session.movements.map((movement) => [movement.lat, movement.lng])
      );

      setSessionPaths(paths);
      console.log('Session paths updated:', paths);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingSessions(false);
    }
  };

  console.log('Updated sessionPaths in LocationApp:', sessionPaths);

  const fetchLocationsAndSessions = async () => {
    setLoading(true);
    await Promise.all([fetchLocations(), fetchSessions()]);
    setLoading(false);
  };

  const addLocation = (newLocation) => {
    if (!newLocation || !newLocation._id) {
      handleError(new Error('Invalid location data.'));
      return;
    }

    setLocations((prev) => [...prev, newLocation]);
  };

  const handleDeleteLocation = async (index) => {
    const locationId = locations[index]?._id;

    if (!locationId) {
      handleError(new Error('Invalid location ID.'));
      return;
    }

    try {
      await api.delete(`/api/location/${locationId}`);
      setLocations((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      handleError(error);
    }
  };

  const handleDragMarker = async (event, index) => {
    const newPosition = event.target.getLatLng();
    const locationId = locations[index]?._id;

    if (!locationId) {
      handleError(new Error('Invalid location ID.'));
      return;
    }

    try {
      await api.put(`/api/location/${locationId}`, {
        newLat: newPosition.lat,
        newLng: newPosition.lng,
      });

      setLocations((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], lat: newPosition.lat, lng: newPosition.lng };
        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchLocationsAndSessions();
  }, []);

  return (
    <div className="location-app">
      {loading && <div className="loading-spinner">Loading...</div>} {/* Display loading spinner */}

      <div className="controls">
        <TrackLocation addLocation={addLocation} />
        <TrackMovement
          updateMap={({ currentPosition: pos, path }) => {
            console.log('Path received in LocationApp:', path); // Debugging log
            setCurrentPosition(pos);
            setSessionPaths((prevPaths) => {
              const updatedPaths = [...prevPaths];
              updatedPaths[updatedPaths.length - 1] = path; // Update the last session path
              console.log('Updated sessionPaths in LocationApp:', updatedPaths); // Debugging log
              return updatedPaths;
            });
          }}
        />
      </div>

      {error && <div className="alert-danger">{error}</div>}

      {!loading && (
        <div className="map-wrapper">
          <MapComponent
            currentPosition={currentPosition}
            sessionPaths={sessionPaths || []} // Ensure array
            savedLocations={locations || []} // Ensure array
            onDeleteLocation={handleDeleteLocation} // Pass delete handler
            onDragMarker={handleDragMarker} // Pass drag handler
          />
        </div>
      )}
    </div>
  );
};

export default LocationApp;