import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

export default function ErrorMessage({ messages, onRetry }) {
  return (
    <Alert
      variant="danger"
      className="text-center position-sticky"
      style={{ top: 0, zIndex: 100 }}
    >
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
      <Button variant="outline-danger" onClick={onRetry}>
        Tekrar Dene
      </Button>
    </Alert>
  );
}
