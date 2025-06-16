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
  const [errorText, setErrorText] = useState(null);
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
    fetch(
      "https://www.nosyapi.com/apiv2/service/pharmacies-on-duty?city=Erzincan",
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          authorization:
            "Bearer rjRbArPZQRDSOfmlUp9flTXe33f11mUEFZ3BwaFDRltGwjuPaiJzILoQme6P",
        },
      }
    )
      .then((response) => response.json())
      .then(async (result) => {
        if (!result.status || result.status !== "success") {
          return setErrorText(
            "Eczane verileri yüklenirken hata oluştu. Lütfen tekrar deneyin."
          );
        }
        if (result.data.length === 0) {
          setErrorText(
            "Bu konum için eczane verisi bulunamadı. Lütfen daha sonra tekrar deneyin."
          );
          setIsLoaded(true);
          return;
        }
        const data = Object.values(result.data);
        setdataPharmacy(data);
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("API çağrısında hata:", error);
        setErrorText(
          "Eczane verileri yüklenirken hata oluştu. Lütfen tekrar deneyin."
        );
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

    setFilteredList(result);
  }, [filters, dataPharmacy]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Tarayıcı konum servisini desteklemiyor.");
      return;
    }
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
          return;
        }
        prevLocRef.current = currentLoc;
        setuserLoc(currentLoc);
        if (dataPharmacy.length > 0) {
          const updatedList = dataPharmacy.map((pharmacy) => {
            const distance = getDistance(
              currentLoc,
              {
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              },
              1 // 1 meter accuracy
            );
            return { ...pharmacy, distance };
          });
          setdataPharmacy(updatedList);
          console.log("datas:", updatedList);
        }
      },
      (error) => {
        console.error("Konum alınamadı:", error.message);
        setErrorText(error.message || "Konum Alınırken bir hata oluştu.");
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
  }, [dataPharmacy]);

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
      {errorText && (
        <ErrorMessage
          message={errorText}
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
