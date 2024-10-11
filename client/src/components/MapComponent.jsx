import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

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
  const [markers, setMarkers] = useState([]);  // Initialize markers as an empty array
  const [error, setError] = useState(null);  // State to track errors

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

  // Fetch locations from the backend when the component loads
  const fetchLocations = async () => {
    const token = getToken();  // Get JWT token from localStorage
    if (!token) {
      setError('User not logged in. Please log in to view locations.');
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/api/location`, {
        headers: { 'x-auth-token': token },
      });
      setMarkers(response.data);  // Set the fetched locations as markers
    } catch (error) {
      handleError(error);
    }
  };

  // Fetch locations when the component mounts
  useEffect(() => {
    fetchLocations();
  }, [apiUrl]);

  // Add new marker when a new location is passed in
  useEffect(() => {
    if (newLocation) {
      setMarkers((prevMarkers) => [...prevMarkers, newLocation]);  // Add the new location dynamically
    }
  }, [newLocation]);

  // Handle marker drag end event to update the marker's position
  const handleMarkerDragEnd = (event, index) => {
    const newPosition = event.target.getLatLng();  // Get new marker position
    setMarkers((prevMarkers) => {
      const updatedMarkers = [...prevMarkers];
      updatedMarkers[index] = { ...updatedMarkers[index], lat: newPosition.lat, lng: newPosition.lng };
      return updatedMarkers;
    });
    console.log(`Marker ${index} moved to: `, newPosition);  // Log new position
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <MapContainer center={[45.6280, -122.6739]} zoom={12} style={{ height: '400px', width: '100%' }}>
        {/* Esri Satellite Imagery as the base layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA"
        />

        {/* OpenStreetMap roads and labels as a semi-transparent overlay */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors" 
          opacity={0.4}
        />

        {/* Render markers */}
        {markers.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            draggable={true}
            eventHandlers={{ dragend: (event) => handleMarkerDragEnd(event, index) }}
          >
            <Popup>
              <h4>Location Note</h4>
              {location.notes || 'No notes for this location'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;