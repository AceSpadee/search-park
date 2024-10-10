import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


// Fix the broken marker icon issue
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  shadowSize: [41, 41], // Size of the shadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = () => {
  const [markers, setMarkers] = useState([]);  // Initialize markers as an empty array
  const [error, setError] = useState(null);  // State to track errors

  // Use the deployed backend URL from environment variables
  const apiUrl = import.meta.env.VITE_BACKEND_URL;  // For Vite
  // const apiUrl = process.env.REACT_APP_BACKEND_URL;  // For Create React App

  
  // Fetch locations from the backend when the component loads
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');  // Get JWT token from localStorage
        if (!token) {
          setError('User not logged in. Please log in to view locations.');
          return;
        }

        // Make a GET request to fetch the user's saved locations
        const response = await axios.get(`${apiUrl}/api/location`, {
          headers: {
            'x-auth-token': token,  // Send the JWT token in the request header
          },
        });

        setMarkers(response.data);  // Set the fetched locations as markers
      } catch (error) {
        // Handle specific Axios errors
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
      }
    };

    fetchLocations();  // Fetch locations on component mount
  }, [apiUrl]);

  // Handle the drag end event to update the marker's position
  const handleMarkerDragEnd = (event, index) => {
    const newPosition = event.target.getLatLng();  // Get new marker position
    const updatedMarkers = [...markers];  // Create a copy of the markers
    updatedMarkers[index] = { ...updatedMarkers[index], lat: newPosition.lat, lng: newPosition.lng };  // Update the marker's lat/lng
    setMarkers(updatedMarkers);  // Update the state with the new marker position
    console.log(`Marker ${index} moved to: `, newPosition);  // Log new position
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Display error message if exists */}
      
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

        {/* Render the markers fetched from the backend */}
        {markers.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            draggable={true}  // Enable marker dragging
            eventHandlers={{
              dragend: (event) => handleMarkerDragEnd(event, index),  // Handle drag end event
            }}
          >
            <Popup>
              <h4>Location Note</h4>
              <p>{location.notes || 'No notes for this location'}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;