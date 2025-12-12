# Sitecore Design MCP Server

A Model Context Protocol (MCP) server with RAG (Retrieval-Augmented Generation) capabilities for Sitecore Design documentation. This server allows AI assistants to search and retrieve information from PDF documents.

## Features

- 🔍 **Search Documentation**: Keyword search across CSV and PDF documents
- 📄 **Full Document Access**: Retrieve complete document content
- 📋 **Document Listing**: View all available CSV and PDF documentation
- 📊 **Document Summaries**: Get quick overviews of documents
- 📁 **Multi-format Support**: Works with both CSV and PDF files

## Available Tools

| Tool | Description |
|------|-------------|
| `search_documentation` | Search for relevant information using keywords |
| `get_document_content` | Retrieve the full text of a specific PDF |
| `list_documents` | List all available PDF documents |
| `get_document_summary` | Get a summary and preview of a document |

## Project Structure

```
sitecore-design-mcp-server/
├── api/
│   └── mcp.ts              # Vercel serverless function
├── docs/
│   ├── csv/                # Your CSV documents go here
│   │   └── *.csv
│   └── pdf/                # Your PDF documents go here
│       └── *.pdf
├── src/
│   ├── index.ts            # STDIO MCP server (local development)
│   └── http-server.ts      # HTTP server utilities
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## Setup

### Prerequisites

- Node.js 18 or later
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sitecore-design-mcp-server.git
cd sitecore-design-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Adding Documents

Place your documents in the appropriate subdirectory:

```
docs/
├── csv/
│   ├── components.csv
│   ├── design-tokens.csv
│   └── color-palette.csv
└── pdf/
    ├── sitecore-design-guide.pdf
    ├── component-library.pdf
    └── branding-guidelines.pdf
```

**CSV Format:** The first row should contain headers. Each subsequent row represents a record that will be searchable.

## Local Development

### Running with STDIO (for Claude Desktop, Cursor, etc.)

```bash
npm run build
node dist/index.js
```

### Development Mode

```bash
npm run dev
```

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on push

### After Deployment

Your MCP server will be available at:
- **Endpoint**: `https://your-project.vercel.app/api/mcp`
- **Alias**: `https://your-project.vercel.app/mcp`

## Client Configuration

### Claude Desktop

Add to your Claude Desktop config (`~/.config/claude/claude_desktop_config.json` on macOS/Linux or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "sitecore-design": {
      "command": "node",
      "args": ["/path/to/sitecore-design-mcp-server/dist/index.js"]
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "sitecore-design": {
      "command": "node",
      "args": ["/path/to/sitecore-design-mcp-server/dist/index.js"]
    }
  }
}
```

### Remote (Vercel) Configuration

For remote MCP server access via HTTP:

```json
{
  "mcpServers": {
    "sitecore-design": {
      "url": "https://your-project.vercel.app/api/mcp"
    }
  }
}
```

## API Usage

### GET /api/mcp

Returns server information and available tools.

### POST /api/mcp

Send JSON-RPC 2.0 requests:

```bash
# Initialize
curl -X POST https://your-project.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'

# List tools
curl -X POST https://your-project.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# Search documentation
curl -X POST https://your-project.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_documentation","arguments":{"query":"button component"}}}'

# List documents
curl -X POST https://your-project.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"list_documents","arguments":{}}}'
```

## Best Practices

### Security

- Validate all file paths to prevent directory traversal
- Use environment variables for sensitive configuration
- Implement rate limiting in production

### Performance

- PDFs are cached in memory after first parse
- Use specific filenames when possible to reduce search scope
- Consider document size limits for serverless environments

### Logging

- Logs are written to stderr to avoid interfering with STDIO protocol
- Use structured logging in production

## Development

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## References

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Vercel MCP Deployment Guide](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)

## License

MIT

