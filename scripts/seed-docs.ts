#!/usr/bin/env tsx

/**
 * Document Seeding Script
 *
 * This script reads sample documentation files from the docs/ directory
 * and indexes them into ChromaDB via the /api/documents/index endpoint.
 *
 * Usage:
 *   npm run seed-docs
 *   or
 *   tsx scripts/seed-docs.ts
 *
 * Requirements: Backend server must be running on http://localhost:3000
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_ENDPOINT = process.env.API_ENDPOINT || "http://localhost:3000";
const DOCS_DIR = join(__dirname, "..", "docs");

interface Document {
  content: string;
  title: string;
  category: string;
  source: string;
}

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip hidden directories and node_modules
        if (!entry.startsWith(".") && entry !== "node_modules") {
          files.push(...findMarkdownFiles(fullPath));
        }
      } else if (stat.isFile() && extname(entry) === ".md") {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

/**
 * Extract title from markdown content (first # heading)
 */
function extractTitle(content: string, fallback: string): string {
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      return match[1].trim();
    }
  }

  return fallback;
}

/**
 * Determine category from file path
 */
function getCategoryFromPath(filePath: string): string {
  const relativePath = relative(DOCS_DIR, filePath);
  const parts = relativePath.split(/[/\\]/);

  if (parts.length > 1) {
    // Use the first directory as category
    return parts[0];
  }

  return "general";
}

/**
 * Read and parse a markdown file into a Document object
 */
function parseMarkdownFile(filePath: string): Document | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const relativePath = relative(DOCS_DIR, filePath);
    const category = getCategoryFromPath(filePath);
    const title = extractTitle(content, relativePath);

    return {
      content: content.trim(),
      title,
      category,
      source: relativePath,
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Send documents to the indexing API
 */
async function indexDocuments(documents: Document[]): Promise<void> {
  const url = `${API_ENDPOINT}/api/documents/index`;

  console.log(`\nIndexing ${documents.length} documents to ${url}...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documents }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = (await response.json()) as {
      indexed: number;
      failed: number;
      total: number;
    };

    console.log("\n✅ Indexing completed successfully!");
    console.log(`   Indexed: ${result.indexed}`);
    console.log(`   Failed: ${result.failed}`);
    console.log(`   Total: ${result.total}`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("\n❌ Error: Could not connect to backend server");
        console.error("   Make sure the backend is running on", API_ENDPOINT);
        console.error("   Start it with: cd backend && npm run dev");
      } else {
        console.error("\n❌ Error indexing documents:", error.message);
      }
    } else {
      console.error("\n❌ Unknown error:", error);
    }
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 AI Chatbot Document Seeding Script");
  console.log("=====================================\n");

  // Check if docs directory exists
  try {
    statSync(DOCS_DIR);
  } catch {
    console.error(`❌ Error: Docs directory not found at ${DOCS_DIR}`);
    process.exit(1);
  }

  console.log(`📁 Scanning for markdown files in: ${DOCS_DIR}`);

  // Find all markdown files
  const markdownFiles = findMarkdownFiles(DOCS_DIR);

  if (markdownFiles.length === 0) {
    console.log("\n⚠️  No markdown files found in docs directory");
    console.log("   Please add some .md files to the docs/ directory");
    process.exit(0);
  }

  console.log(`   Found ${markdownFiles.length} markdown file(s)\n`);

  // Parse all markdown files
  const documents: Document[] = [];

  for (const filePath of markdownFiles) {
    const relativePath = relative(DOCS_DIR, filePath);
    console.log(`📄 Processing: ${relativePath}`);

    const doc = parseMarkdownFile(filePath);
    if (doc) {
      documents.push(doc);
      console.log(`   ✓ Title: ${doc.title}`);
      console.log(`   ✓ Category: ${doc.category}`);
      console.log(`   ✓ Content length: ${doc.content.length} characters\n`);
    }
  }

  if (documents.length === 0) {
    console.log("❌ No valid documents to index");
    process.exit(1);
  }

  // Index documents
  await indexDocuments(documents);

  console.log("\n✨ Done!\n");
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
