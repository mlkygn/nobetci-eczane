import React, { useState, useEffect, useRef } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Sidebar from "../Sidebar/Sidebar";
import Map from "../Map/Map";

function Main() {
  const mapRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [dataPharmacy, setdataPharmacy] = useState([]);

  useEffect(() => {
    fetch(
      "https://cors-anywhere.herokuapp.com/https://www.beo.org.tr/nobet-belediye"
    )
      .then((res) => res.json())
      .then(
        (result) => {
          setdataPharmacy(Object.values(result));
          setIsLoaded(true);
        },
        (error) => {
          setIsLoaded(true);
        }
      );
  }, []);

  return (
    <main>
      <Container className="py-5">
        <Row>
          <Col sm={4}>
            <h1 className="mb-4">Nöbetçi Eczaneler</h1>
            <Sidebar
              dataPharmacy={dataPharmacy}
              flyTo={mapRef?.current?.flyTo}
              isLoaded={isLoaded}
            />
          </Col>
          <Col sm={8}>
            <Map ref={mapRef} dataPharmacy={dataPharmacy} />
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default Main;
