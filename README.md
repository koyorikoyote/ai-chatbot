# AI Chatbot Widget

An embeddable AI-powered chatbot widget that leverages a local Qwen2.5-3B language model with RAG (Retrieval-Augmented Generation) for accurate, context-aware responses based on company documentation.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Starting Services](#starting-services)
- [Development](#development)
- [Seeding Documentation](#seeding-documentation)
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

### 3. Pull Qwen2.5-3B Model

After installing Ollama, pull the required model:

```bash
ollama pull qwen2.5:3b
```

This will download the Qwen2.5-3B model (approximately 2GB).

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
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_TIMEOUT=60000

# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8001

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

You should see `qwen2.5:3b` in the list.

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

Or run directly:

```bash
cd scripts
npx ts-node seed-docs.ts
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

1. Verify ChromaDB is running: `curl http://localhost:8001/api/v1/heartbeat`
2. Check the port in `.env` matches ChromaDB port
3. Restart ChromaDB with correct path: `chroma run --path ./vector-db --port 8001`

### Ollama Model Not Found

**Problem**: Error "model not found: qwen2.5:3b"

**Solution**:

1. Pull the model: `ollama pull qwen2.5:3b`
2. Verify model is available: `ollama list`
3. Check model name in `.env` matches exactly

### Ollama Connection Timeout

**Problem**: Backend times out connecting to Ollama

**Solution**:

1. Verify Ollama is running: `ollama list`
2. Increase timeout in `.env`: `OLLAMA_TIMEOUT=120000`
3. Check Ollama logs for errors
4. Restart Ollama service: `ollama serve`

### Embedding Dimension Mismatch

**Problem**: ChromaDB error about embedding dimensions

**Solution**:

1. Delete existing collections: Remove `vector-db/` directory
2. Verify embedding model in `.env`
3. Re-run seed script: `npm run seed-docs`

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
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Qwen2.5 Model Card](https://huggingface.co/Qwen/Qwen2.5-3B)
- [Fastify Documentation](https://www.fastify.io/)
- [React Documentation](https://react.dev/)

## License

MIT
