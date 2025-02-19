import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import MapComponent from '../components/MapComponent';
import '../styling/GroupMap.css';

const GroupMap = () => {
  const [groupSessions, setGroupSessions] = useState([]);
  const [error, setError] = useState(null);

  const fetchGroupSessions = async () => {
    try {
      const response = await api.get('/api/session/all');
      if (response.data && Array.isArray(response.data)) {
        setGroupSessions(
          response.data.map((session) => ({
            path: session.movements.map((movement) => [movement.lat, movement.lng]),
            color: session.user.pathColor,
            userName: `${session.user.firstName} ${session.user.lastName}`,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching group sessions:', error);
      setError('Failed to fetch group sessions.');
    }
  };

  useEffect(() => {
    fetchGroupSessions();
  }, []);

  return (
    <div className="group-map-page"> {/* Main container */}
      <h2>Group Map</h2>
      {error && <p className="error">{error}</p>}
      <div className="map-wrapper"> {/* Wrapper for the map */}
        <MapComponent allSessionPaths={groupSessions} />
      </div>
    </div>
  );
};

export default GroupMap;