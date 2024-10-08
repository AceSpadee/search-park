import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackLocation from '../components/TrackLocation';
import MapComponent from '../components/MapComponent';

const LocationApp = () => {
  const [locations, setLocations] = useState([]);  // Store user's locations
  const [error, setError] = useState(null);  // Track any errors

  // Function to fetch saved locations from the server
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');  // Get JWT token from localStorage
      if (!token) {
        setError('User not logged in. Please log in to see your locations.');
        return;
      }

      const response = await axios.get('/api/location', {
        headers: {
          'x-auth-token': token,  // Send the JWT token in the request header
        },
      });

      setLocations(response.data);  // Update the state with fetched locations
    } catch (error) {
      setError('Failed to load locations. Please try again.');
      console.error('Error fetching locations:', error);
    }
  };

  // Function to add a new location to the state
  const addLocation = (newLocation) => {
    setLocations([...locations, newLocation]);  // Add the new location to the array
  };

  // Fetch locations when the component mounts
  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div>
      <h1>Track My Location</h1>
      {/* Pass the addLocation function to TrackLocation so it can update the map */}
      <TrackLocation addLocation={addLocation} />

      {/* Pass the locations to MapComponent to display them */}
      <MapComponent locations={locations} />

      {/* Display any error messages */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LocationApp;