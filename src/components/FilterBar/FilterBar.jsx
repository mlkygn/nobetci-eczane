import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function FilterBar({ filters, setFilters, dataDistricts, userLoc }) {
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

  const handleDistrictChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      selectedDistrict: e.target.value,
    }));
  };

  const handleDistanceChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      maxDistance: Number(e.target.value),
    }));
  };
  return (
    <div className="filter-bar bg-white p-3 rounded-3 shadow-none">
      <h3 className="text-center mb-3">Filtreler</h3>
      <Row>
        <Col>
          {/* Sıralama */}
          <div className="filter-box">
          <span>Sırala: </span>
            <Form.Select onChange={handleSortChange} value={filters.sortField}>
              <option value="pharmacyName" data-order="asc">
                İsme göre artan
              </option>
              <option value="pharmacyName" data-order="desc">
                İsme göre azalan
              </option>
              {userLoc.latitude && userLoc.longitude && (
                <option value="distance" data-order="asc">
                  Mesafeye göre artan
                </option>
              )}
            </Form.Select>
          </div>
        </Col>
        <Col>
          {/* İlçe filtreleme */}
          <div className="filter-box">
            <span>İlçe: </span>
            <Form.Select
              onChange={handleDistrictChange}
              value={filters.selectedDistrict}
            >
              <option value="">Tümü</option>
              {dataDistricts.map((district) => (
                <option key={district.slug} value={district.cities}>
                  {district.cities}
                </option>
              ))}
            </Form.Select>
          </div>
        </Col>
        <Col>
          {/* Mesafe filtreleme */}
          <div className="filter-box">
            <span className="lh-1">
              Maksimum Mesafe: {filters.maxDistance} km
            </span>
            <Form.Range
              min={10}
              max={200}
              step={5}
              value={filters.maxDistance}
              onChange={handleDistanceChange}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default FilterBar;
