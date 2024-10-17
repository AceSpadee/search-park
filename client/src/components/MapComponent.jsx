import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix the broken marker icon issue
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ newLocation }) => {
  const [markers, setMarkers] = useState([]); // Initialize markers as an empty array
  const [path, setPath] = useState([]); // Initialize path state
  const [error, setError] = useState(null); // State to track errors

  // Dynamically determine the backend URL based on environment
  const apiUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_BACKEND_URL
    : import.meta.env.VITE_BACKEND_URL;

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
        setError(`Failed to fetch locations: ${error.response.data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      setError('No response from server. Please check your internet connection.');
    } else {
      setError(`Unexpected error: ${error.message}`);
    }
    console.error('Error fetching locations:', error);
  };

  // Function to fetch saved locations and sessions from the server
  const fetchLocationsAndSessions = async () => {
    const token = getToken();
    if (!token) {
      setError('User not logged in. Please log in to see your locations.');
      return;
    }
  
    try {
      // Fetch saved locations (from TrackLocation functionality)
      const locationResponse = await axios.get(`${apiUrl}/api/location`, {
        headers: { 'x-auth-token': token },
      });
  
      // Fetch session movements (from TrackMovement functionality)
      const sessionResponse = await axios.get(`${apiUrl}/api/session`, {
        headers: { 'x-auth-token': token },
      });
  
      // Log the session data to ensure it's coming through properly
      console.log('Session data:', sessionResponse.data);
  
      const locationsData = Array.isArray(locationResponse.data) ? locationResponse.data : [];
      const sessionsData = Array.isArray(sessionResponse.data) ? sessionResponse.data : [];
  
      // Process session data directly (since session data is already an array of movements)
      const sessionMarkers = sessionsData.map(movement => ({
        lat: movement.lat,
        lng: movement.lng,
        notes: movement.notes || 'Session movement',
        _id: movement._id || `session-${movement.timestamp}`,
      }));
  
      console.log('Session Markers:', sessionMarkers); // Log to ensure movements are processed
  
      // Combine both location markers (from TrackLocation) and session movement markers (from TrackMovement)
      const combinedMarkers = [...locationsData, ...sessionMarkers];
      setMarkers(combinedMarkers); // Set markers to display both saved locations and movements
  
      // Create path coordinates from sessionMarkers to draw polyline for session movements
      const pathCoordinates = sessionMarkers.map(marker => [marker.lat, marker.lng]);
      setPath(pathCoordinates);  // Set the polyline path for movements
  
    } catch (error) {
      handleError(error);
    }
  };

  // Fetch locations and sessions when the component mounts
  useEffect(() => {
    fetchLocationsAndSessions();
  }, []); // Only run on initial render

  // Log markers state after they are set
  useEffect(() => {
    console.log('Markers state:', markers); // Check if the markers state is correctly populated
  }, [markers]);

  // Log path state after it is set
  useEffect(() => {
    console.log('Path state:', path); // Check if the path state is correctly populated
  }, [path]);

  // Add new marker when a new location is passed in
  useEffect(() => {
    if (newLocation && newLocation._id && !markers.some(marker => marker._id === newLocation._id)) {
      setMarkers(prevMarkers => [...prevMarkers, newLocation]); // Add the new location as a marker
    }
  }, [newLocation, markers]);

  // Handle marker drag end event to update the marker's position
  const handleMarkerDragEnd = async (event, index) => {
    const newPosition = event.target.getLatLng(); // Get new marker position
    const token = getToken(); // Get JWT token from localStorage

    const locationId = markers[index]._id; // Get the location's _id from markers

    if (!locationId) {
      setError('Unable to update location: locationId is missing.');
      return;
    }

    // Update the marker's position in the state
    setMarkers(prevMarkers => {
      const updatedMarkers = [...prevMarkers];
      updatedMarkers[index] = { ...updatedMarkers[index], lat: newPosition.lat, lng: newPosition.lng };
      return updatedMarkers;
    });

    // Send the updated coordinates to the backend
    try {
      await axios.put(`${apiUrl}/api/location/${locationId}`, {
        newLat: newPosition.lat,
        newLng: newPosition.lng,
      }, {
        headers: { 'x-auth-token': token },
      });
      console.log(`Location updated successfully to: `, newPosition);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteMarker = async (index) => {
    const token = getToken(); // Get JWT token from localStorage
    const { _id } = markers[index]; // Get the location's _id

    // Send a DELETE request to the backend to remove the marker
    try {
      await axios.delete(`${apiUrl}/api/location`, {
        headers: { 'x-auth-token': token },
        data: { locationId: _id },
      });

      // Remove the marker from the state after successful deletion
      setMarkers(prevMarkers => prevMarkers.filter((_, i) => i !== index));
      console.log(`Marker with id (${_id}) deleted successfully.`);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <MapContainer center={[45.6280, -122.6739]} zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA"
      />
      
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        opacity={0.4}
      />
  
      {/* Display markers for saved locations and movements */}
      {Array.isArray(markers) && markers.length > 0 && markers.map((marker, index) => (
        <Marker
          key={marker._id || index}
          position={[marker.lat, marker.lng]}
          draggable={true}
          eventHandlers={{ dragend: (event) => handleMarkerDragEnd(event, index) }}
        >
          <Popup>
            {marker.notes || 'No notes for this location'}
            <br />
            <button onClick={() => handleDeleteMarker(index)}>Delete Marker</button>
          </Popup>
        </Marker>
      ))}
  
      {/* Display a polyline for the path movements */}
      {Array.isArray(path) && path.length > 1 && <Polyline positions={path} color="blue" />}
  
      {/* Display markers for each movement point in the path */}
      {Array.isArray(path) && path.length > 0 && path.map((point, index) => (
        <Marker key={index} position={point}>
          <Popup>Movement Point {index + 1}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;