require('dotenv').config();
const nodemailer = require('nodemailer');

// Transporter konfigurieren
let transporter = nodemailer.createTransport({
  host: "smtp.strato.de",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,  // EMAIL_USER aus der .env Datei
    pass: process.env.EMAIL_PASS,  // EMAIL_PASS aus der .env Datei
  },
});

// Hier wird process.env.ADMIN_EMAIL verwendet, um die E-Mail-Adresse zu beziehen
const sendRegistrationEmail = async (to, username) => {
  try {
    // E-Mail an den Benutzer senden
    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: "Welcome to CodeClover - Account Activation Pending",
      text: `Hello ${username},\n\nThank you for registering with CodeClover. Your account has been created and is pending activation by an administrator. You will receive another email once your account has been activated.\n\nBest regards,\nThe CodeClover Team`,
      html: `<p>Hello ${username},</p><p>Thank you for registering with CodeClover. Your account has been created and is pending activation by an administrator. You will receive another email once your account has been activated.</p><p>Best regards,<br>The CodeClover Team</p>`
    });

    console.log('Registration email sent successfully to the user');

    // E-Mail an die feste E-Mail-Adresse senden (z.B. Administrator)
    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,  // Feste E-Mail-Adresse
      subject: "New User Registration - Action Required",
      text: `A new user has registered with the username: ${username}.\n\nPlease review and activate the account as necessary.\n\nBest regards,\nThe CodeClover System`,
      html: `<p>A new user has registered with the username: ${username}.</p><p>Please review and activate the account as necessary.</p><p>Best regards,<br>The CodeClover System</p>`
    });

    console.log('Notification email sent successfully to the administrator');
  } catch (error) {
    console.error('Error sending registration or notification email:', error);
  }
};

module.exports = { sendRegistrationEmail };


