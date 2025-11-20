import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { documentIndexRequestSchema } from "../middleware/validation.js";
import { EmbeddingService } from "../rag/EmbeddingService.js";
import { VectorStoreService } from "../rag/VectorStoreService.js";
import { config } from "../config/index.js";

// Initialize services (singleton pattern)
let embeddingService: EmbeddingService | null = null;
let vectorStoreService: VectorStoreService | null = null;

function getEmbeddingService(): EmbeddingService {
  if (!embeddingService) {
    embeddingService = new EmbeddingService({
      host: config.ollamaHost,
      model: config.embeddingModel,
    });
  }
  return embeddingService;
}

function getVectorStoreService(): VectorStoreService {
  if (!vectorStoreService) {
    vectorStoreService = new VectorStoreService({
      host: config.chromaHost,
      port: config.chromaPort,
    });
  }
  return vectorStoreService;
}

export async function documentRoutes(fastify: FastifyInstance) {
  // POST /api/documents/index - Index documents into ChromaDB
  fastify.post(
    "/api/documents/index",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Validate request body
        const validatedBody = documentIndexRequestSchema.parse(request.body);
        const { documents } = validatedBody;

        request.log.info(
          { documentCount: documents.length },
          "Starting document indexing"
        );

        const embedder = getEmbeddingService();
        const vectorStore = getVectorStoreService();

        // Initialize vector store if not already initialized
        await vectorStore.initialize();

        let indexed = 0;
        let failed = 0;

        // Process each document
        for (const doc of documents) {
          try {
            request.log.debug(
              { title: doc.title, category: doc.category },
              "Processing document"
            );

            // Generate embedding for document content
            const embedding = await embedder.embed(doc.content);

            // Store document in ChromaDB with metadata
            await vectorStore.storeDocument(doc.content, embedding, {
              title: doc.title,
              category: doc.category,
              source: doc.source,
              lastUpdated: new Date().toISOString(),
            });

            indexed++;

            request.log.debug(
              { title: doc.title },
              "Document indexed successfully"
            );
          } catch (error) {
            failed++;
            request.log.error(
              { error, title: doc.title },
              "Failed to index document"
            );
          }
        }

        request.log.info(
          { indexed, failed, total: documents.length },
          "Document indexing completed"
        );

        return reply.status(200).send({
          indexed,
          failed,
          total: documents.length,
        });
      } catch (error) {
        request.log.error({ error }, "Error indexing documents");

        // Handle specific error types
        if (error instanceof Error) {
          // Check for Ollama service errors
          if (
            error.message.includes("ECONNREFUSED") ||
            error.message.includes("Ollama")
          ) {
            return reply.status(503).send({
              error: {
                code: "EMBEDDING_SERVICE_UNAVAILABLE",
                message:
                  "The embedding service is temporarily unavailable. Please try again later.",
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
                code: "VECTOR_STORE_UNAVAILABLE",
                message:
                  "The vector store is temporarily unavailable. Please try again later.",
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
