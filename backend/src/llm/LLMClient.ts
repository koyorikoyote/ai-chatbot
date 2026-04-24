import { Ollama } from "ollama";

export interface LLMClientConfig {
  host?: string;
  model?: string;
  timeout?: number;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

export class LLMClient {
  private ollama: Ollama;
  private model: string;
  private timeout: number;

  constructor(config: LLMClientConfig = {}) {
    this.ollama = new Ollama({
      host: config.host || process.env.OLLAMA_HOST || "http://localhost:11434",
    });
    this.model = config.model || process.env.OLLAMA_MODEL || "gemma4:e2b";
    this.timeout = config.timeout || 150000; // 150 seconds (2.5 minutes) for LLM generation
  }

  async generate(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      // Create a timeout promise that rejects after the timeout period
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`LLM request timed out after ${this.timeout}ms`));
        }, this.timeout);
      });

      // Race between the actual request and the timeout
      const responsePromise = this.ollama.chat({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        think: "low",
        keep_alive: "30m",
        options: {
          temperature: options.temperature ?? 0,
          num_predict: options.maxTokens ?? 512,
          num_ctx: 2048,
          num_thread: 6,
        },
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);

      if (!response.message?.content) {
        throw new Error("Empty response from LLM");
      }

      return response.message.content;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("timed out")) {
          throw error; // Re-throw timeout errors as-is
        }
        if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("fetch failed")
        ) {
          throw new Error(
            "Failed to connect to Ollama service. Ensure Ollama is running at " +
            (process.env.OLLAMA_HOST || "http://localhost:11434")
          );
        }
        throw new Error(`LLM generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async *generateStream(
    prompt: string,
    options: GenerateOptions = {}
  ): AsyncGenerator<string> {
    try {
      const stream = await this.ollama.chat({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        think: "low",
        keep_alive: "30m",
        options: {
          temperature: options.temperature ?? 0,
          num_predict: options.maxTokens ?? 512,
          num_ctx: 2048,
          num_thread: 6,
        },
      });

      for await (const chunk of stream) {
        if (chunk.message?.content) {
          yield chunk.message.content;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("fetch failed")
        ) {
          throw new Error(
            "Failed to connect to Ollama service. Ensure Ollama is running at " +
            (process.env.OLLAMA_HOST || "http://localhost:11434")
          );
        }
        throw new Error(`LLM streaming failed: ${error.message}`);
      }
      throw error;
    }
  }
}
