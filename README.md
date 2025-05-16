
# 📧 API de Envio de E-mails (Node.js + Express + Nodemailer)

Serviço simples para envio de e-mails com log em arquivo e rotação automática de log quando atingir 5MB.

## 🚀 Tecnologias Utilizadas
- Node.js (ESM modules)
- Express.js
- Nodemailer
- dotenv
- cors
- fs / fs.promises
- zlib (compressão gzip)
- path, url (utils)

## 📦 Instalação

```bash
git clone <repo-url>
cd <pasta-projeto>
npm install
```

## 🛠 Configuração (.env)

Crie um arquivo `.env` na raiz do projeto:

```env
EMAIL_PORT=465
EMAIL_USER=seu-email@dominio.com.br
EMAIL_PASS=sua_senha
```

## 🏃‍♂️ Como Rodar

```bash
npm run start
```
A API ficará disponível em:
```
http://localhost:3000
```

## 📨 Endpoint: Envio de E-mail

### URL
```
POST /send-email
```

### Headers
| Nome | Valor |
|-------|--------|
| Content-Type | application/json |

### Body (JSON)
```json
{
  "from": "remetente@dominio.com.br",
  "to": ["destinatario@dominio.com.br"],
  "cc": ["copia@dominio.com.br"],
  "bcc": ["copia-oculta@dominio.com.br"],
  "subject": "Assunto do E-mail",
  "text": "Texto puro do e-mail",
  "html": "<b>HTML do e-mail</b>",
  "attachments": [
    {
      "filename": "arquivo.pdf",
      "path": "./anexos/arquivo.pdf"
    }
  ]
}
```

### Respostas
| Status | Descrição |
|---------|-----------|
| 200 | E-mail enviado com sucesso |
| 500 | Erro ao enviar e-mail |
| 415 | Content-Type inválido |

## 🗒️ Logs
- Logs são armazenados em `email.log` na raiz do projeto.
- Quando ultrapassar **5MB**, o arquivo é rotacionado e compactado (`.gz`).
- Logs incluem: timestamp, remetente, destinatários, status e erros.

## 🛡️ Middleware de Segurança
- Validação de `Content-Type: application/json`.
- CORS liberado para todas as origens (ajustável).
- Limite de body aumentado para 10MB.

## 🗂️ Estrutura
```
.
├── .env
├── email.log
├── index.js
├── package.json
└── README.md
```

## 🐛 Debugs e Monitoramento
- `console.log` dos headers e body na chegada.
- Logs de sucesso/erro no terminal e arquivo.
- Erros no envio são capturados e logados.
