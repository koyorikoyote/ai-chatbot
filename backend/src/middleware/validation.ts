import { z } from "zod";

// Chat request schema
export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters")
    .transform((val) => sanitizeInput(val)),
  sessionId: z.string().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// Document indexing request schema
export const documentIndexRequestSchema = z.object({
  documents: z.array(
    z.object({
      content: z.string().min(1, "Document content cannot be empty"),
      title: z.string().min(1, "Document title is required"),
      category: z.string().min(1, "Document category is required"),
      source: z.string().min(1, "Document source is required"),
    })
  ),
});

export type DocumentIndexRequest = z.infer<typeof documentIndexRequestSchema>;

/**
 * Sanitize user input to prevent prompt injection attacks
 * Removes or escapes potentially malicious patterns
 */
export function sanitizeInput(input: string): string {
  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove excessive newlines (more than 2 consecutive)
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n");

  // Remove control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // Escape common prompt injection patterns
  // Remove system-like instructions at the start
  const systemPatterns = [
    /^(system|assistant|user):\s*/gi,
    /^ignore (previous|all) (instructions|prompts)/gi,
    /^disregard (previous|all) (instructions|prompts)/gi,
  ];

  for (const pattern of systemPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }

  return sanitized;
}
