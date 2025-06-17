import { useState, useEffect, useRef } from "react";
import { getDistance } from "geolib";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import Sidebar from "../Sidebar/Sidebar";
import Map from "../Map/Map";
import ErrorMessage from "../Error/ErrorMessage";

function Main() {
  const mapRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [dataPharmacy, setdataPharmacy] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: "",
    sortField: "pharmacyName", // name, district, address
    sortOrder: "asc", // asc or desc
  });
  const [loadInıtialData, setloadInıtialData] = useState(false);
  const [userLoc, setuserLoc] = useState({
    latitude: null,
    longitude: null,
  });
  const prevLocRef = useRef(null);

  useEffect(() => {
    if (!loadInıtialData && dataPharmacy.length > 0) {
      setFilteredList(dataPharmacy);
      setloadInıtialData(true);
    }
  }, [loadInıtialData, dataPharmacy]);

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
            authorization:
              "Bearer An5wBqTNqRZ9gKgtfBeJtulcKs4A6JmKVkSv16s7oVkR8vKh7dHje2NFMw6E",
          },
    })
      .then((response) => response.json())
      .then(async (result) => {
        if (!result.status || result.status !== "success") {
          return setErrorText((prev) => [
            ...prev,
            "Eczane verileri yüklenirken hata oluştu. Lütfen tekrar deneyin.",
          ]);
        }
        if (result.data.length === 0) {
          setErrorText((prev) => [
            ...prev,
            "Bu konum için eczane verisi bulunamadı. Lütfen daha sonra tekrar deneyin.",
          ]);
          setIsLoaded(true);
          return;
        }
        const data = Object.values(result.data);
        setdataPharmacy(data);
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("API çağrısında hata:", error);
        setErrorText((prev) => [
          ...prev,
          "Eczane verileri yüklenirken hata oluştu. Lütfen tekrar deneyin.",
        ]);
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    const result = dataPharmacy
      .filter((item) => {
        const term = filters.searchTerm.toLowerCase();
        return (
          item.pharmacyName.toLowerCase().includes(term) ||
          item.district.toLowerCase().includes(term) ||
          item.address.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const fieldA = a[filters.sortField];
        const fieldB = b[filters.sortField];

        if (typeof fieldA === "string" && typeof fieldB === "string") {
          return filters.sortOrder === "asc"
            ? fieldA.toLowerCase().localeCompare(fieldB.toLowerCase())
            : fieldB.toLowerCase().localeCompare(fieldA.toLowerCase());
        }

        if (typeof fieldA === "number" && typeof fieldB === "number") {
          return filters.sortOrder === "asc"
            ? fieldA - fieldB
            : fieldB - fieldA;
        }

        return 0;
      });
    console.log("Filtered List:", result);
    setFilteredList(result);
  }, [filters, dataPharmacy]);

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
        prevLocRef.current = initialLoc;
        setuserLoc(initialLoc);
      },
      (error) => {
        console.error("İlk konum alınamadı:", error.message);
        setErrorText((prev) => [...prev, "İlk konum alınamadı."]);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
    // Sonraki konum değişikliklerini izle
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
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
        setErrorText((prev) => [...prev, "Konum Alınırken bir hata oluştu."]);
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
      const distance = getDistance(userLoc, {
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
      });
      return { ...pharmacy, distance };
    });

    setdataPharmacy(updatedList);
  }, [userLoc]);
  const handleSortChange = (e) => {
    const field = e.target.value;
    const order =
      e.target.options[e.target.selectedIndex].getAttribute("data-order");

    setFilters((prev) => ({
      ...prev,
      sortField: field,
      sortOrder: order,
    }));
  };
  return (
    <main>
      {errorText && errorText.length > 0 && (
        <ErrorMessage
          messages={errorText}
          onRetry={() => window.location.reload()}
        />
      )}
      <Container className="py-md-5 py-2">
        <Row className="mb-md-4 mb-2">
          <Col>
            <h1>Nöbetçi Eczaneler</h1>
          </Col>
          <Col>
            <Form.Select onChange={handleSortChange}>
              <option value="pharmacyName" data-order="asc">
                İsme göre artan
              </option>
              <option value="pharmacyName" data-order="desc">
                İsme göre azalan
              </option>
              {userLoc.latitude && userLoc.longitude && (
                <option value="distance" data-order="asc">
                  Mesafeye göre azalan
                </option>
              )}
            </Form.Select>
          </Col>
        </Row>
        <Row className="g-3">
          <Col sm={4}>
            <Sidebar
              filters={filters}
              setFilters={setFilters}
              filteredList={filteredList}
              flyTo={mapRef?.current?.flyTo}
              isLoaded={isLoaded}
            />
          </Col>
          <Col sm={8}>
            <Map ref={mapRef} userLoc={userLoc} filteredList={filteredList} />
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default Main;
