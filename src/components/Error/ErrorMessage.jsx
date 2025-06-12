import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <Alert variant="danger" className="text-center">
      <p>{message}</p>
      <Button variant="outline-danger" onClick={onRetry}>
        Tekrar Dene
      </Button>
    </Alert>
  );
}
