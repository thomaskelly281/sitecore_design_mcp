/**
 * Vercel Serverless Function for MCP Server
 * 
 * This handles both SSE connections and message posting for the MCP protocol.
 * Supports both CSV and PDF documents.
 * Deploy to Vercel and access at: /api/mcp
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import pdfParse from "pdf-parse";

// Configuration
const SERVER_NAME = "sitecore-design-mcp-server";
const SERVER_VERSION = "1.0.0";

// Path to document directories (relative to project root in Vercel)
const DOCS_DIR = join(process.cwd(), "docs");
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
 * Split text into semantic chunks
 */
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
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
        i++;
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
    throw new Error(`CSV file not found: ${filename}`);
  }

  const csvContent = readFileSync(filepath, "utf-8");
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error(`CSV file is empty: ${filename}`);
  }

  const headers = parseCSVLine(lines[0]);
  const headerCount = headers.length;
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
    throw new Error(`PDF file not found: ${filename}`);
  }

  const dataBuffer = readFileSync(filepath);
  const pdfData = await pdfParse(dataBuffer);
  
  const chunks = chunkText(pdfData.text).map((content, index) => ({
    content,
    pageNumber: Math.floor(index / 3) + 1,
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
 * Search within a document
 */
function searchDocument(doc: ParsedDocument, query: string, topK: number = 5): DocumentChunk[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  const scoredChunks = doc.chunks.map(chunk => {
    const lowerContent = chunk.content.toLowerCase();
    let score = 0;
    
    for (const term of queryTerms) {
      const regex = new RegExp(term, "gi");
      const matches = lowerContent.match(regex);
      if (matches) score += matches.length;
    }
    
    if (lowerContent.includes(query.toLowerCase())) score += 10;
    
    return { chunk, score };
  });

  return scoredChunks
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk);
}

/**
 * Get available CSVs
 */
function getAvailableCSVs(): string[] {
  if (!existsSync(CSV_DIR)) return [];
  const files = readdirSync(CSV_DIR);
  return files.filter((file: string) => file.toLowerCase().endsWith(".csv"));
}

/**
 * Get available PDFs
 */
function getAvailablePDFs(): string[] {
  if (!existsSync(PDF_DIR)) return [];
  const files = readdirSync(PDF_DIR);
  return files.filter((file: string) => file.toLowerCase().endsWith(".pdf"));
}

/**
 * Get all documents
 */
function getAllDocuments(): Array<{ filename: string; type: DocumentType }> {
  const csvFiles = getAvailableCSVs().map(f => ({ filename: f, type: "csv" as DocumentType }));
  const pdfFiles = getAvailablePDFs().map(f => ({ filename: f, type: "pdf" as DocumentType }));
  return [...csvFiles, ...pdfFiles];
}

/**
 * Execute a tool
 */
async function executeTool(name: string, args: Record<string, unknown>): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  switch (name) {
    case "search_documentation": {
      const query = args.query as string;
      const filename = args.filename as string | undefined;
      const type = args.type as DocumentType | undefined;
      const topK = (args.topK as number) || 5;

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
        return { content: [{ type: "text", text: "No documents found. Add CSV files to 'docs/csv' or PDF files to 'docs/pdf'." }] };
      }

      const allResults: Array<{ filename: string; docType: DocumentType; chunk: DocumentChunk }> = [];

      for (const doc of documentsToSearch) {
        try {
          const parsedDoc = await parseDocument(doc.filename, doc.type);
          const results = searchDocument(parsedDoc, query, topK);
          allResults.push(...results.map(chunk => ({ filename: doc.filename, docType: doc.type, chunk })));
        } catch (e) {
          console.error(e);
        }
      }

      if (allResults.length === 0) {
        return { content: [{ type: "text", text: `No results for: "${query}"` }] };
      }

      const topResults = allResults.slice(0, topK);
      const formatted = topResults.map((r, i) => 
        `### Result ${i + 1} (${r.filename} [${r.docType.toUpperCase()}])\n\n${r.chunk.content}`
      ).join("\n\n---\n\n");
      
      return { content: [{ type: "text", text: `# Search Results: "${query}"\n\n${formatted}` }] };
    }

    case "get_document_content": {
      const filename = args.filename as string;
      const type = args.type as DocumentType;
      const doc = await parseDocument(filename, type);
      return { 
        content: [{ 
          type: "text", 
          text: `# ${filename} [${type.toUpperCase()}]\n\n**Pages:** ${doc.pageCount}\n\n---\n\n${doc.fullText}` 
        }] 
      };
    }

    case "list_documents": {
      const csvFiles = getAvailableCSVs();
      const pdfFiles = getAvailablePDFs();

      if (csvFiles.length === 0 && pdfFiles.length === 0) {
        return { content: [{ type: "text", text: "No documents found.\n\nAdd CSV files to 'docs/csv' or PDF files to 'docs/pdf'." }] };
      }

      let text = "# Available Documents\n\n";
      
      if (csvFiles.length > 0) {
        text += "## CSV Files\n\n" + csvFiles.map((f, i) => `${i + 1}. ${f}`).join("\n") + "\n\n";
      }
      
      if (pdfFiles.length > 0) {
        text += "## PDF Files\n\n" + pdfFiles.map((f, i) => `${i + 1}. ${f}`).join("\n");
      }

      return { content: [{ type: "text", text }] };
    }

    case "get_document_summary": {
      const filename = args.filename as string;
      const type = args.type as DocumentType;
      const doc = await parseDocument(filename, type);
      const preview = doc.chunks.slice(0, 3).map(c => c.content).join("\n\n");
      return { 
        content: [{ 
          type: "text", 
          text: `# Summary: ${filename} [${type.toUpperCase()}]\n\n**Pages:** ${doc.pageCount}\n**Chunks:** ${doc.chunks.length}\n\n## Preview\n\n${preview}` 
        }] 
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Handle MCP JSON-RPC requests
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      description: "Sitecore Design MCP Server with RAG capabilities for CSV and PDF documents",
      tools: [
        "search_documentation",
        "get_document_content", 
        "list_documents",
        "get_document_summary"
      ],
    });
  }

  if (req.method === "POST") {
    try {
      const { method, params, id } = req.body;

      // Handle JSON-RPC initialize
      if (method === "initialize") {
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: SERVER_NAME,
              version: SERVER_VERSION,
            },
          },
        });
      }

      // Handle tools/list
      if (method === "tools/list") {
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: [
              {
                name: "search_documentation",
                description: "Search the Sitecore Design documentation (CSV and PDF) for relevant information",
                inputSchema: {
                  type: "object",
                  properties: {
                    query: { type: "string", description: "The search query" },
                    filename: { type: "string", description: "Specific filename to search" },
                    type: { type: "string", enum: ["csv", "pdf"], description: "Document type to search" },
                    topK: { type: "number", description: "Number of results to return", default: 5 },
                  },
                  required: ["query"],
                },
              },
              {
                name: "get_document_content",
                description: "Get full content of a document (CSV or PDF)",
                inputSchema: {
                  type: "object",
                  properties: {
                    filename: { type: "string", description: "The filename" },
                    type: { type: "string", enum: ["csv", "pdf"], description: "Document type" },
                  },
                  required: ["filename", "type"],
                },
              },
              {
                name: "list_documents",
                description: "List all available documents (CSV and PDF)",
                inputSchema: {
                  type: "object",
                  properties: {},
                  required: [],
                },
              },
              {
                name: "get_document_summary",
                description: "Get a summary of a document",
                inputSchema: {
                  type: "object",
                  properties: {
                    filename: { type: "string", description: "The filename" },
                    type: { type: "string", enum: ["csv", "pdf"], description: "Document type" },
                  },
                  required: ["filename", "type"],
                },
              },
            ],
          },
        });
      }

      // Handle tools/call
      if (method === "tools/call") {
        const { name, arguments: args } = params;
        
        try {
          const result = await executeTool(name, args || {});
          return res.status(200).json({
            jsonrpc: "2.0",
            id,
            result,
          });
        } catch (error) {
          return res.status(200).json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
              isError: true,
            },
          });
        }
      }

      // Unknown method
      return res.status(400).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      });
    } catch (error) {
      console.error("Error handling request:", error);
      return res.status(500).json({
        jsonrpc: "2.0",
        id: req.body?.id,
        error: { 
          code: -32603, 
          message: error instanceof Error ? error.message : "Internal error" 
        },
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
