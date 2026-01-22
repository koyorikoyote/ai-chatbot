# Document Seeding Guide

## Quick Answer: JavaScript vs Python

**YES, you can use the JavaScript/TypeScript client for seeding!** In fact, it's the **recommended approach**.

## Why JavaScript/TypeScript is Recommended

The TypeScript seed script (`scripts/seed-docs.ts`) is the preferred method because:

1. **Consistent Embeddings**: Uses Ollama (qwen2.5:3b) for embeddings - the same model the chatbot uses for queries
2. **Correct Dimensions**: Generates 2048-dimension embeddings that match your configuration
3. **Integrated Workflow**: Works through your backend API, ensuring all validation and error handling is applied
4. **Type Safety**: Full TypeScript support with proper error messages
5. **No Dimension Mismatch**: Avoids the embedding dimension conflicts that occur with Python's default model

## The Embedding Dimension Issue

ChromaDB collections are created with a specific embedding dimension. Once set, all documents in that collection must use the same dimension:

- **Python script** (`seed-docs-python.py`): Uses ChromaDB's default model (all-MiniLM-L6-v2) → **384 dimensions**
- **JavaScript/TypeScript** (`seed-docs.ts`): Uses Ollama (qwen2.5:3b) → **2048 dimensions**
- **Your chatbot queries**: Use Ollama (qwen2.5:3b) → **2048 dimensions**

If you seed with Python (384 dims) but query with JavaScript (2048 dims), you'll get:
```
Error: Collection expecting embedding with dimension of 384, got 2048
```

## Recommended Workflow

### Initial Setup (One Time)

1. **Reset ChromaDB** (if collections exist with wrong dimensions):
   ```bash
   cd backend
   npx tsx reset-chromadb.ts
   ```

2. **Start all services**:
   ```bash
   # Terminal 1: Start Ollama
   ollama serve

   # Terminal 2: Start ChromaDB
   chroma run --path ./chroma_data --port 8001

   # Terminal 3: Start Backend
   cd backend
   npm run dev
   ```

3. **Seed documents**:
   ```bash
   cd scripts
   npx tsx seed-docs.ts
   ```

### Adding New Documents (Anytime)

1. Add your markdown files to the `docs/` directory:
   ```
   docs/
   ├── products/
   │   └── new-product.md
   ├── services/
   │   └── new-service.md
   └── faq/
       └── new-faq.md
   ```

2. Make sure backend is running:
   ```bash
   cd backend
   npm run dev
   ```

3. Run the seed script:
   ```bash
   cd scripts
   npx tsx seed-docs.ts
   ```

The script will:
- Detect all markdown files (including new ones)
- Generate embeddings using Ollama
- Store them in ChromaDB with proper metadata
- Report success/failure for each document

## When to Use Python Script

**Only use the Python script for:**
- Testing ChromaDB connectivity
- Quick prototyping
- When you don't have Node.js/backend available

**Never use it for production seeding** unless you also change your chatbot to use the same embedding model (all-MiniLM-L6-v2).

## Troubleshooting

### Error: "Embedding dimension mismatch"

**Cause**: Collections were created with a different embedding model.

**Solution**:
```bash
# 1. Reset ChromaDB
cd backend
npx tsx reset-chromadb.ts

# 2. Reseed with JavaScript
cd ../scripts
npx tsx seed-docs.ts
```

### Error: "Could not connect to backend server"

**Cause**: Backend is not running.

**Solution**:
```bash
cd backend
npm run dev
```

### Error: "Ollama service unavailable"

**Cause**: Ollama is not running or model not available.

**Solution**:
```bash
# Start Ollama
ollama serve

# Verify model is available
ollama list

# Pull model if needed
ollama pull qwen2.5:3b
```

### Error: "ChromaDB unavailable"

**Cause**: ChromaDB is not running.

**Solution**:
```bash
chroma run --path ./chroma_data --port 8001
```

## Technical Details

### How the JavaScript Client Works

The VectorStoreService uses a custom `NoOpEmbeddingFunction`:

```typescript
class NoOpEmbeddingFunction implements IEmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    throw new Error("Embeddings must be provided directly");
  }
}
```

This tells ChromaDB: "Don't generate embeddings automatically - we'll provide them."

When you call `storeDocument()`, you pass the embedding explicitly:

```typescript
await vectorStore.storeDocument(
  content,
  embedding,  // ← 2048-dimension array from Ollama
  metadata
);
```

### Collection Creation

Collections are created with the NoOp function on first use:

```typescript
this.documentsCollection = await this.client.getOrCreateCollection({
  name: "documents",
  metadata: { "hnsw:space": "cosine" },
  embeddingFunction: new NoOpEmbeddingFunction(),
});
```

Once created, the collection "remembers" the embedding dimension from the first document added.

## Summary

✅ **Use JavaScript/TypeScript** (`scripts/seed-docs.ts`) for all document seeding
✅ Ensures consistent 2048-dimension embeddings
✅ Works seamlessly with your chatbot
✅ Proper error handling and validation

❌ **Avoid Python script** (`scripts/seed-docs-python.py`) for production
❌ Creates 384-dimension embeddings
❌ Incompatible with chatbot queries
❌ Only useful for testing ChromaDB connectivity
