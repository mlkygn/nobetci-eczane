import React, { useRef, useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import mapboxgl from "mapbox-gl";
import Data from "../../Data/data.json";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWxreWduIiwiYSI6ImNsc3V1eWVzYjEzNGMya211Ynhpam81NHcifQ.WKWqa7kqIdE6g2NQjKQK0g";

function Map() {
  const [userLoc, setuserLoc] = useState({
    latitude: null,
    longitude: null,
  });
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(12);

  function getCurrentLoc() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position.coords.latitude, position.coords.latitude);
        setuserLoc({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    } else {
      console.log("Geolocation is not available in your browser.");
    }
  }
  function setMarkers() {
    new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);
    Data.map((c, i) => {
      const el = document.createElement("div");
      el.className = "pharmacy-marker";
      new mapboxgl.Marker(el).setLngLat([c.boylam, c.enlem]).addTo(map.current);
    });
  }
  useEffect(() => {
    getCurrentLoc();
  }, []);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    setLat(userLoc.latitude);
    setLng(userLoc.longitude);
    if (lng && lat) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mlkygn/clsuv1q5d003v01qu1tsycp6f",
        center: [lng, lat],
        zoom: zoom,
      });
      map.on('load', () => {

      setMarkers();
        map.addLayer({
          id: 'terrain-data',
          type: 'line',
          source: {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-terrain-v2'
          },
          'source-layer': 'contour'
        });
      });
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );
    }
  });
  0;
  return (
    <>
      <div>
        <div ref={mapContainer} className="map-container">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    </>
  );
}

export default Map;
