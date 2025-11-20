import { FastifyRequest, FastifyReply } from "fastify";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_MAX = 20; // 20 requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

/**
 * Rate limiting middleware
 * Limits requests to 20 per minute per session ID
 */
export async function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Get session ID from request body or generate a temporary one based on IP
  const body = request.body as { sessionId?: string } | undefined;
  const sessionId = body?.sessionId || `ip-${request.ip || "unknown"}`;

  const now = Date.now();
  const entry = rateLimitStore.get(sessionId);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    cleanupExpiredEntries(now);
  }

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitStore.set(sessionId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    reply.header("Retry-After", retryAfter.toString());
    reply.status(429).send({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later",
        retryAfter,
      },
    });
    return;
  }

  // Increment counter
  entry.count++;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get current rate limit status for a session (for testing)
 */
export function getRateLimitStatus(sessionId: string): RateLimitEntry | null {
  return rateLimitStore.get(sessionId) || null;
}

/**
 * Clear rate limit for a session (for testing)
 */
export function clearRateLimit(sessionId?: string) {
  if (sessionId) {
    rateLimitStore.delete(sessionId);
  } else {
    rateLimitStore.clear();
  }
}
