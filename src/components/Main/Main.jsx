import { useState, useEffect, useRef } from "react";
import { getDistance } from "geolib";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Sidebar from "../Sidebar/Sidebar";
import Map from "../Map/Map";
import ErrorMessage from "../Error/ErrorMessage";
import FilterBar from "../FilterBar/FilterBar";
import { usePharmacyFilter } from "../../hooks/usePharmacyFilter";

import { useErrorHandler } from "../../hooks/useErrorHandler";
import { ERROR_CATALOG } from "../../constants/errorCatalog";

import "./filter.css";

function Main() {
  const mapRef = useRef();
  const apiUrl = "An5wBqTNqRZ9gKgtfBeJtulcKs4A6JmKVkSv16s7oVkR8vKh7dHje2NFMw6E";
  const [isLoaded, setIsLoaded] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const { errors, addError, removeError, clearErrors } = useErrorHandler();

  const [dataDistricts, setDataDistricts] = useState([]);
  const [dataPharmacy, setdataPharmacy] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [userLoc, setuserLoc] = useState({
    latitude: null,
    longitude: null,
  });

  const [filters, setFilters] = useState({
    searchTerm: "",
    sortField: "pharmacyName",
    sortOrder: "asc",
    selectedDistrict: "",
    maxDistance: 200,
  });
  const filteredList = usePharmacyFilter(dataPharmacy, filters, userLoc);

  const prevLocRef = useRef(null);

  useEffect(() => {
    const isLocalhost = window.location.hostname === "localhost";
    const url = isLocalhost
      ? "/fake_data.json"
      : "https://www.nosyapi.com/apiv2/service/pharmacies-on-duty?city=Erzincan";
    fetch(url, {
      method: "GET",
      headers: isLocalhost
        ? {}
        : {
            "content-type": "application/json",
            authorization: "Bearer " + apiUrl,
          },
    })
      .then((response) => response.json())
      .then(async (result) => {
        if (!result.status || result.status !== "success") {
          return addError(ERROR_CATALOG.FETCH_PHARMACY_FAIL);
        }
        if (result.data.length === 0) {
          addError(ERROR_CATALOG.NO_PHARMACY_DATA);
          setIsLoaded(true);
          return;
        }
        const data = Object.values(result.data);
        removeError(ERROR_CATALOG.FETCH_PHARMACY_FAIL.id);
        setdataPharmacy(data);
        setIsLoaded(true);
        getDistricts();
      })
      .catch((error) => {
        console.error("API çağrısında hata:", error);
        addError(ERROR_CATALOG.FETCH_PHARMACY_FAIL);
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Tarayıcı konum servisini desteklemiyor.");
      return;
    }
    // İlk konumu al
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const initialLoc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        removeError(ERROR_CATALOG.LOCATION_FAIL.id);
        prevLocRef.current = initialLoc;
        setuserLoc(initialLoc);
      },
      () => {
        addError(ERROR_CATALOG.LOCATION_FAIL);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
    // Sonraki konum değişikliklerini izle
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        removeError(ERROR_CATALOG.LOCATION_FAIL.id);
        const currentLoc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const prevLoc = prevLocRef.current;
        if (
          prevLoc &&
          currentLoc.latitude === prevLoc.latitude &&
          currentLoc.longitude === prevLoc.longitude
        ) {
          return; // aynı konumsa işleme gerek yok
        }

        prevLocRef.current = currentLoc;
        setuserLoc(currentLoc);
      },
      (error) => {
        console.error("Konum alınamadı:", error.message);
        addError(ERROR_CATALOG.LOCATION_FAIL);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 10000,
        timeout: 10000,
      }
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (!userLoc || dataPharmacy.length === 0) return;

    const updatedList = dataPharmacy.map((pharmacy) => {
      const distance = (
        getDistance(userLoc, {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
        }) * 0.001
      ).toFixed(2);
      return { ...pharmacy, distance };
    });

    setdataPharmacy(updatedList);
  }, [userLoc]);

  const getDistricts = () => {
    fetch(
      "https://www.nosyapi.com/apiv2/service/pharmacies-on-duty/cities?city=erzincan",
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + apiUrl,
        },
      }
    )
      .then((response) => response.json())
      .then(async (result) => {
        if (!result.status || result.status !== "success") {
          return addError(ERROR_CATALOG.FETCH_DISTRICT_FAIL);
        }
        if (result.data.length === 0) {
          addError(ERROR_CATALOG.NO_DISTRICT_DATA);
          return;
        }
        removeError(ERROR_CATALOG.NO_DISTRICT_DATA.id);
        removeError(ERROR_CATALOG.FETCH_DISTRICT_FAIL.id);
        const data = Object.values(result.data);
        setDataDistricts(data);
      })
      .catch((error) => {
        console.error("API çağrısında hata:", error);
        addError(ERROR_CATALOG.FETCH_DISTRICT_FAIL);
      });
  };

  const selectPharmacy = (pharmacyID) => {
    if (!pharmacyID) return;
    setSelectedPharmacy((prevSelectedPharmacy) => {
      if (
        prevSelectedPharmacy &&
        prevSelectedPharmacy.pharmacyID === pharmacyID
      ) {
        return null; // Deselect the pharmacy
      }

      const pharmacy = dataPharmacy?.find((p) => p.pharmacyID === pharmacyID);
      return pharmacy || null; // Select the new pharmacy or return null if not found
    });
  };
  return (
    <main>
      {errors.length > 0 && (
        <ErrorMessage
          messages={errors.map((e) => e.message)}
          onRetry={() => window.location.reload()}
        />
      )}
      <Container className="py-md-5 py-2">
        <Row className="g-3">
          <Col xs={12}>
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              dataDistricts={dataDistricts}
              userLoc={userLoc}
            />
          </Col>
          <Col xs={{ span: 12 }} md={{ span: 4 }}>
            <Sidebar
              selectPharmacy={selectPharmacy}
              selectedPharmacy={selectedPharmacy}
              filters={filters}
              setFilters={setFilters}
              filteredList={filteredList}
              isLoaded={isLoaded}
            />
          </Col>
          <Col
            xs={{ span: 12, order: "first" }}
            md={{ span: 8, order: "last" }}
          >
            <Map
              selectPharmacy={selectPharmacy}
              selectedPharmacy={selectedPharmacy}
              ref={mapRef}
              userLoc={userLoc}
              filteredList={filteredList}
              filters={filters}
            />
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default Main;
