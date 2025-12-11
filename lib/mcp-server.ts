import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { processCopy, getAllRules, getRulesForUIContext, getRuleDefinitions, getRuleCategories } from './copywriter';

// Store handlers for HTTP transport access
const handlers = new Map<string, (request: any) => Promise<any>>();

/**
 * Initialize and configure the MCP server with Sitecore copywriting tools
 */
export function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'sitecore-design-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Tool definitions
  const toolDefinitions = [
    {
      name: 'copywriter',
      description:
        'Processes UI copy text and enforces Sitecore copywriting rules. Use this tool whenever UI copy text is generated or when the user asks about UI text. The tool applies rules for voice, tone, grammar, capitalization, punctuation, and component-specific guidelines (buttons, dialogs, forms, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text to process through copywriting rules',
          },
          context: {
            type: 'string',
            description: 'Optional context about where the copy will be used. Valid values: button, dialog, modal, form, field, input, checkbox, radio, alert, toast, notification, date, time, api, error, help, tooltip',
          },
        },
        required: ['text'],
      },
    },
    {
      name: 'get_copywriting_rules',
      description:
        'Returns all Sitecore UI text copywriting rules. Use this to understand the complete set of guidelines for writing UI copy, or to get rules for a specific context/component type.',
      inputSchema: {
        type: 'object',
        properties: {
          context: {
            type: 'string',
            description: 'Optional context to filter rules. Valid values: button, dialog, modal, form, field, input, checkbox, radio, alert, toast, notification, date, time, api, error, help, tooltip. If not provided, returns all rules.',
          },
        },
        required: [],
      },
    },
  ];

  // Register the tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: toolDefinitions };
  });

  // Store the handler for HTTP access
  handlers.set('tools/list', async () => {
    return { tools: toolDefinitions };
  });

  // Handle tool execution
  const handleToolCall = async (request: any) => {
    const { name, arguments: args } = request.params;

    if (name === 'copywriter') {
      // Validate input with Zod
      const schema = z.object({
        text: z.string(),
        context: z.string().optional(),
      });

      const validated = schema.parse(args);

      // Process the copy through the copywriter agent
      const result = await processCopy({
        text: validated.text,
        context: validated.context,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              processedText: result.processedText,
              originalText: result.originalText,
              applied: result.applied,
              validation: result.validation,
              relevantRules: result.relevantRules,
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_copywriting_rules') {
      // Validate input with Zod
      const schema = z.object({
        context: z.string().optional(),
      });

      const validated = schema.parse(args);

      // Get rules based on context
      const rules = validated.context 
        ? getRulesForUIContext(validated.context)
        : getAllRules();

      return {
        content: [
          {
            type: 'text',
            text: rules,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  };

  server.setRequestHandler(CallToolRequestSchema, handleToolCall);
  handlers.set('tools/call', handleToolCall);

  return server;
}

/**
 * Get handler for a specific method (for HTTP transport)
 */
export function getHandler(method: string): ((request: any) => Promise<any>) | undefined {
  return handlers.get(method);
}
