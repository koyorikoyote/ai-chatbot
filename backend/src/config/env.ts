import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // Ollama
  ollamaHost: process.env.OLLAMA_HOST || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "gemma4:e2b",

  // Embedding
  embeddingModel: process.env.EMBEDDING_MODEL || "nomic-embed-text",
  embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || "768", 10),

  // ChromaDB
  chromaHost: process.env.CHROMA_HOST || "localhost",
  chromaPort: parseInt(process.env.CHROMA_PORT || "8001", 10),

  // RAG
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || "0.88"),
  topKDocuments: parseInt(process.env.TOP_K_DOCUMENTS || "5", 10),
  maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH || "4000", 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};
