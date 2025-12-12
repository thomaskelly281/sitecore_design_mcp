# MCP Configuration Guide

This guide shows how to configure the Sitecore Design MCP server for different clients.

## Option 1: Local STDIO Server (Recommended for Local Development)

For local usage with Claude Desktop, Cursor, or other MCP clients:

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json` (macOS/Linux) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "sitecore-design": {
      "command": "node",
      "args": ["C:/Users/kell_/Documents/GitHub/sitecore_design_mcp/dist/src/index.js"]
    }
  }
}
```

**Important:** Replace the path with your actual project path.

### Cursor

Add to your Cursor MCP settings (usually in Settings → Features → Model Context Protocol):

```json
{
  "mcpServers": {
    "sitecore-design": {
      "command": "node",
      "args": ["C:/Users/kell_/Documents/GitHub/sitecore_design_mcp/dist/src/index.js"]
    }
  }
}
```

### Prerequisites for STDIO Mode

1. Build the stdio server:
   ```bash
   npm run build:stdio
   ```

2. Ensure Node.js is in your PATH

3. Make sure the `dist/src/index.js` file exists

## Option 2: Remote HTTP Server (For Deployed Instances)

If you've deployed the server to Vercel or another hosting platform:

```json
{
  "mcpServers": {
    "sitecore-design": {
      "url": "https://your-project.vercel.app/api/mcp"
    }
  }
}
```

Replace `https://your-project.vercel.app` with your actual Vercel deployment URL.

## Finding Your Project Path

**Windows:**
- Right-click the project folder → Properties → Copy the "Location" path
- Or use PowerShell: `(Get-Location).Path`

**macOS/Linux:**
- Use: `pwd` in terminal
- Or: `realpath .` to get absolute path

## Testing Your Configuration

After configuring, restart your MCP client (Claude Desktop, Cursor, etc.) and verify the server connects successfully.

