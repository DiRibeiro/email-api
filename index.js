import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// Para corrigir path no ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// 👇 Aqui você aumenta o limite pra 10mb (ou mais se quiser)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

dotenv.config({ path: path.join(__dirname, '.env') });

const transporter = nodemailer.createTransport({
  host: 'smtplw.com.br',
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
    
    await transporter.sendMail(mailOptions);
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
