import React, { useState } from 'react';
import TrackLocation from '../components/TrackLocation';
import MapComponent from '../components/MapComponent';

const LocationApp = () => {
  const [locations, setLocations] = useState([]);

  // Function to add a new location
  const addLocation = (newLocation) => {
    setLocations([...locations, newLocation]);  // Add the new location to the array
  };

  return (
    <div>
      <h1>Track My Location</h1>
      {/* Pass the addLocation function to TrackLocation so it can update the map */}
      <TrackLocation addLocation={addLocation} />
      
      {/* Pass the locations to MapComponent to display them */}
      <MapComponent locations={locations} />
    </div>
  );
};

export default LocationApp;