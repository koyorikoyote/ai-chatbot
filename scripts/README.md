# Scripts

This directory contains utility scripts for the AI Chatbot project.

## seed-docs.ts

Seeds the ChromaDB vector database with sample documentation from the `docs/` directory.

### Prerequisites

1. Backend server must be running:

   ```bash
   cd backend
   npm run dev
   ```

2. Ollama service must be running with the embedding model:

   ```bash
   ollama serve
   ```

3. ChromaDB must be running (if using external instance):
   ```bash
   chroma run --path ./chroma_data --port 8001
   ```

### Usage

From the project root:

```bash
npm run seed-docs
```

Or directly with tsx:

```bash
tsx scripts/seed-docs.ts
```

### Environment Variables

- `API_ENDPOINT` - Backend API URL (default: `http://localhost:3000`)

Example:

```bash
API_ENDPOINT=http://localhost:3000 npm run seed-docs
```

### What It Does

1. Scans the `docs/` directory for all `.md` (Markdown) files
2. Extracts the title from the first `#` heading in each file
3. Determines the category from the directory structure
4. Sends all documents to the `/api/documents/index` endpoint
5. Logs the indexing results

### Output

The script will display:

- Number of files found
- Processing status for each file
- Indexing results (indexed, failed, total)

### Sample Documents

The following sample documents are included:

**Products:**

- `products/product-overview.md` - Overview of AI chatbot products
- `products/pricing.md` - Pricing plans and add-ons

**Services:**

- `services/integration-guide.md` - How to integrate the chatbot widget
- `services/support.md` - Customer support information

**FAQ:**

- `faq/general.md` - General frequently asked questions
- `faq/technical.md` - Technical FAQ

### Adding More Documents

To add more documents:

1. Create new `.md` files in the `docs/` directory
2. Organize them in subdirectories by category (e.g., `products/`, `services/`, `faq/`)
3. Run the seed script again

The script will automatically:

- Detect new files
- Extract titles from the first heading
- Use the directory name as the category
- Index all documents

### Troubleshooting

**Error: Could not connect to backend server**

- Make sure the backend is running: `cd backend && npm run dev`
- Check that the API endpoint is correct (default: `http://localhost:3000`)

**Error: Embedding service unavailable**

- Make sure Ollama is running: `ollama serve`
- Verify the embedding model is available: `ollama list`

**Error: Vector store unavailable**

- Make sure ChromaDB is running
- Check the ChromaDB connection settings in backend `.env`

**No markdown files found**

- Verify that `.md` files exist in the `docs/` directory
- Check file permissions
