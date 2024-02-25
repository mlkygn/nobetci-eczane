import { useState } from "react";
import "./App.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Map from "./components/Map/Map";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Container className="py-5">
        <Row>
          <Col sm={4}>
            <h1 className="mb-4">Nöbetçi Eczaneler</h1>
            <Sidebar />
          </Col>
          <Col sm={8}>
            <Map />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
