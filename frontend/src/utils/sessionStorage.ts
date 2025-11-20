const SESSION_KEY = "chat-widget-session";
const SESSION_EXPIRY_KEY = "chat-widget-session-expiry";
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface SessionData {
  sessionId: string;
  expiresAt: number;
}

/**
 * Store session ID in localStorage with expiry timestamp
 */
export function storeSession(sessionId: string): void {
  try {
    const expiresAt = Date.now() + SESSION_TTL;
    const sessionData: SessionData = {
      sessionId,
      expiresAt,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error("Failed to store session:", error);
  }
}

/**
 * Retrieve session ID from localStorage if not expired
 * Returns null if session doesn't exist or has expired
 */
export function retrieveSession(): string | null {
  try {
    const storedData = localStorage.getItem(SESSION_KEY);
    if (!storedData) {
      return null;
    }

    const sessionData: SessionData = JSON.parse(storedData);
    const now = Date.now();

    // Check if session has expired
    if (now >= sessionData.expiresAt) {
      clearSession();
      return null;
    }

    return sessionData.sessionId;
  } catch (error) {
    console.error("Failed to retrieve session:", error);
    clearSession();
    return null;
  }
}

/**
 * Clear session data from localStorage
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch (error) {
    console.error("Failed to clear session:", error);
  }
}

/**
 * Check if a valid session exists
 */
export function hasValidSession(): boolean {
  return retrieveSession() !== null;
}
