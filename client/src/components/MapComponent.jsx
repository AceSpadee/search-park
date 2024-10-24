import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import "../styling/MapComponent.css";
import L from 'leaflet';
import CustomMarkerCluster from './CustomMarkerCluster';

import markerIconRed from '../assets/red-icon.png';
import markerShadow from '../assets/marker-shadow.png';

// Set a red marker icon for locations
const RedIcon = L.icon({
  iconUrl: markerIconRed,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Set a blue marker icon for movements
const BlueIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapComponent = ({ newLocation, isNewSession, currentSessionId, onSessionReset }) => {
  const [markers, setMarkers] = useState([]); 
  const [path, setPath] = useState([]); 
  const [error, setError] = useState(null);
  const pathRef = useRef([]);

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
      const locationResponse = await axios.get(`${apiUrl}/api/location`, {
        headers: { 'x-auth-token': token },
      });

      const sessionResponse = await axios.get(`${apiUrl}/api/session`, {
        headers: { 'x-auth-token': token },
      });

      const locationsData = Array.isArray(locationResponse.data) ? locationResponse.data : [];
      const sessionsData = Array.isArray(sessionResponse.data) ? sessionResponse.data : [];

      const sessionMarkers = sessionsData.map(movement => ({
        lat: movement.lat,
        lng: movement.lng,
        isMovement: true,
        _id: movement._id || `session-${movement.timestamp}`,
      }));

      const locationMarkers = locationsData.map(loc => ({
        ...loc,
        isMovement: false,
      }));

      setMarkers([...locationMarkers, ...sessionMarkers]);
      pathRef.current = sessionMarkers.map(marker => [marker.lat, marker.lng]);
      setPath(pathRef.current); // Set path to match ref
    } catch (error) {
      handleError(error);
    }
  };

  // Fetch movements for a specific session
   const fetchMovementsForSession = async (sessionId) => {
    const token = getToken();
    try {
      const response = await axios.get(`${apiUrl}/api/session/${sessionId}`, {
        headers: { 'x-auth-token': token },
      });
      const movements = response.data || [];

      const sessionMarkers = movements.map(movement => ({
        lat: movement.lat,
        lng: movement.lng,
        isMovement: true,
        _id: movement._id,
      }));

      setMarkers(sessionMarkers);
      pathRef.current = movements.map(movement => [movement.lat, movement.lng]);
      setPath(pathRef.current); 
    } catch (error) {
      handleError(error);
    }
  };

  // Clear path when a new session starts
  useEffect(() => {
    if (isNewSession && currentSessionId) {
      pathRef.current = [];
      setPath([]); 
      fetchMovementsForSession(currentSessionId); 
      if (onSessionReset) onSessionReset();
    }
  }, [isNewSession, currentSessionId, onSessionReset]);


  // Fetch locations and sessions when the component mounts
  useEffect(() => {
    fetchLocationsAndSessions();
  }, []); // Only run on initial render

  // Add new marker when a new location is passed in
  useEffect(() => {
    if (newLocation && newLocation._id && !markers.some(marker => marker._id === newLocation._id)) {
      const isMovement = newLocation.notes === 'Session movement';
      setMarkers(prevMarkers => [...prevMarkers, { ...newLocation, isMovement }]);

      if (isMovement) {
        pathRef.current = [...pathRef.current, [newLocation.lat, newLocation.lng]];
        setPath([...pathRef.current]); 
      }
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
    const token = getToken(); // Get the JWT token
    const locationId = markers[index]._id;

    try {
      const response = await axios.delete(`${apiUrl}/api/location/${locationId}`, {
        headers: { 'x-auth-token': token },
      });

      if (response.status === 200) {
        setMarkers(prevMarkers => prevMarkers.filter((_, i) => i !== index));
        console.log(`Marker with ID (${locationId}) deleted successfully from the database.`);
      }
    } catch (error) {
      console.error('Error deleting marker:', error);
    }
  };

  return (
    <div className="map-container">
      {error && <div className="alert-danger">{error}</div>}
      <div className="card">
        <div className="card-header">
          <h5>Locations</h5>
        </div>
        <div className="card-body">
          <MapContainer center={[45.6280, -122.6739]} zoom={12} style={{ height: '650px', width: '100%' }} preferCanvas={true}>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA"
            />
            
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
              opacity={0.4}
            />

            {markers.filter(marker => !marker.isMovement).map((marker, index) => (
              <Marker
                key={marker._id || index}
                position={[marker.lat, marker.lng]}
                icon={RedIcon}
                draggable={true}
                eventHandlers={{ dragend: (event) => handleMarkerDragEnd(event, index) }}
              >
                <Popup>
                  {marker.notes || 'No notes for this location'}
                  <br />
                  <button 
                    className="btn btn-danger btn-sm mt-2" 
                    onClick={() => handleDeleteMarker(index)}
                  >
                    Delete Marker
                  </button>
                </Popup>
              </Marker>
            ))}

            <CustomMarkerCluster markers={markers.filter(marker => marker.isMovement)} blueIcon={BlueIcon} />
            {path.length > 1 && <Polyline positions={path} color="blue" />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;