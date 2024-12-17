import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { sendContactForm, generateCaptcha, verifyCaptcha } from "../services/api";
import './pages.css';
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState({ id: "", question: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const captchaData = await generateCaptcha();
      setCaptcha(captchaData);
    } catch (error) {
      console.error("Error fetching captcha:", error);
      setStatus({ message: "Fehler beim Laden des Captchas.", type: "danger" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "Nachricht wird gesendet...", type: "info" });
    
    try {
      const captchaValid = await verifyCaptcha(captcha.id, captchaAnswer);
      if (!captchaValid) {
        setStatus({ message: "Captcha nicht korrekt. Bitte versuchen Sie es erneut.", type: "danger" });
        fetchCaptcha();
        setIsSubmitting(false);
        return;
      }

      const response = await sendContactForm(formData);
      console.log("Form submission response:", response);
      setStatus({ message: "Nachricht erfolgreich gesendet!", type: "success" });
      setFormData({ name: "", email: "", message: "" });
      setCaptchaAnswer("");
      fetchCaptcha();
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus({
        message: "Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.",
        type: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="contact-container mt-5">
      <h1 className="page-title">Kontaktieren Sie uns</h1>
      {status.message && <Alert variant={status.type}>{status.message}</Alert>}
      <Form onSubmit={handleSubmit} className="contact-form">
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="custom-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>E-Mail</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="custom-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nachricht</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="custom-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Captcha: {captcha.question}</Form.Label>
          <Form.Control
            type="text"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            required
            className="custom-input"
          />
        </Form.Group>

        <Button variant="success" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird gesendet..." : "Senden"}
        </Button>
      </Form>
      <div className="privacy-notice mt-3">
        <p>
          Durch das Absenden dieses Formulars erklären Sie sich damit
          einverstanden, dass wir Ihre Daten zur Bearbeitung Ihrer Anfrage
          verwenden. Ihre Daten werden vertraulich behandelt und nicht an Dritte
          weitergegeben. Weitere Informationen finden Sie in unserer{" "}
          <a href="/datenschutz" className="link-success link-underline-opacity-25-hover me-3">Datenschutzerklärung</a>.
        </p>
      </div>
    </Container>
  );
};

export default Contact;