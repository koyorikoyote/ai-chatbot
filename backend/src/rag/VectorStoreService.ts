import { ChromaClient, Collection } from "chromadb";
import { v4 as uuidv4 } from "uuid";

export interface VectorStoreConfig {
  host?: string;
  port?: number;
}

export interface DocumentResult {
  id: string;
  content: string;
  score: number;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  title: string;
  category: string;
  source: string;
  lastUpdated: string;
  [key: string]: string | number | boolean;
}

export interface QuestionMetadata {
  count: number;
  firstAsked: string;
  lastAsked: string;
  [key: string]: string | number | boolean;
}

export class VectorStoreService {
  private client: ChromaClient;
  private documentsCollection: Collection | null = null;
  private questionsCollection: Collection | null = null;

  constructor(config: VectorStoreConfig = {}) {
    const host = config.host || process.env.CHROMA_HOST || "localhost";
    const port = config.port || parseInt(process.env.CHROMA_PORT || "8000", 10);

    this.client = new ChromaClient({
      path: `http://${host}:${port}`,
    });
  }

  async initialize(): Promise<void> {
    try {
      // Initialize documents collection
      this.documentsCollection = await this.client.getOrCreateCollection({
        name: "documents",
        metadata: { "hnsw:space": "cosine" },
      });

      // Initialize questions collection
      this.questionsCollection = await this.client.getOrCreateCollection({
        name: "questions",
        metadata: { "hnsw:space": "cosine" },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to initialize ChromaDB collections: ${error.message}`
        );
      }
      throw error;
    }
  }

  async searchDocuments(
    embedding: number[],
    topK: number = 5
  ): Promise<DocumentResult[]> {
    if (!this.documentsCollection) {
      throw new Error(
        "Documents collection not initialized. Call initialize() first."
      );
    }

    try {
      const results = await this.documentsCollection.query({
        queryEmbeddings: [embedding],
        nResults: topK,
      });

      if (!results.ids || !results.ids[0] || results.ids[0].length === 0) {
        return [];
      }

      const documents: DocumentResult[] = [];

      for (let i = 0; i < results.ids[0].length; i++) {
        const id = results.ids[0][i];
        const content = results.documents[0]?.[i] || "";
        const metadata = results.metadatas[0]?.[i] as DocumentMetadata;
        const distance = results.distances?.[0]?.[i] || 0;
        const score = 1 - distance; // Convert distance to similarity score

        documents.push({
          id,
          content,
          score,
          metadata,
        });
      }

      return documents;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search documents: ${error.message}`);
      }
      throw error;
    }
  }

  async checkDuplicate(
    embedding: number[],
    threshold: number = 0.88
  ): Promise<string | null> {
    if (!this.questionsCollection) {
      throw new Error(
        "Questions collection not initialized. Call initialize() first."
      );
    }

    try {
      const results = await this.questionsCollection.query({
        queryEmbeddings: [embedding],
        nResults: 1,
      });

      if (!results.ids || !results.ids[0] || results.ids[0].length === 0) {
        return null;
      }

      const distance = results.distances?.[0]?.[0];
      if (distance === undefined) {
        return null;
      }

      const similarity = 1 - distance;

      if (similarity > threshold) {
        return results.ids[0][0];
      }

      return null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check duplicate: ${error.message}`);
      }
      throw error;
    }
  }

  async storeQuestion(text: string, embedding: number[]): Promise<string> {
    if (!this.questionsCollection) {
      throw new Error(
        "Questions collection not initialized. Call initialize() first."
      );
    }

    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      const metadata: QuestionMetadata = {
        count: 1,
        firstAsked: now,
        lastAsked: now,
      };

      await this.questionsCollection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [text],
        metadatas: [metadata],
      });

      return id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to store question: ${error.message}`);
      }
      throw error;
    }
  }

  async incrementQuestionCount(questionId: string): Promise<void> {
    if (!this.questionsCollection) {
      throw new Error(
        "Questions collection not initialized. Call initialize() first."
      );
    }

    try {
      const result = await this.questionsCollection.get({
        ids: [questionId],
      });

      if (!result.ids || result.ids.length === 0) {
        throw new Error(`Question with ID ${questionId} not found`);
      }

      const currentMetadata = result.metadatas?.[0] as QuestionMetadata;
      const updatedMetadata: QuestionMetadata = {
        count: (currentMetadata?.count || 0) + 1,
        firstAsked: currentMetadata?.firstAsked || new Date().toISOString(),
        lastAsked: new Date().toISOString(),
      };

      await this.questionsCollection.update({
        ids: [questionId],
        metadatas: [updatedMetadata],
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to increment question count: ${error.message}`);
      }
      throw error;
    }
  }

  async storeDocument(
    content: string,
    embedding: number[],
    metadata: DocumentMetadata
  ): Promise<string> {
    if (!this.documentsCollection) {
      throw new Error(
        "Documents collection not initialized. Call initialize() first."
      );
    }

    try {
      const id = uuidv4();

      await this.documentsCollection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [content],
        metadatas: [metadata],
      });

      return id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to store document: ${error.message}`);
      }
      throw error;
    }
  }

  async storeDocuments(
    documents: Array<{
      content: string;
      embedding: number[];
      metadata: DocumentMetadata;
    }>
  ): Promise<string[]> {
    if (!this.documentsCollection) {
      throw new Error(
        "Documents collection not initialized. Call initialize() first."
      );
    }

    try {
      const ids = documents.map(() => uuidv4());
      const embeddings = documents.map((doc) => doc.embedding);
      const contents = documents.map((doc) => doc.content);
      const metadatas = documents.map((doc) => doc.metadata);

      await this.documentsCollection.add({
        ids,
        embeddings,
        documents: contents,
        metadatas,
      });

      return ids;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to store documents: ${error.message}`);
      }
      throw error;
    }
  }
}
