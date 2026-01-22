import { EmbeddingService } from "./EmbeddingService.js";
import { VectorStoreService, DocumentResult } from "./VectorStoreService.js";
import { LLMClient } from "../llm/LLMClient.js";
import { SessionManager, Message } from "./SessionManager.js";

export interface RAGPipelineConfig {
  similarityThreshold?: number;
  topKDocuments?: number;
  maxContextLength?: number;
}

export interface ChatResponse {
  response: string;
  sources: DocumentResult[];
  sessionId: string;
  isNewQuestion: boolean;
}

export class RAGPipeline {
  private embedder: EmbeddingService;
  private vectorStore: VectorStoreService;
  private llmClient: LLMClient;
  private sessionManager: SessionManager;
  private similarityThreshold: number;
  private topKDocuments: number;
  private maxContextLength: number;

  constructor(
    embedder: EmbeddingService,
    vectorStore: VectorStoreService,
    llmClient: LLMClient,
    sessionManager: SessionManager,
    config: RAGPipelineConfig = {}
  ) {
    this.embedder = embedder;
    this.vectorStore = vectorStore;
    this.llmClient = llmClient;
    this.sessionManager = sessionManager;
    this.similarityThreshold = config.similarityThreshold || 0.88;
    this.topKDocuments = config.topKDocuments || 5;
    this.maxContextLength = config.maxContextLength || 4000;
  }

  async processQuery(query: string, sessionId?: string): Promise<ChatResponse> {
    // 1. Generate embedding for the query
    const embedding = await this.embedder.embed(query);

    // 2. Check for duplicate question
    const duplicateId = await this.vectorStore.checkDuplicate(
      embedding,
      this.similarityThreshold
    );

    let isNewQuestion = true;

    if (duplicateId) {
      // Increment count for duplicate question
      await this.vectorStore.incrementQuestionCount(duplicateId);
      isNewQuestion = false;
    } else {
      // Store new question
      await this.vectorStore.storeQuestion(query, embedding);
    }

    // 3. Retrieve relevant documents
    const documents = await this.vectorStore.searchDocuments(
      embedding,
      this.topKDocuments
    );

    // 4. Get or create session
    const finalSessionId = sessionId || this.sessionManager.createSession();

    // Get conversation history
    const conversationHistory = this.sessionManager.getContext(finalSessionId);

    // 5. Build prompt with context and conversation history
    const prompt = this.buildPrompt(query, documents, conversationHistory);

    // 6. Generate response from LLM
    const response = await this.llmClient.generate(prompt);

    // 7. Add messages to session
    this.sessionManager.addMessage(finalSessionId, {
      role: "user",
      content: query,
    });

    this.sessionManager.addMessage(finalSessionId, {
      role: "assistant",
      content: response,
    });

    return {
      response,
      sources: documents,
      sessionId: finalSessionId,
      isNewQuestion,
    };
  }

  private buildPrompt(
    query: string,
    documents: DocumentResult[],
    conversationHistory: Message[]
  ): string {
    // Build context from retrieved documents (truncate each doc to 500 chars for speed)
    const context = documents
      .map((doc, index) => {
        const truncatedContent = doc.content.length > 500
          ? doc.content.substring(0, 500) + "..."
          : doc.content;
        return `[${index + 1}] ${doc.metadata.title}:\n${truncatedContent}`;
      })
      .join("\n\n");

    // Build conversation history with truncation (last 2 exchanges only)
    const recentHistory = conversationHistory.slice(-4); // Last 2 Q&A pairs
    const historyText = recentHistory
      .map((msg) => `${msg.role === "user" ? "Q" : "A"}: ${msg.content}`)
      .join("\n");

    // Construct a concise prompt for faster generation
    let prompt = "You are a helpful assistant. Answer concisely based on the context.\n\n";

    if (context) {
      prompt += `Context:\n${context}\n\n`;
    }

    if (historyText) {
      prompt += `Recent:\n${historyText}\n\n`;
    }

    prompt += `Question: ${query}\n\nAnswer:`;

    return prompt;
  }

  private truncateConversationHistory(messages: Message[]): Message[] {
    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    const estimateTokens = (text: string): number => {
      return Math.ceil(text.length / 4);
    };

    let totalTokens = 0;
    const truncatedMessages: Message[] = [];

    // Process messages in reverse order (most recent first)
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = estimateTokens(message.content);

      if (totalTokens + messageTokens > this.maxContextLength) {
        // Stop adding messages if we exceed the limit
        break;
      }

      truncatedMessages.unshift(message);
      totalTokens += messageTokens;
    }

    return truncatedMessages;
  }

  async *processQueryStream(
    query: string,
    sessionId?: string
  ): AsyncGenerator<{
    chunk: string;
    isComplete: boolean;
    metadata?: ChatResponse;
  }> {
    // 1. Generate embedding for the query
    const embedding = await this.embedder.embed(query);

    // 2. Check for duplicate question
    const duplicateId = await this.vectorStore.checkDuplicate(
      embedding,
      this.similarityThreshold
    );

    let isNewQuestion = true;

    if (duplicateId) {
      await this.vectorStore.incrementQuestionCount(duplicateId);
      isNewQuestion = false;
    } else {
      await this.vectorStore.storeQuestion(query, embedding);
    }

    // 3. Retrieve relevant documents
    const documents = await this.vectorStore.searchDocuments(
      embedding,
      this.topKDocuments
    );

    // 4. Get or create session
    const finalSessionId = sessionId || this.sessionManager.createSession();

    // Get conversation history
    const conversationHistory = this.sessionManager.getContext(finalSessionId);

    // 5. Build prompt
    const prompt = this.buildPrompt(query, documents, conversationHistory);

    // 6. Stream response from LLM
    let fullResponse = "";

    for await (const chunk of this.llmClient.generateStream(prompt)) {
      fullResponse += chunk;
      yield { chunk, isComplete: false };
    }

    // 7. Add messages to session
    this.sessionManager.addMessage(finalSessionId, {
      role: "user",
      content: query,
    });

    this.sessionManager.addMessage(finalSessionId, {
      role: "assistant",
      content: fullResponse,
    });

    // 8. Yield final metadata
    yield {
      chunk: "",
      isComplete: true,
      metadata: {
        response: fullResponse,
        sources: documents,
        sessionId: finalSessionId,
        isNewQuestion,
      },
    };
  }
}
