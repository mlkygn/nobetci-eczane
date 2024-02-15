import { useState } from 'react'
import './App.css'
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>
      Example heading
      <Badge bg="secondary" as={Button}>
        New
      </Badge>
    </h1>
     
    </>
  )
}

export default App