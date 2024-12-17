import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { generateCaptcha, verifyCaptcha } from '../services/api';
import "../index.css"

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
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
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const captchaValid = await verifyCaptcha(captcha.id, captchaAnswer);
      if (!captchaValid) {
        setStatus('captchaError');
        fetchCaptcha();
        return;
      }
      await axios.post('/api/contacts', formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setCaptchaAnswer('');
      fetchCaptcha();
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="">Name</label>
        <input
          type="text"
          className=""
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="">E-Mail</label>
        <input
          type="email"
          className=""
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="message" className="">Nachricht</label>
        <textarea
          className=""
          id="message"
          name="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <div className="mb-3">
        <label htmlFor="captcha" className="">Captcha: {captcha.question}</label>
        <input
          type="text"
          className=""
          id="captcha"
          name="captcha"
          value={captchaAnswer}
          onChange={(e) => setCaptchaAnswer(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-success" disabled={status === 'sending'}>
        {status === 'sending' ? 'Wird gesendet...' : 'Senden'}
      </button>
      {status === 'success' && (
        <div className="alert alert-success mt-3">
          Ihre Nachricht wurde erfolgreich gesendet. Bitte überprüfen Sie Ihre E-Mail für eine Bestätigung.
        </div>
      )}
      {status === 'error' && (
        <div className="alert alert-danger mt-3">
          Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.
        </div>
      )}
      {status === 'captchaError' && (
        <div className="alert alert-danger mt-3">
          Captcha nicht korrekt. Bitte versuchen Sie es erneut.
        </div>
      )}
    </form>
  );
};

export default ContactForm;