import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styling/MapComponent.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Mapbox3DMap = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-122.6739, 45.628],
      zoom: 15,
      pitch: 60,
      bearing: -30,
      antialias: true,
    });

    map.on("load", () => {
      // Add terrain source
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      // Set terrain
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      // Add background layer for ground color
      map.addLayer({
        id: "background",
        type: "background",
        paint: {
          "background-color": "#041526", // Dark blue for ground color
          "background-opacity": 1, // Fully opaque
        },
      });

      // Add custom water layer
      map.addLayer({
        id: "water-effect",
        type: "fill",
        source: "composite",
        "source-layer": "water",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            "#004488", // Deep blue at low zoom levels
            15,
            "#0088FF", // Lighter blue at higher zoom levels
          ],
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            0.6, // More transparent at low zoom levels
            15,
            0.8, // Less transparent at higher zoom levels
          ],
        },
      });

      // Add animated reflections (optional)
      map.addLayer({
        id: "water-reflection",
        type: "raster",
        source: "composite",
        "source-layer": "water",
        paint: {
          "raster-opacity": 0.4,
          "raster-brightness-max": 0.8,
          "raster-brightness-min": 0.4,
        },
      });

      // Add a glowing 3D water effect
      map.addLayer({
        id: "water-glow",
        type: "line",
        source: "composite",
        "source-layer": "waterway",
        paint: {
          "line-color": "#00BFFF", // Bright cyan glow
          "line-width": 4,
          "line-blur": 6, // Blurred edges for glow effect
          "line-opacity": 0.7,
        },
      });

      // Add glowing streets
      map.addLayer({
        id: "glowing-streets",
        type: "line",
        source: "composite",
        "source-layer": "road",
        paint: {
          "line-color": "#cc4a01", // Glowing orange
          "line-width": 6, // Fixed width for glowing streets
          "line-blur": 12, // Adds the glow effect
          "line-opacity": 0.4, // Reduced opacity for more transparency
        },
      });

      // Add road border layer
      map.addLayer({
        id: "road-border",
        type: "line",
        source: "composite",
        "source-layer": "road",
        paint: {
          "line-color": "#cc4a01", // Road border color
          "line-width": 3, // Fixed width for road borders
          "line-opacity": 0.4, // Reduced opacity for transparency
        },
      });

      // Add road inner layer
      map.addLayer({
        id: "road-inner",
        type: "line",
        source: "composite",
        "source-layer": "road",
        paint: {
          "line-color": "#7a0e00", // Inner road color
          "line-width": 2, // Fixed width for inner road
          "line-opacity": 0.3, // Increased transparency
        },
      });

      // Add glowing 3D buildings
      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 7,
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "height"],
            0,
            "#032f34", // Dark blue for shorter buildings
            150,
            "#005260", // Bright blue for taller buildings
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7,
            ["*", ["get", "height"], 1.5], // Exaggerate height by 1.5x at lower zoom levels
            15,
            ["get", "height"], // Normal height at higher zoom levels
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7,
            0,
            15,
            ["get", "min_height"],
          ],
          "fill-extrusion-vertical-gradient": true, // Vertical gradient adds shape
          "fill-extrusion-opacity": 0.6, // Reduced opacity for more transparent buildings
        },
      });

      // Add atmospheric sky effect
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 90.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div className="map-container">
      <div className="card">
        <div className="card-header">
          <h5>3D Map</h5>
        </div>
        <div className="card-body">
          <div
            ref={mapContainerRef}
            style={{
              height: "650px",
              width: "100%",
              position: "relative",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Mapbox3DMap;