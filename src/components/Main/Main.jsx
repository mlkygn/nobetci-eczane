import { useState, useEffect, useRef } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Sidebar from "../Sidebar/Sidebar";
import Map from "../Map/Map";
import ErrorMessage from "../Error/ErrorMessage";

function Main() {
  const mapRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [dataPharmacy, setdataPharmacy] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loadInıtialData, setloadInıtialData] = useState(false);


  useEffect(() => {
    if (!loadInıtialData && dataPharmacy.length > 0) {
      setFilteredList(dataPharmacy);
      setloadInıtialData(true);
    }
  });
  const filterBySearch = (event) => {
    // Access input value
    const query = event.target.value;
    // Create copy of item list
    var updatedList = [...dataPharmacy];
    // Include all elements which includes the search query
    updatedList = updatedList.filter(
      (item) =>
        item.pharmacyName.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        item.district.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        item.address.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
    // Trigger render with updated values
    setFilteredList(updatedList);
  };
  useEffect(() => {
    fetch("https://www.nosyapi.com/apiv2/service/pharmacies-on-duty?city=Erzincani", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "authorization": "Bearer rjRbArPZQRDSOfmlUp9flTXe33f11mUEFZ3BwaFDRltGwjuPaiJzILoQme6P" 
      }
    })
      .then(response => response.json())
      .then(
        async (result) => {
          if(!result.status || result.status !== "success") { 
            return setErrorText("Eczane verileri yüklenirken hata oluştu. Lütfen tekrar deneyin.");
          }
          if (result.data.length === 0) {
            setErrorText("Bu konum için eczane verisi bulunamadı. Lütfen daha sonra tekrar deneyin.");
            setIsLoaded(true);
            return;
            
          }
          const data = Object.values(result.data);
          setdataPharmacy(data);
          setIsLoaded(true);
        },
      )
      .catch(error => {
        console.error("API çağrısında hata:", error);
        setErrorText("Eczane verileri yüklenirken hata oluştu. Lütfen tekrar deneyin.");
        setIsLoaded(true);
      });
  }, []);

  return (
    <main>
      {errorText && (
        <ErrorMessage message={errorText} onRetry={() => window.location.reload()} />
       
      )}
      <Container className="py-5">
            <h1 className="mb-4">Nöbetçi Eczaneler</h1>
        <Row className="g-3">
          <Col sm={8}>
            <Map ref={mapRef} filteredList={filteredList} setErrorText={setErrorText} />
          </Col>
          <Col sm={4}>
            <Sidebar
              filterBySearch={filterBySearch}
              filteredList={filteredList}
              flyTo={mapRef?.current?.flyTo}
              isLoaded={isLoaded}
            />
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default Main;
