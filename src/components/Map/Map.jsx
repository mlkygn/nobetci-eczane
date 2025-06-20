import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import Spinner from "react-bootstrap/Spinner";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWxreWduIiwiYSI6ImNsc3V1eWVzYjEzNGMya211Ynhpam81NHcifQ.WKWqa7kqIdE6g2NQjKQK0g";

const Map = forwardRef(function Map({ userLoc, filteredList }, ref) {
  useImperativeHandle(ref, () => {
    return {
      flyTo: flyTo,
    };
  });
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarkerRef = useRef(null);
  const [zoom] = useState(15);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Marker'ları ayarlama fonksiyonu (useCallback ile optimize edildi)
  const setMarkers = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // GeoJSON verisini hazırla
    const geoJsonData = {
      type: "FeatureCollection",
      features: filteredList.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          title: p.pharmacyName,
        },
      })),
    };

    // Kaynak zaten varsa güncelle, yoksa yeni kaynak ekle
    const source = map.current.getSource("pharmacies");
    if (source) {
      source.setData(geoJsonData);
    } else {
      map.current.loadImage("/pharmacy-marker.png", (error, image) => {
        if (error) throw error;
        map.current.addImage("custom-marker", image);
        map.current.addSource("pharmacies", {
          type: "geojson",
          data: geoJsonData,
        });
        // Marker katmanı
        map.current.addLayer({
          id: "pharmacy-markers",
          type: "symbol",
          source: "pharmacies",
          layout: {
            "icon-image": "custom-marker",
            "icon-size": 1,
            "icon-allow-overlap": true,
          },
        });
        map.current.addLayer({
          id: "pharmacy-labels",
          type: "symbol",
          source: "pharmacies",
          layout: {
            "text-field": ["get", "title"],
            "text-size": 12,
            "text-offset": [0, 1],
            "text-anchor": "top",
          },
          paint: {
            "text-color": "#3a7bd5",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2,
          },
        });
      });
    }
  }, [filteredList, isMapLoaded]);
  const createLocateControl = (map, marker) => ({
    onAdd() {
      const btn = document.createElement("button");
      btn.className = "mapboxgl-ctrl-icon";
      btn.innerText = "📍";
      btn.title = "Konumuma Git";
      btn.style.cursor = "pointer";
      btn.style.background = "#fff";
      btn.style.border = "none";
      btn.style.padding = "6px";
      btn.style.fontSize = "18px";

      btn.onclick = () => {
        const lngLat = marker?.getLngLat?.();
        if (lngLat) {
          map.flyTo({
            center: [lngLat.lng, lngLat.lat],
            zoom: 14,
            speed: 1.2,
            curve: 1.4,
          });
        } else {
          alert("Konum bilgisi alınamadı.");
        }
      };

      const container = document.createElement("div");
      container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
      container.appendChild(btn);
      return container;
    },
    onRemove() {},
    getDefaultPosition() {
      return "top-right";
    },
  });
  function flyTo([lng, lat]) {
    map.current.flyTo({
      center: [lng, lat],
      minZoom: 10,
      essential: true, // this animation is considered essential with respect to prefers-reduced-motion
    });
  }
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
        setIsMapLoaded(true);
        const userMarker = new mapboxgl.Marker({ color: "#7893cf" })
          .setLngLat([lng, lat])
          .addTo(map.current);
        userMarkerRef.current = userMarker;
        map.current.addControl(createLocateControl(map.current, userMarker));
        // İlk işaretlemeleri ayarla
        setMarkers();
      });
    }
  }, [lat, lng, userLoc, zoom, setMarkers]);
  useEffect(() => {
    if (isMapLoaded) {
      setMarkers();
    }
  }, [filteredList, isMapLoaded, setMarkers]);
  useEffect(() => {
    if (!isMapLoaded || !userLoc.latitude || !userLoc.longitude) return;

    const newCoords = [userLoc.longitude, userLoc.latitude];
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(newCoords);
    } else {
      const marker = new mapboxgl.Marker({ color: "#7893cf" })
        .setLngLat(newCoords)
        .addTo(map.current);
      userMarkerRef.current = marker;

      // Konumuma Git butonunu sadece ilk kez marker oluşunca ekle
      map.current.addControl(createLocateControl(map.current, marker));
    }
  }, [userLoc, isMapLoaded]);
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
