import React from "react";
import Container from "react-bootstrap/Container";
import BootstrapNavbar from "react-bootstrap/Navbar";

import "./navbar.css";

function Navbar() {
  return (
    <>
      <BootstrapNavbar bg="dark" data-bs-theme="dark">
        <Container>
          <BootstrapNavbar.Brand href="#home">
            <img
              alt=""
              src="/logo-white.png"
              width="auto"
              height="70"
              className="d-inline-block align-top"
            />
          </BootstrapNavbar.Brand>
        </Container>
      </BootstrapNavbar>
    </>
  );
}

export default Navbar;
