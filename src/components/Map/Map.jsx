import React, { useRef, useEffect, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWxreWduIiwiYSI6ImNsc3V1eWVzYjEzNGMya211Ynhpam81NHcifQ.WKWqa7kqIdE6g2NQjKQK0g";

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(29.0530);
  const [lat, setLat] = useState(40.1995);
  const [zoom, setZoom] = useState(16);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mlkygn/clsuv1q5d003v01qu1tsycp6f",
      center: [lng, lat],
      zoom: zoom,
    });
  });

  return (
    <>
      <div>
        <div ref={mapContainer} className="map-container" />
      </div>
    </>
  );
}

export default Map;
