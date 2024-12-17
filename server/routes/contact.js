const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: "smtp.strato.de",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Senden der E-Mail an den Admin
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    });

    // Senden der Bestätigungs-E-Mail an den Benutzer mit Datenschutzinformationen
    await transporter.sendMail({
      from: `"CodeClover" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Vielen Dank für Ihre Kontaktanfrage",
      text: `Sehr geehrte(r) ${name},

Vielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erhalten und werden uns so bald wie möglich bei Ihnen melden.

Datenschutzinformationen gemäß DSGVO:

1. Zweck der Datenerhebung: Ihre Daten werden zur Bearbeitung und Beantwortung Ihrer Anfrage verwendet.

2. Rechtsgrundlage: Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).

3. Speicherdauer: Ihre Daten werden für die Dauer der Bearbeitung Ihrer Anfrage sowie für weitere 6 Monate zu Dokumentationszwecken gespeichert.

4. Empfänger der Daten: Ihre Daten werden ausschließlich von unseren Mitarbeitern zur Bearbeitung Ihrer Anfrage verwendet.

5. Ihre Rechte: Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten.

6. Widerrufsrecht: Sie können Ihre Einwilligung zur Datenverarbeitung jederzeit widerrufen.

7. Beschwerderecht: Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren.

8. Verantwortlicher: [Name des Unternehmens], [Adresse], [E-Mail], [Telefon]

9. Datenschutzbeauftragter: [Name], [E-Mail] (falls zutreffend)

Für weitere Informationen zu unseren Datenschutzpraktiken besuchen Sie bitte unsere Datenschutzerklärung unter [URL].

Mit freundlichen Grüßen,
Ihr CodeClover Team`,
      html: `<p>Sehr geehrte(r) ${name},</p>
             <p>Vielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erhalten und werden uns so bald wie möglich bei Ihnen melden.</p>
             <h2>Datenschutzinformationen gemäß DSGVO:</h2>
             <ol>
               <li><strong>Zweck der Datenerhebung:</strong> Ihre Daten werden zur Bearbeitung und Beantwortung Ihrer Anfrage verwendet.</li>
               <li><strong>Rechtsgrundlage:</strong> Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</li>
               <li><strong>Speicherdauer:</strong> Ihre Daten werden für die Dauer der Bearbeitung Ihrer Anfrage sowie für weitere 6 Monate zu Dokumentationszwecken gespeichert.</li>
               <li><strong>Empfänger der Daten:</strong> Ihre Daten werden ausschließlich von unseren Mitarbeitern zur Bearbeitung Ihrer Anfrage verwendet.</li>
               <li><strong>Ihre Rechte:</strong> Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten.</li>
               <li><strong>Widerrufsrecht:</strong> Sie können Ihre Einwilligung zur Datenverarbeitung jederzeit widerrufen.</li>
               <li><strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren.</li>
               <li><strong>Verantwortlicher:</strong> [Name des Unternehmens], [Adresse], [E-Mail], [Telefon]</li>
               <li><strong>Datenschutzbeauftragter:</strong> [Name], [E-Mail] (falls zutreffend)</li>
             </ol>
             <p>Für weitere Informationen zu unseren Datenschutzpraktiken besuchen Sie bitte unsere <a href="[URL]" className="link-success link-underline-opacity-25-hover me-3">Datenschutzerklärung</a>.</p>
             <p>Mit freundlichen Grüßen,<br>Ihr CodeClover Team</p>`,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

module.exports = router;
// const express = require('express');
// const router = express.Router();
// const nodemailer = require('nodemailer');

// let transporter = nodemailer.createTransport({
//   host: "smtp.strato.de",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// router.post('/', async (req, res) => {
//   const { name, email, message } = req.body;

//   if (!name || !email || !message) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   try {
//     // Senden der E-Mail an den Admin
//     await transporter.sendMail({
//       from: `"Contact Form" <${process.env.EMAIL_USER}>`,
//       to: process.env.CONTACT_EMAIL,
//       subject: "New Contact Form Submission",
//       text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
//       html: `<p><strong>Name:</strong> ${name}</p>
//              <p><strong>Email:</strong> ${email}</p>
//              <p><strong>Message:</strong> ${message}</p>`,
//     });

//     // Senden der Bestätigungs-E-Mail an den Benutzer
//     await transporter.sendMail({
//       from: `"CodeClover" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Vielen Dank für Ihre Kontaktanfrage",
//       text: `Sehr geehrte(r) ${name},\n\nVielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erhalten und werden uns so bald wie möglich bei Ihnen melden.\n\nMit freundlichen Grüßen,\nIhr CodeClover Team`,
//       html: `<p>Sehr geehrte(r) ${name},</p>
//              <p>Vielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erhalten und werden uns so bald wie möglich bei Ihnen melden.</p>
//              <p>Mit freundlichen Grüßen,<br>Ihr CodeClover Team</p>`,
//     });

//     res.status(200).json({ message: 'Email sent successfully' });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({ message: 'Failed to send email' });
//   }
// });

// module.exports = router;

