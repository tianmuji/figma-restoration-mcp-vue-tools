#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { FigmaCompareTool } from './tools/figma-compare.js';
import { SnapDOMScreenshotTool } from './tools/snapdom-screenshot.js';
import { OptimizeSVGTool } from './tools/optimize-svg.js';


class VueFigmaToolsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vue-figma-tools',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tools = {
      'figma_compare': new FigmaCompareTool(),
      'snapdom_screenshot': new SnapDOMScreenshotTool(),
      'optimize_svg': new OptimizeSVGTool(),
    };

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Object.entries(this.tools).map(([name, tool]) => ({
          name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (!this.tools[name]) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
      }

      try {
        const result = await this.tools[name].execute(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vue Figma Tools MCP server running on stdio');
  }
}

const server = new VueFigmaToolsServer();
server.run().catch(console.error);
