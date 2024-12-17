import React from 'react';
import { Container } from 'react-bootstrap';
import './pages.css';
const Privacy = () => {
  return (
    <Container className="mt-5">
      <h1 class="page-title">Datenschutzerklärung</h1>
      <p>
        Hier kommt der vollständige Text Ihrer Datenschutzerklärung. 
        Stellen Sie sicher, dass Sie alle notwendigen Informationen gemäß DSGVO einschließen.
      </p>
      {/* Fügen Sie hier den Rest Ihrer Datenschutzerklärung ein */}
    </Container>
  );
};

export default Privacy;