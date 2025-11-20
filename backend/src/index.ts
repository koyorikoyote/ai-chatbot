import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { chatRoutes } from "./routes/chat.js";
import { documentRoutes } from "./routes/documents.js";

const fastify = Fastify({
  logger: {
    level: config.logLevel,
    transport:
      config.nodeEnv === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  },
});

// Register CORS
await fastify.register(cors, {
  origin: true, // Allow all origins as per requirements
  credentials: true,
});

// Register error handler
fastify.setErrorHandler(errorHandler);

// Register routes
await fastify.register(chatRoutes);
await fastify.register(documentRoutes);

// Health check endpoint
fastify.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: "0.0.0.0" });
    fastify.log.info(`Server listening on port ${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
