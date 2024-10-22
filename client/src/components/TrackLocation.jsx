import React, { useState } from 'react';
import axios from 'axios';
import '../styling/TrackLocation.css';

const TrackLocation = ({ addLocation }) => {
  const [location, setLocation] = useState(null);  // State to track saved location
  const [note, setNote] = useState('');  // State to track the user's note input
  const [error, setError] = useState(null);  // State to track errors

  // Dynamically determine the backend URL based on environment
  const isProduction = import.meta.env.MODE === 'production';
  const apiUrl = isProduction 
    ? import.meta.env.VITE_PROD_BACKEND_URL 
    : import.meta.env.VITE_BACKEND_URL;

  // Utility function to get the JWT token
  const getToken = () => localStorage.getItem('token');

  // Function to handle errors
  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response.status === 403) {
        setError('You do not have permission to perform this action.');
      } else if (error.response.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(`Failed to save location: ${error.response.data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      setError('No response from server. Please check your internet connection.');
    } else {
      setError(`Unexpected error: ${error.message}`);
    }
    console.error('Error saving location:', error);
  };

  // Function to send the location data to the backend
  const saveLocation = async (locationData) => {
    try {
      const token = getToken();
      const url = `${apiUrl}/api/location`; // Use the `/api/location` endpoint for saving a static location

      const response = await axios.post(url, locationData, {
        headers: { 'x-auth-token': token },
      });

      addLocation(response.data);  // Add to map
      setLocation(locationData);   // Update local state with saved location
    } catch (error) {
      handleError(error);
    }
  };

  // Function to get the user's current geolocation and save it
  const trackLocation = () => {
    setError(null);  // Clear previous errors

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const locationData = {
          lat: latitude,
          lng: longitude,
          timestamp: new Date(),
          notes: note || '',  // Use the user's note or an empty string if no note is provided
        };

        saveLocation(locationData);  // Send the location to the backend
      }, (geoError) => {
        // Handle geolocation errors
        setError(`Geolocation error: ${geoError.message}`);
      });
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="track-location-container">
      <textarea 
        placeholder="Enter a note (optional)" 
        value={note} 
        onChange={(e) => setNote(e.target.value)} 
      />
      <button onClick={trackLocation}>Track My Location</button>
      
      {/* Display error message if it exists */}
      {error && <p className="error">{error}</p>}
      
      {/* Display saved location coordinates */}
      {location && (
        <p>
          <strong>Location saved:</strong> Lat {location.lat}, Lng {location.lng}
        </p>
      )}
    </div>
  );
};

export default TrackLocation;