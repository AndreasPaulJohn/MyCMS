import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { generateCaptcha, verifyCaptcha } from "../services/api";
import { toast } from 'react-toastify';
import "./components.css";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captcha, setCaptcha] = useState({ id: "", question: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const captchaData = await generateCaptcha();
      setCaptcha(captchaData);
    } catch (error) {
      console.error("Error fetching captcha:", error);
      toast.error("Fehler beim Laden des Captchas.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      // Captcha überprüfen
      const captchaValid = await verifyCaptcha(captcha.id, captchaAnswer);
      if (!captchaValid) {
        toast.error('Captcha nicht korrekt. Bitte versuchen Sie es erneut.');
        fetchCaptcha();
        setCaptchaAnswer("");
        setIsLoading(false);
        return;
      }

      // Login durchführen
      await login({ email, password });
      // Die Navigation wird jetzt durch den useEffect Handler oben gesteuert
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login fehlgeschlagen. Bitte versuchen Sie es erneut.';
      toast.error(errorMessage);
      setError(errorMessage);
      fetchCaptcha();
      setCaptchaAnswer("");
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
            disabled={isLoading}
          />
          
          <Form.Control
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control custom-input"
            disabled={isLoading}
          />

          <Form.Group className="mb-3">
            <Form.Label>Captcha: {captcha.question}</Form.Label>
            <Form.Control
              type="text"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              required
              className="custom-input"
              disabled={isLoading}
            />
          </Form.Group>

          <Button 
            variant="success" 
            type="submit" 
            className="custom-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
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