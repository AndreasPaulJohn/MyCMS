import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";
import { register } from "../services/auth";
import { generateCaptcha } from "../services/api";
import "./components.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captcha, setCaptcha] = useState({ id: "", question: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const captchaData = await generateCaptcha();
      setCaptcha(captchaData);
      setCaptchaAnswer(""); // Reset answer when getting new captcha
    } catch (error) {
      console.error("Error fetching captcha:", error);
      setError("Fehler beim Laden des Captchas.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await register(
        username, 
        email, 
        password,
        captcha.id,
        captchaAnswer
      );
      setSuccess(response.message);
      setTimeout(() => navigate("/login"), 5000);
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.response?.data?.message || "Registrierung fehlgeschlagen");
      fetchCaptcha(); // Neues Captcha bei Fehler
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="form-container">
      <div className="custom-form">
        <h2 className="form-title">Registrieren</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Control
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="custom-input"
          />

          <Form.Control
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="custom-input"
          />

          <Form.Control
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="custom-input"
          />

          <Form.Control
            type="password"
            placeholder="Passwort bestätigen"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="custom-input"
          />

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

          <Button
            variant="success"
            type="submit"
            className="custom-button"
            disabled={isLoading}
          >
            {isLoading ? "Wird registriert..." : "Registrieren"}
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Link to="/login" className="custom-link">Bereits ein Konto? Hier anmelden</Link>
        </div>
      </div>
    </Container>
  );
};

export default Register;