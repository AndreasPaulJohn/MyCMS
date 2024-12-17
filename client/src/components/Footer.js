import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import config from '../config';
import './footer.css'
const Footer = () => {
  return (
    <footer className="mt-5 bg-footer py-3">
      <Container>
        <Row>
          <Col className="text-center">
            <Link className="link-success link-underline-opacity-25-hover me-3" to="/datenschutz">Datenschutz</Link>
            <Link className="link-success link-underline-opacity-25-hover me-3" to="/impressum">Impressum</Link>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col className="text-center">
            <small>© {new Date().getFullYear()} {config.domain}. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;