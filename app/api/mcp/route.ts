import { NextRequest, NextResponse } from 'next/server';
import { createMcpServer, getHandler } from '@/lib/mcp-server';

// Initialize the MCP server instance (singleton)
const mcpServer = createMcpServer();

// CORS headers for MCP HTTP transport
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Handle MCP HTTP transport requests
 * Supports both GET (for server info) and POST (for JSON-RPC requests)
 */
export async function GET(request: NextRequest) {
  try {
    // Return server information for MCP HTTP transport
    return NextResponse.json({
      protocol: 'mcp',
      version: '2024-11-05',
      server: {
        name: 'sitecore-design-mcp',
        version: '0.1.0',
      },
      capabilities: {
        tools: {},
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('MCP GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle MCP protocol requests via POST (JSON-RPC 2.0)
 * This is the main endpoint for MCP tool calls
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate JSON-RPC 2.0 format
    if (!body.jsonrpc || body.jsonrpc !== '2.0') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id || null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0"',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body.method) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id || null,
          error: {
            code: -32600,
            message: 'Invalid Request: method is required',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle MCP protocol requests
    let response;
    
    try {
      // Call the appropriate handler based on method
      if (body.method === 'tools/list') {
        const handler = getHandler('tools/list');
        if (handler) {
          response = await handler({ params: body.params || {} });
        } else {
          throw new Error('tools/list handler not found');
        }
      } else if (body.method === 'prompts/list') {
        const handler = getHandler('prompts/list');
        if (handler) {
          response = await handler({ params: body.params || {} });
        } else {
          throw new Error('prompts/list handler not found');
        }
      } else if (body.method === 'tools/call') {
        const handler = getHandler('tools/call');
        if (handler) {
          // Log the request for debugging
          console.log('tools/call request:', JSON.stringify(body, null, 2));
          // body.params should contain { name: '...', arguments: {...} }
          response = await handler({ params: body.params || {} });
          console.log('tools/call response:', JSON.stringify(response, null, 2));
        } else {
          throw new Error('tools/call handler not found');
        }
      } else if (body.method === 'initialize') {
        // Handle initialize request - must return proper capabilities
        // The tools capability indicates we support tools
        response = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            prompts: {},
          },
          serverInfo: {
            name: 'sitecore-design-mcp',
            version: '0.1.0',
          },
        };
      } else if (body.method === 'notifications/initialized') {
        // Handle initialized notification (no response needed)
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id || null,
          result: null,
        }, { headers: corsHeaders });
      } else {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id: body.id || null,
            error: {
              code: -32601,
              message: `Method not found: ${body.method}`,
            },
          },
          { status: 404, headers: corsHeaders }
        );
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id || null,
        result: response,
      }, { headers: corsHeaders });
    } catch (handlerError) {
      // Handle errors from the handler
      console.error('Handler error:', handlerError);
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id || null,
          error: {
            code: -32603,
            message: handlerError instanceof Error ? handlerError.message : 'Internal error',
          },
        },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('MCP POST error:', error);
    
    // Return error in JSON-RPC format
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: error instanceof Error ? error.message : 'Parse error',
        },
      },
      { status: 400, headers: corsHeaders }
    );
  }
}

