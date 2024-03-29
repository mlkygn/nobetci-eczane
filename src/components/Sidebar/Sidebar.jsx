import React, { useState, useEffect } from "react";
import "./sidebar.css";
import searchIcon from "../../assets/search-icon.svg";

import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import { FaRegClock } from "react-icons/fa";

export default function Sidebar({ dataPharmacy, flyTo, isLoaded }) {
  const [filteredList, setFilteredList] = new useState([]);
  const [loadInıtialData, setloadInıtialData] = new useState(false);

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
        item.eczane.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        item.bolge.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        item.adres.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
    // Trigger render with updated values
    setFilteredList(updatedList);
  };

  return (
    <Card className="sidebar">
      <Form.Group className="form-group mb-3">
        <Form.Control
          onChange={filterBySearch}
          placeholder="Eczane/Adres Ara"
          aria-label="Username"
          aria-describedby="basic-addon1"
        />
        <img src={searchIcon} className="search-icon" />
      </Form.Group>
      {!isLoaded ? (
        <div className="d-flex justify-content-center py-4">
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : (
        <ListGroup variant="flush">
          {filteredList.map((item, index) => (
            <ListGroup.Item
              key={index}
              onClick={() => flyTo([item.boylam, item.enlem])}
            >
              <div className="name">{item.eczane}</div>
              <div className="district">{item.bolge}</div>
              <div className="time">
                <FaRegClock className="me-1 icon" />{" "}
                {item.baslangic.slice(0, 16)} - {item.bitis.slice(0, 16)}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}
