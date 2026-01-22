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
    this.model = config.model || process.env.OLLAMA_MODEL || "qwen2.5:3b";
    this.timeout = config.timeout || 120000; // 120 seconds default (increased for RAG prompts)
  }

  async generate(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await this.ollama.chat({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens,
        },
      });

      clearTimeout(timeoutId);

      if (!response.message?.content) {
        throw new Error("Empty response from LLM");
      }

      return response.message.content;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`LLM request timed out after ${this.timeout}ms`);
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
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens,
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
