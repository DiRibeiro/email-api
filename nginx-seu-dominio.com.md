
# NGINX - Configuração para API - seu-dominio.com

## Objetivo:
Configurar um reverse proxy HTTPS para a API `seu-dominio.com` com suporte a:
- HTTPS com Let's Encrypt
- CORS habilitado corretamente
- Proxy para Node.js na porta 3000

## Arquivos utilizados

### 1. /etc/nginx/sites-available/seu-dominio.com
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";

        if ($request_method = OPTIONS ) {
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
}
```

### 2. Link simbólico
```bash
sudo ln -s /etc/nginx/sites-available/seu-dominio.com /etc/nginx/sites-enabled/
```

## Certbot - HTTPS com Let's Encrypt
```bash
sudo certbot --nginx -d seu-dominio.com
```

## Recarregar o NGINX
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Resumo de problemas corrigidos
| Problema | Solução |
|----------|---------|
| Mixed Content: http vs https | Redirecionamento 301 para HTTPS |
| net::ERR_SSL_PROTOCOL_ERROR | Configuração SSL correta com Let's Encrypt |
| CORS: multiple values in Access-Control-Allow-Origin | Mantivemos o CORS só no NGINX |
| Request Entity Too Large (413) | Ajustável via `client_max_body_size` se necessário |

## Opcional: Limite de payload
```nginx
server {
    client_max_body_size 10M;
}
```
