import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { chatRequestSchema } from "../middleware/validation.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";
import { RAGPipeline } from "../rag/RAGPipeline.js";
import { EmbeddingService } from "../rag/EmbeddingService.js";
import { VectorStoreService } from "../rag/VectorStoreService.js";
import { LLMClient } from "../llm/LLMClient.js";
import { SessionManager } from "../rag/SessionManager.js";
import { config } from "../config/index.js";

// Initialize services (singleton pattern)
let ragPipeline: RAGPipeline | null = null;

async function getRAGPipeline(): Promise<RAGPipeline> {
  if (!ragPipeline) {
    const embedder = new EmbeddingService({
      host: config.ollamaHost,
      model: config.embeddingModel,
    });

    const vectorStore = new VectorStoreService({
      host: config.chromaHost,
      port: config.chromaPort,
    });

    // Initialize vector store
    await vectorStore.initialize();

    const llmClient = new LLMClient({
      host: config.ollamaHost,
      model: config.ollamaModel,
    });

    const sessionManager = new SessionManager();

    ragPipeline = new RAGPipeline(
      embedder,
      vectorStore,
      llmClient,
      sessionManager,
      {
        similarityThreshold: config.similarityThreshold,
        topKDocuments: config.topKDocuments,
        maxContextLength: config.maxContextLength,
      }
    );
  }

  return ragPipeline;
}

export async function chatRoutes(fastify: FastifyInstance) {
  // POST /api/chat - Send message and get response
  fastify.post(
    "/api/chat",
    {
      preHandler: rateLimitMiddleware,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Validate request body
        const validatedBody = chatRequestSchema.parse(request.body);
        const { message, sessionId } = validatedBody;

        request.log.info(
          { sessionId, messageLength: message.length },
          "Processing chat request"
        );

        // Get RAG pipeline instance
        const pipeline = await getRAGPipeline();

        // Process query (convert null to undefined for sessionId)
        const result = await pipeline.processQuery(message, sessionId ?? undefined);

        request.log.info(
          {
            sessionId: result.sessionId,
            isNewQuestion: result.isNewQuestion,
            sourcesCount: result.sources.length,
          },
          "Chat request processed successfully"
        );

        // Return response
        return reply.status(200).send({
          response: result.response,
          sources: result.sources.map((source) => ({
            title: source.metadata.title,
            content: source.content,
            score: source.score,
            category: source.metadata.category,
            source: source.metadata.source,
          })),
          sessionId: result.sessionId,
          isNewQuestion: result.isNewQuestion,
        });
      } catch (error) {
        request.log.error(
          {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            type: error?.constructor?.name,
          },
          "Error processing chat request"
        );

        // Handle specific error types
        if (error instanceof Error) {
          // Check for Ollama service errors
          if (
            error.message.includes("ECONNREFUSED") ||
            error.message.includes("Ollama")
          ) {
            return reply.status(503).send({
              error: {
                code: "LLM_SERVICE_UNAVAILABLE",
                message:
                  "The AI service is temporarily unavailable. Please try again later.",
              },
            });
          }

          // Check for ChromaDB errors
          if (
            error.message.includes("ChromaDB") ||
            error.message.includes("vector")
          ) {
            return reply.status(503).send({
              error: {
                code: "KNOWLEDGE_BASE_UNAVAILABLE",
                message:
                  "The knowledge base is temporarily unavailable. Please try again later.",
              },
            });
          }

          // Check for timeout errors
          if (error.message.includes("timeout")) {
            return reply.status(504).send({
              error: {
                code: "REQUEST_TIMEOUT",
                message:
                  "The request took too long to process. Please try again.",
              },
            });
          }
        }

        // Re-throw to let error handler deal with it
        throw error;
      }
    }
  );
}
