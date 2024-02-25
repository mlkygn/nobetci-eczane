import React from "react";
import Container from "react-bootstrap/Container";
import BootstrapNavbar from "react-bootstrap/Navbar";

import "./navbar.css";

function Navbar() {
  return (
    <>
      <BootstrapNavbar className="py-4" bg="dark" data-bs-theme="dark">
        <Container>
          <BootstrapNavbar.Brand href="#home">
            <img
              alt=""
              src="/logo-white.svg"
              width="auto"
              height="30"
              className="d-inline-block align-top"
            />
          </BootstrapNavbar.Brand>
        </Container>
      </BootstrapNavbar>
    </>
  );
}

export default Navbar;
