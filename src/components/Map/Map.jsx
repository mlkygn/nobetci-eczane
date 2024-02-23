import React, { useRef, useEffect, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWxreWduIiwiYSI6ImNsc3V1eWVzYjEzNGMya211Ynhpam81NHcifQ.WKWqa7kqIdE6g2NQjKQK0g";

function Map() {
  const [userLoc, setuserLoc] = useState({
    latitude: 40.1917,
    longitude: 29.0611,
  });
  const [lat, setLat] = useState(userLoc.latitude);
  const [lng, setLng] = useState(userLoc.longitude);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(14);

  function getCurrentLoc() {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
          console.log(position.coords.latitude, position.coords.latitude);
          setuserLoc({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        });
        resolve();
      } else {
        console.log("Geolocation is not available in your browser.");
      }
    });
  }
  const mapInıtal = async () => {
    if (map.current) return; // initialize map only once
    await getCurrentLoc();
    setLat(userLoc.latitude);
    setLng(userLoc.longitude);
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mlkygn/clsuv1q5d003v01qu1tsycp6f",
      center: [lng, lat],
      zoom: zoom,
    });
  };
  useEffect(() => {
    mapInıtal();
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
