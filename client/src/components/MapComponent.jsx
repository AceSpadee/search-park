import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ locations }) => {
  return (
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

      {/* Render the markers passed as locations */}
      {locations.map((location, index) => (
        <Marker key={index} position={[location.lat, location.lng]}>
          <Popup>
            <h4>Location Note</h4>
            <p>{location.notes || 'No notes for this location'}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;