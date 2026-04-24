# AI Chatbot Widget

An embeddable AI-powered chatbot widget that leverages a local `gemma4:e2b` language model (with `nomic-embed-text` for embeddings) and RAG (Retrieval-Augmented Generation) for accurate, context-aware responses based on company documentation. Answers stream token-by-token over Server-Sent Events so users see output immediately.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Starting Services](#starting-services)
- [Development](#development)
- [Seeding Documentation](#seeding-documentation)
- [Chat API & Streaming](#chat-api--streaming)
- [LLM Performance Tuning](#llm-performance-tuning)
- [Embedding the Widget](#embedding-the-widget)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Project Structure

```
ai-chatbot/
├── frontend/              # React chat UI
│   ├── src/
│   │   ├── components/    # Chat components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── backend/               # Node.js API + RAG pipeline
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── llm/           # LLM client
│   │   ├── rag/           # RAG pipeline
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Middleware
│   │   ├── utils/         # Utilities
│   │   └── types/         # TypeScript types
│   └── tests/             # Test files
├── vector-db/             # ChromaDB data storage
├── docs/                  # Company documentation for RAG
└── scripts/               # Setup and utility scripts
```

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Python 3.8+** - Required for ChromaDB
- **Ollama** - For running the local LLM
- **ChromaDB** - Vector database for document storage

## Installation

### 1. Install Node.js Dependencies

Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Install Ollama

**Windows:**
Download and install from [https://ollama.ai](https://ollama.ai)

**Linux/Mac:**

```bash
curl https://ollama.ai/install.sh | sh
```

### 3. Pull the Required Models

After installing Ollama, pull the chat model and the embedding model. The chat model is a reasoning (thinking) model — the backend runs it with `think: "low"` so it does minimal reasoning before answering.

```bash
# Chat / reasoning model (~7 GB, 5.1B parameters)
ollama pull gemma4:e2b

# Embedding model (~274 MB, 768-dim)
ollama pull nomic-embed-text
```

Both models are required. `gemma4:e2b` handles chat; `nomic-embed-text` converts documents and queries into vectors for ChromaDB. Do not use a chat model for embeddings — Ollama will reject it with `"this model does not support embeddings"`.

### 4. Install ChromaDB

Install ChromaDB using pip:

```bash
pip install chromadb
```

Or using conda:

```bash
conda install -c conda-forge chromadb
```

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma4:e2b

# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8001

# Embedding Configuration
# IMPORTANT: Must be a dedicated embedding model, not a chat model.
# Dimension must match the model (nomic-embed-text = 768).
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSION=768

# RAG Configuration
SIMILARITY_THRESHOLD=0.88
TOP_K_DOCUMENTS=5
MAX_CONTEXT_LENGTH=4000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

Edit the `.env` file with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=60000

# Widget Configuration
VITE_WIDGET_POSITION=bottom-right
VITE_WIDGET_PRIMARY_COLOR=#007bff
VITE_WIDGET_TITLE=Chat Support
```

## Starting Services

Follow these steps in order to start all required services:

# Wipe old chroma collection if needed
```bash
rm -rf ai-chatbot/backend/chroma_data
```

### 1. Start ChromaDB

Open a terminal and run:

```bash
cd ai-chatbot/backend
chroma run --path ./chroma_data --port 8001
```

Open the chromadb UI interface:
```bash
cd chromadb-admin-main
npm install
npm run dev
```

ChromaDB will start on `http://localhost:8001`. Keep this terminal open.

**Alternative using Docker:**

```bash
docker run -p 8000:8000 -v ./vector-db:/chroma/chroma chromadb/chroma
```

### 2. Start Ollama Service

Open a new terminal and run:

```bash
ollama serve
```

Ollama will start on `http://localhost:11434`. Keep this terminal open.

**Verify Ollama is running:**

```bash
ollama list
```

You should see both `gemma4:e2b` and `nomic-embed-text` in the list.

### 3. Start Backend Server

Open a new terminal and run:

```bash
cd backend
npm run dev
```

The backend API will start on `http://localhost:3000`.

**Verify backend is running:**

```bash
curl http://localhost:3000/health
```

### 4. Start Frontend Development Server

Open a new terminal and run:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`.

## Development

### Running in Development Mode

With all services running, you can:

1. **Access the chat widget demo**: Open `http://localhost:5173` in your browser
2. **Test the API**: Use tools like Postman or curl to test endpoints
3. **View logs**: Check terminal outputs for debugging

### Development URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **ChromaDB**: http://localhost:8001
- **Ollama**: http://localhost:11434

### Hot Reload

Both frontend and backend support hot reload:

- Frontend: Vite automatically reloads on file changes
- Backend: Nodemon restarts the server on file changes

## Seeding Documentation

Before using the chatbot, you need to index your company documentation into ChromaDB.

### 1. Add Documentation Files

Place your documentation files in the `docs/` directory:

```
docs/
├── products/
│   ├── product-overview.md
│   └── pricing.md
├── services/
│   ├── integration-guide.md
│   └── support.md
└── faq/
    ├── general.md
    └── technical.md
```

### 2. Run the Seed Script

Make sure all services are running, then execute:

```bash
# From the project root
npm run seed-docs
```

Or run directly (from the `ai-chatbot` project root):

```bash
npx tsx scripts/seed-docs.ts
```

The script will:

1. Read all markdown files from the `docs/` directory
2. Generate embeddings using Ollama
3. Store documents with metadata in ChromaDB
4. Display indexing progress and results

**Expected output:**

```
Starting document indexing...
Processing: docs/products/product-overview.md
Processing: docs/services/integration-guide.md
Processing: docs/faq/general.md
...
Successfully indexed 15 documents
Failed: 0 documents
```

## Chat API & Streaming

The backend exposes two chat endpoints:

| Endpoint                | Transport         | When to use                                             |
| ----------------------- | ----------------- | ------------------------------------------------------- |
| `POST /api/chat`        | JSON (buffered)   | Scripts, server-to-server calls, non-browser clients    |
| `POST /api/chat/stream` | Server-Sent Events | Browser / widget — tokens render as they are generated  |

**Request body (both endpoints):**

```json
{ "message": "How much does Pro cost?", "sessionId": "optional-session-id" }
```

**`/api/chat/stream` event types:**

- `event: chunk` — `{ "text": "..." }` for each generated fragment
- `event: done` — `{ "sessionId", "isNewQuestion", "sources": [...] }` when generation finishes
- `event: error` — `{ "message": "..." }` if something fails mid-stream

The React widget (`ChatWidget.tsx`) uses the streaming endpoint via `sendMessageStream` in [`frontend/src/utils/api.ts`](frontend/src/utils/api.ts). It inserts an empty assistant bubble when the request starts, appends each `chunk.text` in place, and attaches sources on `done`. Client disconnect is handled on the backend — if the browser aborts, the generator stops cleanly.

**Curl example:**

```bash
curl -N -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"What is your refund policy?"}'
```

## LLM Performance Tuning

All knobs live in [`backend/src/llm/LLMClient.ts`](backend/src/llm/LLMClient.ts) and are applied to both `generate` (non-streaming) and `generateStream`.

**Current defaults, and why:**

| Option         | Value    | Notes                                                                                           |
| -------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `think`        | `"low"`  | `gemma4:e2b` is a reasoning model. `"low"` keeps chain-of-thought minimal. `false` disables it. |
| `keep_alive`   | `"30m"`  | Keeps the model resident in memory, avoiding the ~14 s cold-load on idle requests.              |
| `num_predict`  | `512`    | Upper bound on generated tokens (includes any thinking budget at `think: "low"`).               |
| `num_ctx`      | `2048`   | Context window — matches the actual prompt size. Smaller = less KV-cache, faster prompt eval.   |
| `num_thread`   | `6`      | CPU threads. Best ≈ physical core count; higher values usually hurt from hyperthread contention. |
| `temperature`  | `0`      | Deterministic, fastest sampling. Raise to `0.3–0.7` for more varied answers.                    |

**Levers to turn if you need more speed:**

- **GPU offload** — if you have an NVIDIA GPU, add `num_gpu: 999` to the `options` object to force all layers to GPU. Typically 5–10× faster than CPU.
- **Bigger reasoning model** — `gemma4:e4b` (8 B) has slightly sharper answers but is roughly 2× slower on CPU than `e2b` (5.1 B) for equivalent prompts. Switch via `OLLAMA_MODEL=gemma4:e4b`.
- **Non-reasoning model** — switch to something like `llama3.1:8b` to drop the thinking budget entirely. Faster, but `think` no longer applies.
- **Raise `num_thread`** up to physical core count if you're CPU-only and have spare cores.

**Levers to turn if you need smarter answers:**

- Raise `think` to `"medium"` or `"high"` — more reasoning, slower responses.
- Raise `temperature` (drop `0` → `0.3–0.7`) and re-add `top_k: 40`, `top_p: 0.9` for more diverse generation.
- Raise `num_ctx` to 4096+ if you want to pack more retrieved documents into the prompt.

## Embedding the Widget

### Option 1: Script Tag (Production)

After building the widget, embed it in any webpage:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome to My Website</h1>

    <!-- Add the widget script -->
    <script src="https://your-domain.com/chat-widget.js"></script>
    <script>
      ChatWidget.init({
        apiEndpoint: "https://your-api.com",
        primaryColor: "#007bff",
        position: "bottom-right",
        title: "Chat Support",
      });
    </script>
  </body>
</html>
```

### Option 2: Development/Testing

For local testing, use the demo page:

1. Build the widget:

```bash
cd frontend
npm run build
```

2. Open `frontend/demo.html` in your browser

### Widget Configuration Options

```javascript
ChatWidget.init({
  // Required
  apiEndpoint: "http://localhost:3000", // Backend API URL

  // Optional
  primaryColor: "#007bff", // Widget theme color
  position: "bottom-right", // 'bottom-right' or 'bottom-left'
  title: "Chat Support", // Widget header title
  placeholder: "Type your message...", // Input placeholder text
  welcomeMessage: "How can I help you?", // Initial bot message
});
```

### Building for Production

Build the widget bundle:

```bash
cd frontend
npm run build
```

This creates:

- `dist/chat-widget.js` - UMD bundle for embedding
- `dist/chat-widget.css` - Widget styles

Deploy these files to your CDN or static hosting.

## Testing

### Run Backend Tests

```bash
cd backend
npm test
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

### Run Specific Test Suites

```bash
# Backend unit tests
npm run test:unit

# Backend integration tests
npm run test:integration

# Frontend component tests
npm run test:components
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Troubleshooting

### ChromaDB Connection Issues

**Problem**: Backend cannot connect to ChromaDB

**Solution**:

1. Verify ChromaDB is running: `curl http://localhost:8001/api/v2/heartbeat` (the v1 API is deprecated in current ChromaDB builds)
2. Check the port in `.env` matches ChromaDB port
3. Restart ChromaDB with correct path: `chroma run --path ./chroma_data --port 8001`

### Ollama Model Not Found

**Problem**: Error "model not found: gemma4:e2b"

**Solution**:

1. Pull the model: `ollama pull gemma4:e2b`
2. Verify model is available: `ollama list`
3. Check `OLLAMA_MODEL` in `.env` matches exactly

### "this model does not support embeddings"

**Problem**: Chat requests fail with `Failed to generate embedding after 3 attempts: this model does not support embeddings`

**Cause**: `EMBEDDING_MODEL` is set to a chat model (e.g. `gemma4:e2b`). Chat models cannot serve embeddings.

**Solution**:

1. Set `EMBEDDING_MODEL=nomic-embed-text` and `EMBEDDING_DIMENSION=768` in `backend/.env`
2. Pull the embedding model if needed: `ollama pull nomic-embed-text`
3. Wipe any ChromaDB collections created with the wrong dimension: `rm -rf ai-chatbot/backend/chroma_data`
4. Restart the backend and re-seed

### "Empty response from LLM"

**Problem**: Backend logs `LLM generation failed: Empty response from LLM` after a long wait.

**Cause**: Reasoning models like `gemma4:e2b` put their chain-of-thought in a separate `thinking` field. With unbounded thinking, the model can exhaust `num_predict` before writing anything to `content`.

**Solution**: The backend already passes `think: "low"` to keep reasoning tight. If you still see this error, raise `num_predict` in [`backend/src/llm/LLMClient.ts`](backend/src/llm/LLMClient.ts) or lower the think level further (`think: false` disables reasoning entirely).

### Ollama Connection Timeout

**Problem**: Backend times out connecting to Ollama

**Solution**:

1. Verify Ollama is running: `ollama list`
2. Adjust `timeout` in `LLMClient` constructor (default 150000 ms) if generation truly needs more time
3. Check Ollama logs for errors
4. Restart Ollama service: `ollama serve`

### Embedding Dimension Mismatch

**Problem**: ChromaDB error about embedding dimensions

**Solution**:

1. Delete existing collections: `rm -rf backend/chroma_data`
2. Verify `EMBEDDING_MODEL` and `EMBEDDING_DIMENSION` in `backend/.env` match the model (e.g. `nomic-embed-text` → 768)
3. Re-run seed script: `npx tsx scripts/seed-docs.ts`

### CORS Errors

**Problem**: Frontend cannot connect to backend

**Solution**:

1. Check `ALLOWED_ORIGINS` in backend `.env`
2. Add frontend URL: `ALLOWED_ORIGINS=http://localhost:5173`
3. Restart backend server

### Port Already in Use

**Problem**: "Port 3000 is already in use"

**Solution**:

1. Find process using port: `netstat -ano | findstr :3000` (Windows)
2. Kill the process or change port in `.env`
3. Restart the server

### No Documents Retrieved

**Problem**: Chatbot responds but doesn't use documentation

**Solution**:

1. Verify documents are indexed: Check ChromaDB admin UI
2. Re-run seed script: `npm run seed-docs`
3. Check similarity threshold in `.env` (try lowering to 0.7)
4. Verify embeddings are generated correctly

### Widget Not Appearing

**Problem**: Widget doesn't show on webpage

**Solution**:

1. Check browser console for errors
2. Verify script path is correct
3. Ensure backend API is accessible
4. Check CORS configuration
5. Verify widget initialization code is correct

## Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Ollama Library (models)](https://ollama.com/library)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Fastify Documentation](https://www.fastify.io/)
- [React Documentation](https://react.dev/)

## Quick Run steps

Prerequisite (one time): `ollama pull gemma4:e2b && ollama pull nomic-embed-text`.

Each command below runs in its own terminal and stays running:

1. **ChromaDB** — `cd ai-chatbot/backend && chroma run --path ./chroma_data --port 8001`
2. **Backend** — `cd ai-chatbot/backend && npm run dev`
3. **Seed / reset docs** (only when documentation changes):
   - Reset the vector store: `cd ai-chatbot/backend && npx tsx reset-chromadb.ts`
   - Re-seed documents: `cd ai-chatbot && npx tsx scripts/seed-docs.ts` (backend must be running)
4. **(Optional) ChromaDB admin UI** — `cd chromadb-admin-main && npm run dev`
5. **Frontend** — `cd ai-chatbot/frontend && npm run dev`

Open the frontend at http://localhost:5173 and send a message — responses stream token-by-token via `/api/chat/stream`.

