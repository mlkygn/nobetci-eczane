import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Spinner from "react-bootstrap/Spinner";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWxreWduIiwiYSI6ImNsc3V1eWVzYjEzNGMya211Ynhpam81NHcifQ.WKWqa7kqIdE6g2NQjKQK0g";

const Map = forwardRef(function Map({ dataPharmacy }, ref) {
  useImperativeHandle(ref, () => {
    return {
      flyTo: flyTo,
    };
  });
  const [userLoc, setuserLoc] = useState({
    latitude: null,
    longitude: null,
  });
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(13);

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
    new mapboxgl.Marker({ color: "#7893cf" })
      .setLngLat([lng, lat])
      .addTo(map.current);
    dataPharmacy.map((c, i) => {
      const el = document.createElement("div");
      el.className = "pharmacy-marker";
      new mapboxgl.Marker(el).setLngLat([c.boylam, c.enlem]).addTo(map.current);
    });
  }
  function flyTo([lng, lat]) {
    map.current.flyTo({
      center: [lng, lat],
      essential: true, // this animation is considered essential with respect to prefers-reduced-motion
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
        style: "mapbox://styles/mlkygn/clt1z11d300j201qugd9za6d1",
        center: [lng, lat],
        zoom: zoom,
      });
      map.current.on("load", () => {
        setMarkers();
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
  return (
    <>
      <div>
        <div ref={mapContainer} className="map-container">
          <Spinner animation="border" variant="secondary" />
        </div>
      </div>
    </>
  );
});
export default Map;
