import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import "../styling/MapComponent.css";
import L from 'leaflet';

import markerIconRed from '../assets/red-icon.png';
import markerShadow from '../assets/marker-shadow.png';

const RedIcon = L.icon({
  iconUrl: markerIconRed,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CurrentPositionIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34],
  shadowSize: [45, 45],
});

const MapComponent = ({ currentPosition, sessionPaths = [], savedLocations = [], onDeleteLocation, onDragMarker }) => {

  console.log('Session paths passed to MapComponent:', sessionPaths);
  
  return (
    <div className="map-container">
      <div className="card">
        <div className="card-header">
          <h5>Locations</h5>
        </div>
        <div className="card-body">
          <MapContainer center={[45.628, -122.6739]} zoom={12} style={{ height: '650px', width: '100%' }} preferCanvas={true}>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA"
            />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
              opacity={0.4}
            />

            {/* Render saved locations */}
            {Array.isArray(savedLocations) && savedLocations.map((location, index) => (
              <Marker
                key={location._id}
                position={[location.lat, location.lng]}
                icon={RedIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (event) => onDragMarker(event, index),
                }}
              >
                <Popup>
                  {location.notes || 'No notes for this location'}
                  <br />
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => onDeleteLocation(index)}
                  >
                    Delete Marker
                  </button>
                </Popup>
              </Marker>
            ))}

            {/* Render user's current position */}
            {currentPosition && (
              <Marker position={currentPosition} icon={CurrentPositionIcon}>
                <Popup>
                  Current Position: Lat {currentPosition[0]}, Lng {currentPosition[1]}
                </Popup>
              </Marker>
            )}

            {/* Render polylines for session paths */}
            {Array.isArray(sessionPaths) && sessionPaths.map((sessionPath, index) => (
              <Polyline
                key={`session-${index}`}
                positions={sessionPath}
                color="blue"
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;