const express = require('express');
const router = express.Router();
const { Captcha } = require('../models');
const { Op } = require('sequelize');

// Generiere eine einfache Mathe-Frage
function generateMathQuestion() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return {
    question: ` ${num1} + ${num2} = ?`,
    answer: (num1 + num2).toString()
  };
}

router.get('/generate', async (req, res) => {
  try {
    const { question, answer } = generateMathQuestion();
    const captcha = await Captcha.create({
      question,
      answer,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Gültig für 5 Minuten
    });
    res.json({ id: captcha.id, question: captcha.question });
  } catch (error) {
    res.status(500).json({ message: 'Error generating captcha' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { id, answer } = req.body;
    const captcha = await Captcha.findOne({
      where: {
        id,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!captcha) {
      return res.status(400).json({ valid: false, message: 'Captcha not found or expired' });
    }

    const isValid = captcha.answer === answer;
    await captcha.destroy(); // Lösche das Captcha nach der Überprüfung

    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying captcha' });
  }
});

module.exports = router;