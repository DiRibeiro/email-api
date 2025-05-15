import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Evita problemas com certificados SSL inválidos
  },
});

app.post('/send-email', async (req, res) => {
  const {from, to, cc, bcc, attachments, text, subject, html} = req.body;

  try {
    const mailOptions = {
      from: from,
      to: [to],
      cc: [cc],
      bcc: [bcc],
      subject: subject,
      text: text,
      html: html,
      attachments: attachments,
    };
    
    const info = await transporter.sendMail(mailOptions);
    res.status(200).send('E-mail enviado com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao enviar e-mail');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
