# Quick Start Guide

Get the AI Chatbot Widget running in 5 minutes!

## Prerequisites Check

Before starting, verify you have:

- [ ] Node.js 20+ installed (`node --version`)
- [ ] Python 3.8+ installed (`python --version`)
- [ ] Git installed (`git --version`)

## Step-by-Step Setup

### 1. Install Ollama (2 minutes)

**Windows:**

```bash
# Download and run installer from https://ollama.ai
```

**Linux/Mac:**

```bash
curl https://ollama.ai/install.sh | sh
```

**Verify installation:**

```bash
ollama --version
```

### 2. Pull the AI Model (2 minutes)

```bash
ollama pull qwen2.5:3b
```

This downloads ~2GB. Wait for completion.

### 3. Install ChromaDB (1 minute)

```bash
pip install chromadb
```

### 4. Install Project Dependencies (1 minute)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Configure Environment Variables (30 seconds)

```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```

No changes needed for local development!

### 6. Start All Services (1 minute)

Open 4 separate terminals:

**Terminal 1 - ChromaDB:**

```bash
chroma run --path ./vector-db --port 8001
```

**Terminal 2 - Ollama:**

```bash
ollama serve
```

**Terminal 3 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 4 - Frontend:**

```bash
cd frontend
npm run dev
```

### 7. Seed Documentation (30 seconds)

In a new terminal:

```bash
npm run seed-docs
```

Wait for "Successfully indexed X documents" message.

### 8. Test the Chatbot! 🎉

Open your browser to: **http://localhost:5173**

Try asking:

- "What products do you offer?"
- "How much does it cost?"
- "How do I integrate the chatbot?"

## Verify Everything Works

### Check Services

Run these commands in separate terminals:

```bash
# ChromaDB
curl http://localhost:8000/api/v1/heartbeat
# Should return: {"nanosecond heartbeat": ...}

# Ollama
ollama list
# Should show: qwen2.5:3b

# Backend
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# Frontend
# Open http://localhost:5173 in browser
```

## Common Issues

### "Port already in use"

Kill the process or change the port:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### "Model not found"

Pull the model again:

```bash
ollama pull qwen2.5:3b
ollama list  # Verify it's there
```

### "Cannot connect to ChromaDB"

Restart ChromaDB with correct path:

```bash
chroma run --path ./vector-db --port 8001
```

### "No documents retrieved"

Re-run the seed script:

```bash
npm run seed-docs
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [WIDGET_USAGE.md](frontend/WIDGET_USAGE.md) to embed the widget
- Explore the [scripts/README.md](scripts/README.md) for utility scripts
- Add your own documentation to the `docs/` directory

## Development Workflow

1. Make code changes
2. Both frontend and backend auto-reload
3. Test in browser at http://localhost:5173
4. Check terminal logs for errors

## Stopping Services

Press `Ctrl+C` in each terminal to stop:

1. Frontend dev server
2. Backend dev server
3. Ollama service
4. ChromaDB service

## Production Build

When ready to deploy:

```bash
# Build frontend widget
cd frontend
npm run build

# Build backend
cd ../backend
npm run build
```

See [README.md](README.md) for deployment instructions.

---

**Need help?** Check the [Troubleshooting](README.md#troubleshooting) section in the main README.
