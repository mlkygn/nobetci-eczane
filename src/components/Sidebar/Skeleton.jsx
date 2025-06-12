import Card from "react-bootstrap/Card";

export default function Skeleton() {
  return (
    <Card className="bg-light border-0" style={{ width: "18rem", marginBottom: "1rem" }}>
      <Card.Body>
        <div className="skeleton" style={{ height: "1.5rem", width: "70%", marginBottom: "0.5rem" }}></div>
        <div className="skeleton" style={{ height: "1rem", width: "50%", marginBottom: "0.5rem" }}></div>
        <div className="skeleton" style={{ height: "1rem", width: "30%" }}></div>
      </Card.Body>
    </Card>
  );
}