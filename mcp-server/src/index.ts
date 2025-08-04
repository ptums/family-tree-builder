import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { FamilyTreeDatabase } from "./database.js";
import { AIService } from "./ai-service.js";
import { CreateFamilyNodeRequest, UpdateFamilyNodeRequest } from "./types.js";

const server = new Server({
  name: "barnwell-family-tree-mcp",
  version: "1.0.0",
});

const db = new FamilyTreeDatabase();
const ai = new AIService();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_all_family_nodes",
        description: "Retrieve all family members from the database",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "create_family_node",
        description: "Create a new family member node",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Full name of the family member",
            },
            birth: {
              type: "string",
              description: "Birth date in YYYY-MM-DD format",
            },
            birthLocation: {
              type: "string",
              description: "Birth location",
            },
            death: {
              type: "string",
              description: "Death date in YYYY-MM-DD format",
            },
            deathLocation: {
              type: "string",
              description: "Death location",
            },
            fatherId: {
              type: "string",
              description: "ID of the father",
            },
            motherId: {
              type: "string",
              description: "ID of the mother",
            },
            occupation: {
              type: "string",
              description: "Occupation",
            },
            gender: {
              type: "string",
              enum: ["male", "female"],
              description: "Gender",
            },
            spouses: {
              type: "array",
              items: { type: "string" },
              description: "Array of spouse IDs",
            },
            children: {
              type: "array",
              items: { type: "string" },
              description: "Array of child IDs",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "update_family_node",
        description: "Update an existing family member node",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "ID of the node to update",
            },
            name: {
              type: "string",
              description: "Full name of the family member",
            },
            birth: {
              type: "string",
              description: "Birth date in YYYY-MM-DD format",
            },
            birthLocation: {
              type: "string",
              description: "Birth location",
            },
            death: {
              type: "string",
              description: "Death date in YYYY-MM-DD format",
            },
            deathLocation: {
              type: "string",
              description: "Death location",
            },
            fatherId: {
              type: "string",
              description: "ID of the father",
            },
            motherId: {
              type: "string",
              description: "ID of the mother",
            },
            occupation: {
              type: "string",
              description: "Occupation",
            },
            gender: {
              type: "string",
              enum: ["male", "female"],
              description: "Gender",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "get_family_node_by_id",
        description: "Get a specific family member by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "ID of the family member",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "search_family_nodes",
        description:
          "Search for family members by name, location, or occupation",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "ai_suggest_family_node",
        description: "Use AI to suggest a family node based on a description",
        inputSchema: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Natural language description of the family member",
            },
          },
          required: ["description"],
        },
      },
      {
        name: "ai_suggest_relationships",
        description:
          "Use AI to suggest potential relationships for a family member",
        inputSchema: {
          type: "object",
          properties: {
            nodeName: {
              type: "string",
              description: "Name of the family member",
            },
          },
          required: ["nodeName"],
        },
      },
      {
        name: "ai_validate_family_node",
        description:
          "Use AI to validate family node data and suggest improvements",
        inputSchema: {
          type: "object",
          properties: {
            node: {
              type: "object",
              description: "Family node data to validate",
            },
          },
          required: ["node"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_all_family_nodes": {
        const nodes = await db.getAllNodes();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(nodes, null, 2),
            },
          ],
        };
      }

      case "create_family_node": {
        const result = await db.createNode(
          args as unknown as CreateFamilyNodeRequest
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "update_family_node": {
        const result = await db.updateNode(
          args as unknown as UpdateFamilyNodeRequest
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_family_node_by_id": {
        const node = await db.getNodeById(args?.id as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(node, null, 2),
            },
          ],
        };
      }

      case "search_family_nodes": {
        const nodes = await db.searchNodes(args?.query as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(nodes, null, 2),
            },
          ],
        };
      }

      case "ai_suggest_family_node": {
        const existingNodes = await db.getAllNodes();
        const suggestion = await ai.suggestFamilyNodeCreation(
          args?.description as string,
          existingNodes
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(suggestion, null, 2),
            },
          ],
        };
      }

      case "ai_suggest_relationships": {
        const existingNodes = await db.getAllNodes();
        const suggestions = await ai.suggestRelationships(
          args?.nodeName as string,
          existingNodes
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(suggestions, null, 2),
            },
          ],
        };
      }

      case "ai_validate_family_node": {
        const validation = await ai.validateFamilyNode(
          args?.node as unknown as CreateFamilyNodeRequest
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(validation, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
