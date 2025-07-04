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
import * as turf from "@turf/turf";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWxreWduIiwiYSI6ImNsc3V1eWVzYjEzNGMya211Ynhpam81NHcifQ.WKWqa7kqIdE6g2NQjKQK0g";

const Map = forwardRef(function Map(
  { selectPharmacy, selectedPharmacy, userLoc, filteredList, filters },
  ref
) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarkerRef = useRef(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [zoom] = useState(15);

  useImperativeHandle(ref, () => ({
    flyTo,
  }));

  // flyTo fonksiyonu
  function flyTo([lng, lat]) {
    if (!map.current) return;
    map.current.flyTo({
      center: [lng, lat],
      zoom: zoom,
      essential: true,
    });
  }

  // Konumuma Git kontrolü
  const createLocateControl = useCallback(
    () => ({
      onAdd() {
        const btn = document.createElement("button");
        btn.className = "mapboxgl-ctrl-icon geolocate-btn";
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 0c17.7 0 32 14.3 32 32l0 34.7C368.4 80.1 431.9 143.6 445.3 224l34.7 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-34.7 0C431.9 368.4 368.4 431.9 288 445.3l0 34.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.7C143.6 431.9 80.1 368.4 66.7 288L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l34.7 0C80.1 143.6 143.6 80.1 224 66.7L224 32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>';
        btn.title = "Konumuma Git";

        btn.onclick = () => {
          const marker = userMarkerRef.current;
          if (marker) {
            const lngLat = marker.getLngLat();
            map.current.flyTo({
              center: [lngLat.lng, lngLat.lat],
              zoom: zoom,
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
    }),
    []
  );

  // Haritayı oluştur ve başlat
  useEffect(() => {
    if (map.current || !userLoc.latitude || !userLoc.longitude) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mlkygn/clt1z11d300j201qugd9za6d1",
      center: [userLoc.longitude, userLoc.latitude],
      zoom: 6,
    });

    map.current.on("load", () => {
      // Kullanıcı marker'ı oluştur
      const userMarker = new mapboxgl.Marker({ color: "#7893cf" })
        .setLngLat([userLoc.longitude, userLoc.latitude])
        .addTo(map.current);
      userMarkerRef.current = userMarker;

      // Konumuma Git butonunu ekle
      map.current.addControl(createLocateControl());

      // Create a circle polygon using Turf.js
      const circle = turf.circle(
        [userLoc.longitude, userLoc.latitude],
        filters.maxDistance,
        { units: "kilometers" }
      );

      // Add the circle polygon as a source
      map.current.addSource("circle", {
        type: "geojson",
        data: circle,
      });

      // Add a fill layer to display the circle
      map.current.addLayer({
        id: "circle-fill",
        type: "fill",
        source: "circle",
        paint: {
          "fill-color": "#088",
          "fill-opacity": 0.3,
        },
      });
      // İlk eczane marker'larını ayarla
      setMarkers();
      setIsMapLoaded(true);
      map.current.resize();
    });
  }, [userLoc, zoom, createLocateControl]);

  // userLoc değiştiğinde marker'ı güncelle
  useEffect(() => {
    if (!isMapLoaded || !userLoc.latitude || !userLoc.longitude) return;

    const newCoords = [userLoc.longitude, userLoc.latitude];
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(newCoords);
    }
  }, [userLoc, isMapLoaded]);

  // userLoc veya mesafe filteresi değiştiğinde circle güncelle
  useEffect(() => {
    if (!map.current || !map.current.getSource("circle")) return;
    const center = [userLoc.longitude, userLoc.latitude];
    const circle = turf.circle(center, filters.maxDistance, {
      units: "kilometers",
    });
    map.current.getSource("circle").setData(circle);
  }, [userLoc, filters.maxDistance]);

  useEffect(() => {
    if (!map.current || !map.current.getSource("circle")) return;
    const center = [userLoc.longitude, userLoc.latitude];
    const circle = turf.circle(center, filters.maxDistance, {
      units: "kilometers",
    });
    const bboxCor = turf.bbox(circle);
    const bbox = [bboxCor.slice(0, 2), bboxCor.slice(2, 4)];
    map.current.fitBounds(bbox, {
      padding: { top: 10, bottom: 25, left: 15, right: 5 },
    });
  }, [filters.maxDistance]);

  const getPharmacyGeoJsonData = useCallback(() => {
    return {
      type: "FeatureCollection",
      features: filteredList.map((p) => ({
        type: "Feature",
        id: p.pharmacyID,
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          title: p.pharmacyName,
          selected: selectedPharmacy?.pharmacyID === p.pharmacyID || false,
        },
      })),
    };
  }, [filteredList, selectedPharmacy]);

  // Eczane marker'larını güncelle
  const setMarkers = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    const geoJsonData = getPharmacyGeoJsonData();

    const source = map.current.getSource("pharmacies");
    if (source) {
      source.setData(geoJsonData);
    } else {
      map.current.loadImage("/pharmacy-marker.png", (error1, defaultImg) => {
        if (error1) throw error1;

        map.current.loadImage(
          "/pharmacy-marker-selected.png",
          (error2, selectedImg) => {
            if (error2) throw error2;

            map.current.addImage("marker-default", defaultImg);
            map.current.addImage("marker-selected", selectedImg);

            map.current.addSource("pharmacies", {
              type: "geojson",
              data: geoJsonData,
            });
            map.current.addLayer({
              id: "pharmacy-markers",
              type: "symbol",
              visibility: "visible",
              source: "pharmacies",
              layout: {
                "icon-image": [
                  "case",
                  ["==", ["get", "selected"], true],
                  "marker-selected", // Use this icon when selected
                  "marker-default", // Use this icon otherwise
                ],
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
                "icon-size": 1,
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
            setTimeout(() => {
              map.current.on(
                "click",
                ["pharmacy-markers", "pharmacy-labels"],
                (e) => {
                  if (e.features.length === 0) return;
                  // Select the clicked feature
                  const feature = e.features[0];
                  selectPharmacy(feature.id);
                }
              );
            }, 300);
          }
        );
      });
    }
  }, [filteredList, isMapLoaded]);

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    const geoJsonData = getPharmacyGeoJsonData();
    const source = map.current.getSource("pharmacies");
    if (source) {
      source.setData(geoJsonData);
    }
    if (!selectedPharmacy) return;
    flyTo([selectedPharmacy.longitude, selectedPharmacy.latitude]);
  }, [selectedPharmacy]);

  // filteredList değiştiğinde marker'ları güncelle
  useEffect(() => {
    map.current && map.current.resize();
    setMarkers();
  }, [filteredList, isMapLoaded, setMarkers]);
  return (
    <>
      <div ref={mapContainer} className="map-container">
        {!isMapLoaded && (
          <div className="spinner">
            <Spinner animation="border" variant="secondary" />
          </div>
        )}
      </div>
    </>
  );
});

export default Map;
