import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';  // Import Leaflet Draw JS

const DrawingMap = () => {
  const mapRef = useRef(null);  // Use a ref to store the map instance
  const [markerInput, setMarkerInput] = useState(null); // State to hold the floating input for the marker

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([40.7128, -74.0060], 13); // Centered at New York City
      mapRef.current = map;

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        opacity: 0.4,  // Make it semi-transparent so it blends with satellite images
      }).addTo(map);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
        },
        draw: {
          polyline: {
            shapeOptions: {
              color: 'purple',  // Set the line color to red
              weight: 5,      // Set the line thickness (optional)
              opacity: 0.8,   // Set the line opacity (optional)
            }
          },
          polygon: false,
          circle: true,   // Enable circle creation
          marker: true,   // Enable marker creation
          rectangle: false,
        },
      });

      map.addControl(drawControl);

      // Handle the creation of a new drawing (marker, polyline, or circle)
      map.on(L.Draw.Event.CREATED, (event) => {
        const layer = event.layer;
        drawnItems.addLayer(layer);  // Add any drawn layer to the map

        // Only show the input for markers
        if (event.layerType === 'marker') {
          showMarkerInput(layer); // Show the floating input for the marker
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove(); // Clean up the map
        mapRef.current = null;
      }
    };
  }, []);

  // Function to show the input field for naming the marker
  const showMarkerInput = (layer) => {
    // Get the marker's position on the map in pixels
    const markerPosition = mapRef.current.latLngToContainerPoint(layer.getLatLng());

    // Create the input element dynamically
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Enter marker name';
    inputElement.style.position = 'absolute';
    inputElement.style.left = `${markerPosition.x}px`;
    inputElement.style.top = `${markerPosition.y}px`;
    inputElement.style.zIndex = 1000;
    inputElement.style.padding = '5px';
    inputElement.style.border = '1px solid #ccc';
    inputElement.style.borderRadius = '4px';

    // Append the input element to the map container
    mapRef.current.getContainer().appendChild(inputElement);

    // Handle saving the marker name
    const saveMarkerName = () => {
      const markerName = inputElement.value;
      if (markerName) {
        layer.bindPopup(`<b>${markerName}</b>`).openPopup(); // Set the marker name in a popup
      }
      inputElement.remove(); // Remove the input element after saving
    };

    // Add event listeners for saving on Enter or blur
    inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveMarkerName(); // Save when Enter is pressed
      }
    });
    inputElement.addEventListener('blur', saveMarkerName); // Save when input loses focus

    // Store the input element in state so it can be cleaned up later
    setMarkerInput(inputElement);
  };

  return <div id="map" style={{ height: '500px', width: '100%' }} />;
};

export default DrawingMap;