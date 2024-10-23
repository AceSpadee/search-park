import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackLocation from '../components/TrackLocation';
import TrackMovement from '../components/TrackMovement';
import MapComponent from '../components/MapComponent';
import "../styling/Location.css";

const LocationApp = () => {
  const [locations, setLocations] = useState([]); // Store user's locations
  const [newLocation, setNewLocation] = useState(null); // Track the newly added location
  const [error, setError] = useState(null); // Track any errors
  const [path, setPath] = useState([]); // Track the path for movements
  const [loading, setLoading] = useState(true);
  const [isNewSession, setIsNewSession] = useState(false);

  // Dynamically determine the backend URL based on environment
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  // Utility function to get the JWT token
  const getToken = () => localStorage.getItem('token');

  // Function to handle errors
  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(`Failed to load locations: ${error.response.data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      setError('No response from server. Please check your internet connection.');
    } else {
      setError(`Unexpected error: ${error.message}`);
    }
    console.error('Error fetching locations:', error);
  };

  // Function to fetch saved locations
  const fetchLocations = async () => {
    const token = getToken();
    if (!token) {
      setError('User not logged in. Please log in to see your locations.');
      setLoading(false);
      return;
    }
  
    try {
      const locationResponse = await axios.get(`${apiUrl}/api/location`, {
        headers: { 'x-auth-token': token },
      });
  
      const locationsData = Array.isArray(locationResponse.data) ? locationResponse.data : [];
      setLocations(locationsData);
      setError(null);
    } catch (error) {
      handleError(error);
    }
  };

  // Function to fetch saved sessions and movements
  const fetchSessions = async () => {
    const token = getToken();
    if (!token) {
      setError('User not logged in. Please log in to see your movements.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/api/session`, {
        headers: { 'x-auth-token': token },
      });

      const sessionsData = Array.isArray(response.data) ? response.data : [];
      const pathCoordinates = sessionsData.flatMap(session =>
        Array.isArray(session.movements) ? session.movements.map(movement => [movement.lat, movement.lng]) : []
      );
      setPath(pathCoordinates);
      setError(null);
    } catch (error) {
      handleError(error);
    }
  };

  // Function to fetch both locations and sessions
  const fetchLocationsAndSessions = async () => {
    setLoading(true);
    await fetchLocations();
    await fetchSessions();
    setLoading(false);
  };

  // Function to add a new location to the state
  const addLocation = (newLocation) => {
    const locationData = newLocation.location ? newLocation.location : newLocation;
    if (!locationData._id) {
      setError('Failed to add location: Missing location ID.');
    } else {
      if (!locations.some(loc => loc._id === locationData._id)) {
        setLocations(prevLocations => [...prevLocations, locationData]);
        setNewLocation(locationData);
      }
    }
  };

  // Fetch locations and sessions when the component mounts
  useEffect(() => {
    fetchLocationsAndSessions();
  }, []);

  useEffect(() => {
    if (newLocation) {
      if (!locations.some(loc => loc._id === newLocation._id)) {
        setLocations(prevLocations => [...prevLocations, newLocation]);
      }
    }
  }, [newLocation]);

  return (
    <div className="location-app">

      <div className="controls">
        <TrackLocation addLocation={setNewLocation} />

        <TrackMovement addLocation={setNewLocation} setIsNewSession={setIsNewSession} />
      </div>

      {error && <div className="alert-danger">{error}</div>}

      <div className="map-wrapper">
        <MapComponent locations={locations} newLocation={newLocation} path={path} />
      </div>
    </div>
  );
};


export default LocationApp;