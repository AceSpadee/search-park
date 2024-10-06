import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ locations }) => (
  <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {locations.map((loc, idx) => (
      <Marker key={idx} position={[loc.lat, loc.lng]}></Marker>
    ))}
  </MapContainer>
);