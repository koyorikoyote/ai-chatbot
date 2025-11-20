import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private ttl: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttlHours: number = 24) {
    this.ttl = ttlHours * 60 * 60 * 1000;
    this.startCleanup();
  }

  createSession(): string {
    const sessionId = uuidv4();
    const now = new Date();

    const session: Session = {
      id: sessionId,
      messages: [],
      createdAt: now,
      lastActivity: now,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getContext(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return [];
    }

    // Check if session has expired
    const now = new Date();
    const timeSinceLastActivity =
      now.getTime() - session.lastActivity.getTime();

    if (timeSinceLastActivity > this.ttl) {
      // Session expired, remove it
      this.sessions.delete(sessionId);
      return [];
    }

    // Update last activity
    session.lastActivity = now;

    return session.messages;
  }

  addMessage(
    sessionId: string,
    message: Omit<Message, "id" | "timestamp">
  ): void {
    let session = this.sessions.get(sessionId);

    // If session doesn't exist or has expired, create a new one
    if (!session) {
      const newSessionId = this.createSession();
      session = this.sessions.get(newSessionId)!;
      // Update the session ID to match the requested one
      this.sessions.delete(newSessionId);
      session.id = sessionId;
      this.sessions.set(sessionId, session);
    }

    const fullMessage: Message = {
      id: uuidv4(),
      role: message.role,
      content: message.content,
      timestamp: new Date(),
    };

    session.messages.push(fullMessage);
    session.lastActivity = new Date();
  }

  sessionExists(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    // Check if session has expired
    const now = new Date();
    const timeSinceLastActivity =
      now.getTime() - session.lastActivity.getTime();

    if (timeSinceLastActivity > this.ttl) {
      this.sessions.delete(sessionId);
      return false;
    }

    return true;
  }

  private startCleanup(): void {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastActivity =
        now.getTime() - session.lastActivity.getTime();

      if (timeSinceLastActivity > this.ttl) {
        this.sessions.delete(sessionId);
      }
    }
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // For testing purposes
  clearAllSessions(): void {
    this.sessions.clear();
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}
