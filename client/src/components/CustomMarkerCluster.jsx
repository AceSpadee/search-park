import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useEffect } from 'react';

const CustomMarkerCluster = ({ markers, blueIcon }) => {
  const map = useMap();

  useEffect(() => {
    const markerClusterGroup = L.markerClusterGroup({
      // Customize the cluster icon to appear as a single blue marker
      iconCreateFunction: (cluster) => {
        return L.divIcon({
          html: `<img src="${blueIcon.options.iconUrl}" style="width: 25px; height: 41px;" alt="cluster-icon" />`,
          className: 'custom-cluster-icon', // Add a class for custom styling
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });
      },
    });

    markers.forEach(marker => {
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: blueIcon });
      markerClusterGroup.addLayer(leafletMarker);
    });

    map.addLayer(markerClusterGroup);

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [map, markers, blueIcon]);

  return null;
};

export default CustomMarkerCluster;