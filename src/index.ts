#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
// @ts-expect-error: No types for 'pdf-parse'
import pdfParse from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SERVER_NAME = "sitecore-design-mcp-server";
const SERVER_VERSION = "1.0.0";

// Path to document directories
const DOCS_DIR = join(__dirname, "..", "docs");
const CSV_DIR = join(DOCS_DIR, "csv");
const PDF_DIR = join(DOCS_DIR, "pdf");

// Document types
type DocumentType = "csv" | "pdf";

// In-memory cache for parsed document content
interface DocumentChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
}

interface ParsedDocument {
  filename: string;
  fullText: string;
  chunks: DocumentChunk[];
  pageCount: number;
  parsedAt: Date;
  type: DocumentType;
}

const documentCache: Map<string, ParsedDocument> = new Map();

/**
 * Validate filename to prevent path traversal attacks
 */
function validateFilename(filename: string): void {
  if (!filename || filename.length === 0) {
    throw new Error("Filename cannot be empty");
  }
  
  // Check for path traversal attempts
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    throw new Error(`Invalid filename: ${filename}. Filename cannot contain path separators or parent directory references.`);
  }
  
  // Check for absolute paths (Windows and Unix)
  if (filename.startsWith("/") || /^[A-Za-z]:/.test(filename)) {
    throw new Error(`Invalid filename: ${filename}. Filename cannot be an absolute path.`);
  }
}

/**
 * Split text into semantic chunks for better retrieval
 */
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Keep overlap from previous chunk
      const words = currentChunk.split(" ");
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(" ") + " " + sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Parse a CSV value, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Parse a CSV file and cache the results
 */
async function parseCSV(filename: string): Promise<ParsedDocument> {
  validateFilename(filename);
  
  const cacheKey = `csv:${filename}`;
  
  if (documentCache.has(cacheKey)) {
    return documentCache.get(cacheKey)!;
  }

  const filepath = join(CSV_DIR, filename);
  
  if (!existsSync(filepath)) {
    throw new Error(`CSV file not found: ${filename}. Please ensure the file exists in the docs/csv directory.`);
  }

  const csvContent = readFileSync(filepath, "utf-8");
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error(`CSV file is empty: ${filename}`);
  }

  // Parse headers from first line
  const headers = parseCSVLine(lines[0]);
  const headerCount = headers.length;
  
  // Parse data rows and convert to readable text
  const rows = lines.slice(1);
  const textContent = rows.map((row, rowIndex) => {
    const values = parseCSVLine(row);
    
    // Validate column count matches headers
    if (values.length !== headerCount) {
      console.warn(`Row ${rowIndex + 2} has ${values.length} columns but expected ${headerCount}. Padding with empty values.`);
    }
    
    // Pad or truncate values to match header count
    const paddedValues = Array.from({ length: headerCount }, (_, i) => values[i] || "");
    
    return headers.map((header, i) => `${header}: ${paddedValues[i]}`).join(" | ");
  }).join("\n\n");

  const chunks = chunkText(textContent).map((content, index) => ({
    content,
    pageNumber: 1,
    chunkIndex: index,
  }));

  const parsedDoc: ParsedDocument = {
    filename,
    fullText: textContent,
    chunks,
    pageCount: 1,
    parsedAt: new Date(),
    type: "csv",
  };

  documentCache.set(cacheKey, parsedDoc);
  return parsedDoc;
}

/**
 * Parse a PDF file and cache the results
 */
async function parsePDF(filename: string): Promise<ParsedDocument> {
  validateFilename(filename);
  
  const cacheKey = `pdf:${filename}`;
  
  if (documentCache.has(cacheKey)) {
    return documentCache.get(cacheKey)!;
  }

  const filepath = join(PDF_DIR, filename);
  
  if (!existsSync(filepath)) {
    throw new Error(`PDF file not found: ${filename}. Please ensure the file exists in the docs/pdf directory.`);
  }

  const dataBuffer = readFileSync(filepath);
  const pdfData = await pdfParse(dataBuffer);
  
  const chunks = chunkText(pdfData.text).map((content, index) => ({
    content,
    pageNumber: Math.floor(index / 3) + 1, // Approximate page mapping
    chunkIndex: index,
  }));

  const parsedDoc: ParsedDocument = {
    filename,
    fullText: pdfData.text,
    chunks,
    pageCount: pdfData.numpages,
    parsedAt: new Date(),
    type: "pdf",
  };

  documentCache.set(cacheKey, parsedDoc);
  return parsedDoc;
}

/**
 * Parse a document based on its type
 */
async function parseDocument(filename: string, type: DocumentType): Promise<ParsedDocument> {
  if (type === "csv") {
    return parseCSV(filename);
  } else {
    return parsePDF(filename);
  }
}

/**
 * Simple keyword-based search (can be enhanced with embeddings)
 */
function searchDocument(doc: ParsedDocument, query: string, topK: number = 5): DocumentChunk[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  const scoredChunks = doc.chunks.map(chunk => {
    const lowerContent = chunk.content.toLowerCase();
    let score = 0;
    
    for (const term of queryTerms) {
      // Count occurrences of each term
      const regex = new RegExp(term, "gi");
      const matches = lowerContent.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    
    // Bonus for exact phrase match
    if (lowerContent.includes(query.toLowerCase())) {
      score += 10;
    }
    
    return { chunk, score };
  });

  return scoredChunks
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk);
}

/**
 * Get list of available CSV files
 */
function getAvailableCSVs(): string[] {
  if (!existsSync(CSV_DIR)) {
    return [];
  }
  
  const files = readdirSync(CSV_DIR);
  return files.filter((file: string) => file.toLowerCase().endsWith(".csv"));
}

/**
 * Get list of available PDF files
 */
function getAvailablePDFs(): string[] {
  if (!existsSync(PDF_DIR)) {
    return [];
  }
  
  const files = readdirSync(PDF_DIR);
  return files.filter((file: string) => file.toLowerCase().endsWith(".pdf"));
}

/**
 * Get all available documents with their types
 */
function getAllDocuments(): Array<{ filename: string; type: DocumentType }> {
  const csvFiles = getAvailableCSVs().map(f => ({ filename: f, type: "csv" as DocumentType }));
  const pdfFiles = getAvailablePDFs().map(f => ({ filename: f, type: "pdf" as DocumentType }));
  return [...csvFiles, ...pdfFiles];
}

// Create the MCP server
const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
});

// Tool: Search documentation
server.tool(
  "search_documentation",
  "Search the Sitecore Design documentation for relevant information based on a query. Searches across both CSV and PDF documents. Returns the most relevant chunks of text.",
  {
    query: z.string().describe("The search query to find relevant documentation"),
    filename: z.string().optional().describe("Optional: specific filename to search"),
    type: z.enum(["csv", "pdf"]).optional().describe("Optional: document type to search (csv or pdf). If not provided, searches all documents."),
    topK: z.number().optional().default(5).describe("Number of top results to return (default: 5)"),
  },
  async ({ query, filename, type, topK = 5 }) => {
    try {
      let documentsToSearch: Array<{ filename: string; type: DocumentType }>;
      
      if (filename && type) {
        documentsToSearch = [{ filename, type }];
      } else if (type) {
        const files = type === "csv" ? getAvailableCSVs() : getAvailablePDFs();
        documentsToSearch = files.map(f => ({ filename: f, type }));
      } else {
        documentsToSearch = getAllDocuments();
      }
      
      if (documentsToSearch.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No documents found. Please add CSV files to 'docs/csv' or PDF files to 'docs/pdf'.",
            },
          ],
        };
      }

      const allResults: Array<{ filename: string; docType: DocumentType; chunk: DocumentChunk }> = [];

      for (const doc of documentsToSearch) {
        try {
          const parsedDoc = await parseDocument(doc.filename, doc.type);
          const results = searchDocument(parsedDoc, query, topK);
          allResults.push(...results.map(chunk => ({ 
            filename: doc.filename, 
            docType: doc.type,
            chunk 
          })));
        } catch (error) {
          console.error(`Error processing ${doc.filename}:`, error);
        }
      }

      if (allResults.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No relevant results found for query: "${query}"`,
            },
          ],
        };
      }

      // Sort by relevance and take top K
      const topResults = allResults.slice(0, topK);

      const formattedResults = topResults.map((result, index) => 
        `### Result ${index + 1} (from ${result.filename} [${result.docType.toUpperCase()}])\n\n${result.chunk.content}`
      ).join("\n\n---\n\n");

      return {
        content: [
          {
            type: "text" as const,
            text: `# Search Results for: "${query}"\n\nFound ${topResults.length} relevant section(s):\n\n${formattedResults}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error searching documentation: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Get full document content
server.tool(
  "get_document_content",
  "Retrieve the full text content of a specific document (CSV or PDF) from the Sitecore Design documentation.",
  {
    filename: z.string().describe("The filename to retrieve (e.g., 'design-guide.pdf' or 'components.csv')"),
    type: z.enum(["csv", "pdf"]).describe("The document type: 'csv' or 'pdf'"),
  },
  async ({ filename, type }) => {
    try {
      const doc = await parseDocument(filename, type);
      
      return {
        content: [
          {
            type: "text" as const,
            text: `# Document: ${filename} [${type.toUpperCase()}]\n\n**Type:** ${type.toUpperCase()}\n**Pages/Rows:** ${doc.pageCount}\n**Parsed at:** ${doc.parsedAt.toISOString()}\n\n---\n\n${doc.fullText}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error retrieving document: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: List available documents
server.tool(
  "list_documents",
  "List all available documents (both CSV and PDF) in the Sitecore Design documentation.",
  {},
  async () => {
    try {
      const csvFiles = getAvailableCSVs();
      const pdfFiles = getAvailablePDFs();
      
      if (csvFiles.length === 0 && pdfFiles.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No documents found. Please add:\n- CSV files to the 'docs/csv' directory\n- PDF files to the 'docs/pdf' directory",
            },
          ],
        };
      }

      let documentList = "# Available Documents\n\n";
      
      if (csvFiles.length > 0) {
        documentList += "## CSV Files\n\n";
        documentList += csvFiles.map((csv, index) => `${index + 1}. ${csv}`).join("\n");
        documentList += "\n\n";
      }
      
      if (pdfFiles.length > 0) {
        documentList += "## PDF Files\n\n";
        documentList += pdfFiles.map((pdf, index) => `${index + 1}. ${pdf}`).join("\n");
        documentList += "\n\n";
      }
      
      documentList += "---\n\nUse `search_documentation` to search within these documents, or `get_document_content` with the filename and type to retrieve full content.";

      return {
        content: [
          {
            type: "text" as const,
            text: documentList,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing documents: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Get document summary
server.tool(
  "get_document_summary",
  "Get a summary of a document including metadata and a brief overview of its contents.",
  {
    filename: z.string().describe("The filename to summarize"),
    type: z.enum(["csv", "pdf"]).describe("The document type: 'csv' or 'pdf'"),
  },
  async ({ filename, type }) => {
    try {
      const doc = await parseDocument(filename, type);
      
      // Extract first few chunks as overview
      const previewChunks = doc.chunks.slice(0, 3);
      const preview = previewChunks.map(c => c.content).join("\n\n");
      
      return {
        content: [
          {
            type: "text" as const,
            text: `# Document Summary: ${filename}\n\n**Type:** ${type.toUpperCase()}\n**Pages:** ${doc.pageCount}\n**Total chunks:** ${doc.chunks.length}\n**Character count:** ${doc.fullText.length}\n\n## Preview\n\n${preview}\n\n---\n\n*Use \`get_document_content\` to retrieve the full document or \`search_documentation\` to search for specific topics.*`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error getting document summary: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
