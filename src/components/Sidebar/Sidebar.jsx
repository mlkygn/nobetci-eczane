/* eslint-disable react/prop-types */

import "./sidebar.css";
import searchIcon from "../../assets/search-icon.svg";
import notFoundIcon from "../../assets/not-found-icon.png";
import { FaRoute } from "react-icons/fa";

import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";

import Skeleton from "./Skeleton";

export default function Sidebar({
  selectPharmacy,
  selectedPharmacy,
  filters,
  setFilters,
  filteredList,
  isLoaded,
}) {
  return (
    <Card className="sidebar">
      <Form.Group className="form-group mb-3">
        <Form.Control
          onChange={(e) =>
            setFilters({ ...filters, searchTerm: e.target.value })
          }
          placeholder="Eczane/Adres Ara"
          aria-label="Username"
          aria-describedby="basic-addon1"
        />
        <img src={searchIcon} className="search-icon" />
      </Form.Group>
      {!isLoaded ? (
        Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)
      ) : filteredList.length === 0 ? (
        <div className="text-center py-5">
          <img src={notFoundIcon} className="w-50" />
          <h4>Nöbetçi Eczane Bulunamadı</h4>
          <p className="text-muted">
            Seçtiğiniz bölgede nöbetçi eczane bulunmamaktadır
          </p>
        </div>
      ) : (
        <ListGroup variant="flush">
          {filteredList.map((item, index) => (
            <ListGroup.Item
              key={index}
              onClick={() => selectPharmacy(item.pharmacyID)}
              className={
                selectedPharmacy?.pharmacyID === item.pharmacyID
                  ? "selected"
                  : ""
              }
            >
              <div className="d-flex">
                <div className="name">{item.pharmacyName}</div>
                {item.distance && (
                  <div className="distance">
                    mesafe: <strong>{item.distance} km</strong>
                  </div>
                )}
              </div>
              <div className="district">{item.district}</div>

              <div className="details">
                <div className="address">{item.address}</div>
                <a
                  className="route-link"
                  onClick={(e) => {
                    e.stopPropagation;
                    e.preventDefault;
                  }}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                  target="_blank"
                >
                  <FaRoute className="me-1" />
                  Yol tarifi al
                </a>
              </div>

              {/* <div className="time">
                <FaRegClock className="me-1 icon" />{" "}
                {item.baslangic.slice(0, 16)} - {item.bitis.slice(0, 16)}
              </div> */}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}
