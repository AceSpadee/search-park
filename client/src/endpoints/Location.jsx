import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackLocation from '../components/TrackLocation';
import MapComponent from '../components/MapComponent';

const LocationApp = () => {
  const [locations, setLocations] = useState([]);  // Store user's locations
  const [newLocation, setNewLocation] = useState(null);  // Track the newly added location
  const [error, setError] = useState(null);  // Track any errors

  // Dynamically determine the backend URL based on environment
  const apiUrl = import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_PROD_BACKEND_URL 
    : import.meta.env.VITE_BACKEND_URL;

  // Utility function to get the JWT token
  const getToken = () => localStorage.getItem('token');

  // Function to handle errors
  const handleError = (error) => {
    if (error.response) {
      // Server responded with a status code outside of the range of 2xx
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

  // Function to fetch saved locations from the server
  const fetchLocations = async () => {
    const token = getToken();  // Get JWT token from localStorage
    if (!token) {
      setError('User not logged in. Please log in to see your locations.');
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/api/location`, {
        headers: { 'x-auth-token': token },
      });
      setLocations(response.data);  // Update the state with fetched locations
    } catch (error) {
      handleError(error);
    }
  };

  // Function to add a new location to the state
  const addLocation = (newLocation) => {
    setLocations((prevLocations) => [...prevLocations, newLocation]);  // Add the new location to the array
    setNewLocation(newLocation);  // Track the latest added location
  };

  // Fetch locations when the component mounts
  useEffect(() => {
    fetchLocations();
  }, []);  // Only run on initial render

  return (
    <div>
      <h1>Track My Location</h1>

      {/* Pass the addLocation function to TrackLocation so it can update the map */}
      <TrackLocation addLocation={addLocation} />

      {/* Pass the locations to MapComponent to display them */}
      <MapComponent locations={locations} newLocation={newLocation} />

      {/* Display any error messages */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LocationApp;