import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // Ollama
  ollamaHost: process.env.OLLAMA_HOST || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "qwen2.5:3b",

  // Embedding
  embeddingModel: process.env.EMBEDDING_MODEL || "qwen2.5:3b",
  embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || "1024", 10),

  // ChromaDB
  chromaHost: process.env.CHROMA_HOST || "localhost",
  chromaPort: parseInt(process.env.CHROMA_PORT || "8000", 10),

  // RAG
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || "0.88"),
  topKDocuments: parseInt(process.env.TOP_K_DOCUMENTS || "5", 10),
  maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH || "4000", 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};
