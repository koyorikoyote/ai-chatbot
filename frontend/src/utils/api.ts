import { ChatResponse } from "../types/chat";

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

const DEFAULT_TIMEOUT = 60000; // 60 seconds

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
