import React from "react";
import Container from "react-bootstrap/Container";
import BootstrapNavbar from "react-bootstrap/Navbar";

function Navbar() {
  return (
    <>
      <BootstrapNavbar className="bg-body-tertiary">
        <Container>
          <BootstrapNavbar.Brand href="#home">
            <img
              alt=""
              src="/img/logo.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            React Bootstrap
          </BootstrapNavbar.Brand>
        </Container>
      </BootstrapNavbar>
    </>
  );
}

export default Navbar;
