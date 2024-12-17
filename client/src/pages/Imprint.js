import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './pages.css';

const Imprint = () => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className='page-title'>Impressum</h1>
          <div id="blocker">
          <div className="imprint-content">
            <p>Seite im Aufbau</p>
            <p>
              Vertreten durch : [Name des Vertreters]<br />
              Telefon: [Telefonnummer]<br />
              E-Mail: [E-Mail-Adresse]
            </p>
            <p>
              Umsatzsteuer-ID: [Ihre Umsatzsteuer-ID]<br />
              Handelsregister: [Registergericht und Nummer]
            </p>
            {/* Fügen Sie hier weitere notwendige Informationen ein */}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Imprint;
