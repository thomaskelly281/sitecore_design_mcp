# Sitecore Design MCP - Copywriter Agent

A Model Context Protocol (MCP) server with a copywriter agent that enforces copywriting rules for UI text generation. Deployed on Vercel with HTTP transport support.

## Overview

This MCP server provides a `copywriter` tool that processes UI copy text and automatically applies predefined copywriting rules. The agent is designed to be called whenever UI copy is generated or when users ask questions about UI text.

## Features

- **Copywriter Agent**: Automatically enforces copywriting rules on UI text
- **Modular Rules System**: Easy-to-add rules configuration
- **HTTP Transport**: Compatible with MCP HTTP client specification
- **Vercel Deployment**: Pre-configured for seamless Vercel deployment
- **Type-Safe**: Full TypeScript support with Zod validation

## Project Structure

```
sitecore_design_mcp/
├── app/
│   └── api/
│       └── mcp/
│           └── route.ts         # MCP HTTP endpoint
├── lib/
│   ├── mcp-server.ts            # MCP server setup
│   └── copywriter/
│       ├── index.ts             # Copywriter agent interface
│       ├── rules.ts             # Copywriting rules (ADD YOUR RULES HERE)
│       └── processor.ts         # Rule processing logic
└── ...
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Copywriting Rules

Edit `lib/copywriter/rules.ts` to add your copywriting rules. Each rule is a function that takes a string and returns a processed string:

```typescript
export const copywritingRules: CopywritingRule[] = [
  (text: string) => {
    // Your rule logic here
    return processedText;
  },
  // Add more rules...
];
```

### 3. Local Development

```bash
npm run dev
```

The MCP server will be available at `http://localhost:3000/api/mcp`

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

#### Option B: Using Git Integration

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Import the project in the Vercel dashboard
3. Vercel will automatically detect Next.js and deploy

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and add any required environment variables:

```bash
cp .env.example .env
```

### Cursor Integration

To use this MCP server with Cursor, add the following to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "sitecore-design-mcp": {
      "url": "https://your-deployment.vercel.app/api/mcp",
      "transport": "http"
    }
  }
}
```

Replace `https://your-deployment.vercel.app` with your actual Vercel deployment URL.

## Usage

The `copywriter` tool is automatically available when the MCP server is connected. It can be called:

1. **Automatically**: When UI copy text is generated
2. **Explicitly**: When users ask questions about UI text

### Tool Parameters

- `text` (required): The text to process through copywriting rules
- `context` (optional): Context about where the copy will be used (e.g., "button label", "error message")

### Example Tool Call

```json
{
  "method": "tools/call",
  "params": {
    "name": "copywriter",
    "arguments": {
      "text": "click here to continue",
      "context": "button label"
    }
  }
}
```

## Adding Rules

To add new copywriting rules:

1. Open `lib/copywriter/rules.ts`
2. Add your rule function to the `copywritingRules` array
3. Add corresponding metadata to `ruleMetadata` array
4. Rules are applied in sequence, so order matters

Example rule:

```typescript
export const copywritingRules: CopywritingRule[] = [
  // Existing rules...
  
  // New rule: Capitalize first letter
  (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
];
```

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT

