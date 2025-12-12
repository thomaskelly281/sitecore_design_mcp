export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Sitecore Design MCP Server</h1>
      <p>MCP Server with RAG capabilities for Sitecore Design documentation</p>
      <p>
        <strong>API Endpoint:</strong> <code>/api/mcp</code>
      </p>
      <p>
        <strong>Available Tools:</strong>
      </p>
      <ul>
        <li><code>search_documentation</code> - Search CSV and PDF documents</li>
        <li><code>get_document_content</code> - Get full document content</li>
        <li><code>list_documents</code> - List all available documents</li>
        <li><code>get_document_summary</code> - Get document summary</li>
      </ul>
    </div>
  );
}

