import React, { useState, useEffect } from 'react';

const Drawings = ({ userId }) => {
  const [drawings, setDrawings] = useState([]);

  // Fetch drawings from the backend
  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        const response = await fetch(`/api/drawings/${userId}`);
        const data = await response.json();
        setDrawings(data);
      } catch (error) {
        console.error('Error fetching drawings:', error);
      }
    };

    fetchDrawings();
  }, [userId]);

  return (
    <div>
      <h1>Your Drawings</h1>
      <ul>
        {drawings.map((drawing) => (
          <li key={drawing._id}>
            <strong>Location:</strong> {drawing.majorLocation.name} - {drawing.majorLocation.coordinates.lat}, {drawing.majorLocation.coordinates.lon}
            <br />
            <strong>Drawings:</strong> {drawing.drawings.length} shapes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Drawings;