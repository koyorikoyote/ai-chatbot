# Deployment Guide

This guide covers deploying the AI Chatbot Widget to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Building for Production](#building-for-production)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass (`npm test` in both frontend and backend)
- [ ] Environment variables are configured for production
- [ ] Documentation is indexed in ChromaDB
- [ ] Security configurations are reviewed
- [ ] CORS settings allow production domains
- [ ] Rate limiting is configured appropriately
- [ ] Logging is set to appropriate level (info or warn)
- [ ] SSL/TLS certificates are ready
- [ ] Backup strategy is in place

## Environment Setup

### Production Environment Variables

#### Backend (.env)

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_TIMEOUT=60000

# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Embedding Configuration
EMBEDDING_MODEL=qwen2.5:3b
EMBEDDING_DIMENSION=1024

# RAG Configuration
SIMILARITY_THRESHOLD=0.88
TOP_K_DOCUMENTS=5
MAX_CONTEXT_LENGTH=4000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=info
```

#### Frontend (.env.production)

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=60000

# Widget Configuration
VITE_WIDGET_POSITION=bottom-right
VITE_WIDGET_PRIMARY_COLOR=#007bff
VITE_WIDGET_TITLE=Chat Support
```

## Building for Production

### Backend Build

```bash
cd backend
npm run build
```

This creates compiled JavaScript in the `dist/` directory.

### Frontend Build

```bash
cd frontend
npm run build
```

This creates optimized bundles in the `dist/` directory:

- `chat-widget.js` - Main widget bundle
- `style.css` - Widget styles
- Source maps for debugging

## Deployment Options

### Option 1: Single Server Deployment

Deploy all components on a single server (suitable for small to medium traffic).

#### Server Requirements

- **OS**: Ubuntu 20.04+ or similar Linux distribution
- **CPU**: 4+ cores (for Ollama inference)
- **RAM**: 8GB+ (4GB for Ollama, 2GB for services, 2GB for OS)
- **Storage**: 50GB+ SSD
- **Network**: Static IP with open ports 80, 443

#### Installation Steps

1. **Install Node.js:**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install Python and ChromaDB:**

```bash
sudo apt-get install -y python3 python3-pip
pip3 install chromadb
```

3. **Install Ollama:**

```bash
curl https://ollama.ai/install.sh | sh
```

4. **Pull the model:**

```bash
ollama pull qwen2.5:3b
```

5. **Clone and build the project:**

```bash
git clone <your-repo-url>
cd ai-chatbot

# Build backend
cd backend
npm install --production
npm run build

# Build frontend
cd ../frontend
npm install --production
npm run build
```

6. **Set up systemd services:**

Create `/etc/systemd/system/chromadb.service`:

```ini
[Unit]
Description=ChromaDB Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ai-chatbot
ExecStart=/usr/local/bin/chroma run --path /var/www/ai-chatbot/vector-db --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/ollama.service`:

```ini
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=www-data
ExecStart=/usr/local/bin/ollama serve
Restart=always

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/chatbot-backend.service`:

```ini
[Unit]
Description=Chatbot Backend API
After=network.target chromadb.service ollama.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ai-chatbot/backend
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/ai-chatbot/backend/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

7. **Enable and start services:**

```bash
sudo systemctl enable chromadb ollama chatbot-backend
sudo systemctl start chromadb ollama chatbot-backend
```

8. **Set up Nginx as reverse proxy:**

Install Nginx:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/chatbot`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Set up SSL with Let's Encrypt:**

```bash
sudo certbot --nginx -d api.yourdomain.com
```

10. **Deploy frontend to CDN:**

Upload `frontend/dist/*` to your CDN or static hosting (S3, Cloudflare, etc.)

### Option 2: Docker Deployment

Use Docker Compose for containerized deployment.

#### docker-compose.yml

```yaml
version: "3.8"

services:
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - ./vector-db:/chroma/chroma
    restart: always

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - CHROMA_HOST=chromadb
      - OLLAMA_HOST=http://ollama:11434
    env_file:
      - ./backend/.env
    depends_on:
      - chromadb
      - ollama
    restart: always

volumes:
  ollama_data:
```

#### Backend Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Pull Ollama model
docker exec -it ai-chatbot-ollama-1 ollama pull qwen2.5:3b

# Seed documentation
npm run seed-docs

# View logs
docker-compose logs -f
```

### Option 3: Cloud Deployment (AWS)

Deploy to AWS using managed services.

#### Architecture

```
Route 53 (DNS)
    ↓
CloudFront (CDN) → S3 (Frontend)
    ↓
ALB (Load Balancer)
    ↓
EC2 (Backend + Ollama + ChromaDB)
```

#### Steps

1. **Launch EC2 instance:**

   - Instance type: t3.xlarge or larger (4 vCPU, 16GB RAM)
   - AMI: Ubuntu 20.04 LTS
   - Storage: 100GB gp3 SSD
   - Security group: Allow ports 22, 80, 443

2. **Set up EC2 instance:**
   Follow "Single Server Deployment" steps above

3. **Create S3 bucket for frontend:**

```bash
aws s3 mb s3://your-chatbot-widget
aws s3 sync frontend/dist/ s3://your-chatbot-widget/ --acl public-read
```

4. **Set up CloudFront distribution:**

   - Origin: S3 bucket
   - Enable HTTPS
   - Configure custom domain

5. **Set up Application Load Balancer:**

   - Target: EC2 instance on port 3000
   - Health check: /health endpoint
   - Enable HTTPS with ACM certificate

6. **Configure Route 53:**
   - Create A record for api.yourdomain.com → ALB
   - Create A record for widget.yourdomain.com → CloudFront

## Post-Deployment

### 1. Verify Services

```bash
# Check backend health
curl https://api.yourdomain.com/health

# Check ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Check Ollama
ollama list
```

### 2. Seed Documentation

```bash
cd ai-chatbot
API_ENDPOINT=https://api.yourdomain.com npm run seed-docs
```

### 3. Test the Widget

Create a test HTML page:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Widget Test</title>
  </head>
  <body>
    <h1>Test Page</h1>

    <script src="https://widget.yourdomain.com/chat-widget.js"></script>
    <script>
      ChatWidget.init({
        apiEndpoint: "https://api.yourdomain.com",
        primaryColor: "#007bff",
        position: "bottom-right",
        title: "Chat Support",
      });
    </script>
  </body>
</html>
```

### 4. Configure Monitoring

Set up monitoring for:

- Server CPU and memory usage
- API response times
- Error rates
- ChromaDB query performance
- Ollama inference times

## Monitoring

### Application Logs

View logs:

```bash
# Backend logs
sudo journalctl -u chatbot-backend -f

# ChromaDB logs
sudo journalctl -u chromadb -f

# Ollama logs
sudo journalctl -u ollama -f
```

### Health Checks

Set up automated health checks:

```bash
# Create health check script
cat > /usr/local/bin/chatbot-health-check.sh << 'EOF'
#!/bin/bash

# Check backend
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "Backend is down!"
    sudo systemctl restart chatbot-backend
fi

# Check ChromaDB
if ! curl -f http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
    echo "ChromaDB is down!"
    sudo systemctl restart chromadb
fi
EOF

chmod +x /usr/local/bin/chatbot-health-check.sh

# Add to crontab (run every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/chatbot-health-check.sh") | crontab -
```

### Performance Monitoring

Monitor key metrics:

- API response time (target: < 3 seconds p95)
- Ollama inference time (target: < 2 seconds)
- ChromaDB query time (target: < 500ms)
- Error rate (target: < 1%)
- Uptime (target: > 99.5%)

## Backup and Recovery

### Backup ChromaDB

```bash
# Create backup
tar -czf chromadb-backup-$(date +%Y%m%d).tar.gz vector-db/

# Restore backup
tar -xzf chromadb-backup-20240101.tar.gz
```

### Backup Configuration

```bash
# Backup environment files
tar -czf config-backup-$(date +%Y%m%d).tar.gz backend/.env frontend/.env
```

## Scaling

### Horizontal Scaling

To handle more traffic:

1. **Add more backend instances:**

   - Deploy multiple EC2 instances
   - Use load balancer to distribute traffic
   - Share ChromaDB instance

2. **Scale Ollama:**

   - Use GPU instances for faster inference
   - Consider cloud LLM APIs for high traffic

3. **Add caching:**
   - Use Redis for response caching
   - Cache embeddings for common queries

### Vertical Scaling

Upgrade server resources:

- More CPU cores for Ollama
- More RAM for model loading
- Faster SSD for ChromaDB

## Security Considerations

- [ ] Enable HTTPS for all endpoints
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS only for trusted domains
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities
- [ ] Set up automated backups
- [ ] Implement log rotation
- [ ] Use secrets management for sensitive data

## Troubleshooting Production Issues

### High Response Times

1. Check Ollama performance
2. Verify ChromaDB query times
3. Check server resources (CPU, RAM)
4. Review logs for errors

### Service Crashes

1. Check logs: `sudo journalctl -u chatbot-backend -n 100`
2. Verify dependencies are running
3. Check disk space
4. Review memory usage

### Connection Issues

1. Verify firewall rules
2. Check CORS configuration
3. Verify SSL certificates
4. Test network connectivity

---

For additional help, refer to the [README.md](README.md) or contact your system administrator.
