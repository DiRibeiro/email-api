import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { appendFile, stat, rename } from 'fs/promises';
import fs from 'fs';
import zlib from 'zlib';

// Config path no ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Body limit aumentado
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

dotenv.config({ path: path.join(__dirname, '.env') });

const transporter = nodemailer.createTransport({
  host: 'smtplw.com.br',
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Função para rotacionar log se > 5MB
const rotateLogIfNeeded = async (logPath) => {
  try {
    const { size } = await stat(logPath);
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (size >= maxSize) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = logPath.replace('.log', `-${timestamp}.log`);
      const gzPath = `${backupPath}.gz`;

      // Renomeia arquivo atual
      await rename(logPath, backupPath);

      // Comprime para .gz
      const source = fs.createReadStream(backupPath);
      const destination = fs.createWriteStream(gzPath);
      const gzip = zlib.createGzip();

      source.pipe(gzip).pipe(destination);

      // Quando terminar compressão, apaga original
      destination.on('finish', () => {
        fs.unlink(backupPath, (err) => {
          if (err) console.error('Erro ao apagar log antigo:', err.message);
        });
      });
    }
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Erro ao checar log size:', err.message);
  }
};

// Função pra logar (arquivo + console)
const logToFileAndConsole = async ({ from, to, cc, bcc, subject }, status, error = null) => {
  const timestamp = new Date().toISOString();

  const logLine = `
[${timestamp}]
FROM: ${from}
TO: ${Array.isArray(to) ? to.join(', ') : to}
${cc ? `CC: ${Array.isArray(cc) ? cc.join(', ') : cc}` : ''}
${bcc ? `BCC: ${Array.isArray(bcc) ? bcc.join(', ') : bcc}` : ''}
SUBJECT: ${subject}
STATUS: ${status}
${error ? `ERROR: ${error.message}` : ''}
------------------------------------------
`;

  console.log(logLine);

  const logPath = path.join(__dirname, 'email.log');
  try {
    await appendFile(logPath, logLine, 'utf8');
    await rotateLogIfNeeded(logPath);
  } catch (err) {
    console.error('❌ Falha ao escrever no log:', err.message);
  }
};

app.post('/send-email', async (req, res) => {
  const {from, to, cc, bcc, attachments, text, subject, html} = req.body;

  try {
    const mailOptions = {
      from,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      subject,
      text,
      html,
      attachments,
    };

    await transporter.sendMail(mailOptions);

    await logToFileAndConsole({ from, to, cc, bcc, subject }, 'SUCCESS');
    res.status(200).send('E-mail enviado com sucesso!');
  } catch (error) {
    await logToFileAndConsole({ from, to, cc, bcc, subject }, 'FAILED', error);
    res.status(500).send('Erro ao enviar e-mail');
  }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`[API] rodando na porta ${PORT}`);
});
