import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { generateCaptcha, verifyCaptcha } from "../services/api";
import "./components.css";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
    } catch (error) {
      console.error("Error fetching captcha:", error);
      setError("Fehler beim Laden des Captchas.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const captchaValid = await verifyCaptcha(captcha.id, captchaAnswer);
      if (!captchaValid) {
        setError('Captcha nicht korrekt. Bitte versuchen Sie es erneut.');
        fetchCaptcha();
        setIsLoading(false);
        return;
      }

      await login({ email, password });
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="form-container">
      <div className="custom-form">
        <h2 className="form-title">Login</h2>
        {error && <div className="error-message">{error}</div>}
        <Form onSubmit={handleLogin}>
          <Form.Control 
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control custom-input"
          />
          
          <Form.Control
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control custom-input"
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
            Anmelden
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Link to="/register" className="custom-link">Noch kein Konto? Hier registrieren</Link>
        </div>
      </div>
    </Container>
  );
};

export default Login;
