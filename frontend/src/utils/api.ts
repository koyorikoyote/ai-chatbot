import { ChatResponse, DocumentSource } from "../types/chat";

export interface SendMessageRequest {
  message: string;
  sessionId?: string | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_TIMEOUT = 180000; // 180 seconds (3 minutes for LLM processing)

export async function sendMessage(
  apiEndpoint: string,
  request: SendMessageRequest
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${apiEndpoint}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: request.message,
        sessionId: request.sessionId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error?.message ||
        `Request failed with status ${response.status}`,
        response.status
      );
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError("Request timed out. Please try again.", 504, error);
      }

      if (error.message.includes("fetch")) {
        throw new ApiError(
          "Unable to connect to chat service. Please check your connection.",
          undefined,
          error
        );
      }

      throw new ApiError(error.message, undefined, error);
    }

    throw new ApiError("An unexpected error occurred", undefined, error);
  }
}

export interface StreamHandlers {
  onChunk: (text: string) => void;
  onDone: (meta: {
    sessionId: string;
    isNewQuestion: boolean;
    sources: DocumentSource[];
  }) => void;
  onError?: (err: ApiError) => void;
  signal?: AbortSignal;
}

export async function sendMessageStream(
  apiEndpoint: string,
  request: SendMessageRequest,
  handlers: StreamHandlers
): Promise<void> {
  const response = await fetch(`${apiEndpoint}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: request.message,
      sessionId: request.sessionId,
    }),
    signal: handlers.signal,
  });

  if (!response.ok || !response.body) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error?.message ||
        `Request failed with status ${response.status}`,
      response.status
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        let event = "message";
        const dataLines: string[] = [];
        for (const line of rawEvent.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }
        if (!dataLines.length) continue;

        const payload = JSON.parse(dataLines.join("\n"));
        if (event === "chunk") handlers.onChunk(payload.text);
        else if (event === "done") handlers.onDone(payload);
        else if (event === "error") {
          const err = new ApiError(payload.message || "Stream error");
          handlers.onError?.(err);
          throw err;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
