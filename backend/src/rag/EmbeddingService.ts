import { Ollama } from "ollama";

export interface EmbeddingServiceConfig {
  host?: string;
  model?: string;
  expectedDimension?: number;
}

export class EmbeddingService {
  private ollama: Ollama;
  private model: string;
  private expectedDimension: number;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor(config: EmbeddingServiceConfig = {}) {
    this.ollama = new Ollama({
      host: config.host || process.env.OLLAMA_HOST || "http://localhost:11434",
    });
    this.model = config.model || process.env.EMBEDDING_MODEL || "qwen2.5:3b";
    this.expectedDimension =
      config.expectedDimension ||
      parseInt(process.env.EMBEDDING_DIMENSION || "1024", 10);
  }

  async embed(text: string): Promise<number[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.ollama.embeddings({
          model: this.model,
          prompt: text,
        });

        if (!response.embedding || !Array.isArray(response.embedding)) {
          throw new Error("Invalid embedding response from Ollama");
        }

        const embedding = response.embedding;

        // Validate embedding dimension
        if (embedding.length !== this.expectedDimension) {
          throw new Error(
            `Embedding dimension mismatch: expected ${this.expectedDimension}, got ${embedding.length}`
          );
        }

        return embedding;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on validation errors
        if (lastError.message.includes("dimension mismatch")) {
          throw lastError;
        }

        // Log retry attempt
        if (attempt < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(
            `Embedding generation failed (attempt ${attempt + 1}/${
              this.maxRetries
            }): ${lastError.message}. Retrying in ${delay}ms...`
          );
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed to generate embedding after ${this.maxRetries} attempts: ${
        lastError?.message || "Unknown error"
      }`
    );
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.embed(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getExpectedDimension(): number {
    return this.expectedDimension;
  }
}
