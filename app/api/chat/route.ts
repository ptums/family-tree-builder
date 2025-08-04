import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import OpenAI from "openai";
import { spawn } from "child_process";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(DATABASE_URL);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
  message: string;
  action?: string;
}

interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

// Helper function to call MCP server
async function callMCPServer(method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const mcpServerPath = path.join(
      process.cwd(),
      "mcp-server",
      "dist",
      "index.js"
    );
    const mcpProcess = spawn("node", [mcpServerPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    mcpProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    mcpProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    mcpProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`MCP server exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const lines = stdout.trim().split("\n");
        const responseLine = lines[lines.length - 1];
        const response: MCPResponse = JSON.parse(responseLine);
        resolve(response);
      } catch (error) {
        reject(new Error(`Failed to parse MCP response: ${error}`));
      }
    });

    const requestData = {
      jsonrpc: "2.0",
      id: 1,
      method: method,
      params: params,
    };

    mcpProcess.stdin.write(JSON.stringify(requestData) + "\n");
    setTimeout(() => {
      mcpProcess.stdin.end();
    }, 100);
  });
}

// Helper function to safely parse JSON that might be wrapped in markdown
function safeParseJSON(text: string): any {
  try {
    // First try to parse as-is
    return JSON.parse(text);
  } catch (error) {
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim();

      // Handle various markdown code block formats
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3);
      }

      // Remove trailing ```
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }

      // Additional cleaning for common issues
      cleanedText = cleanedText.trim();

      // Remove any remaining backticks at the beginning or end
      if (cleanedText.startsWith("`")) {
        cleanedText = cleanedText.substring(1);
      }
      if (cleanedText.endsWith("`")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 1);
      }

      cleanedText = cleanedText.trim();

      // If the text is still empty or just whitespace, throw an error
      if (!cleanedText) {
        throw new Error("Empty text after cleaning");
      }

      console.log("Cleaned JSON text:", cleanedText);
      return JSON.parse(cleanedText);
    } catch (secondError) {
      console.error(
        "Failed to parse JSON even after cleaning. Original text:",
        text
      );
      console.error("Second error:", secondError);
      throw new Error(`Failed to parse JSON: ${secondError}`);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { message, action }: ChatRequest = await request.json();

    if (action === "search") {
      // Use MCP server for search (more sophisticated search capabilities)
      try {
        const searchQuery = message.replace(/search|find/gi, "").trim();
        const response = await callMCPServer("tools/call", {
          name: "search_family_nodes",
          arguments: {
            query: searchQuery,
          },
        });

        const nodes = safeParseJSON(response.content[0].text);
        return NextResponse.json({
          type: "search_results",
          data: nodes,
          message:
            nodes.length > 0
              ? `Found ${nodes.length} family member(s) matching "${searchQuery}"`
              : `No family members found matching "${searchQuery}"`,
        });
      } catch (error) {
        // Fallback to direct database search if MCP fails
        console.warn(
          "MCP search failed, falling back to direct search:",
          error
        );
        const searchQuery = message.replace(/search|find/gi, "").trim();
        const nodes = await sql`
          SELECT * FROM family_node 
          WHERE name ILIKE ${`%${searchQuery}%`} 
          OR birthLocation ILIKE ${`%${searchQuery}%`} 
          OR occupation ILIKE ${`%${searchQuery}%`}
        `;

        return NextResponse.json({
          type: "search_results",
          data: nodes,
          message:
            nodes.length > 0
              ? `Found ${nodes.length} family member(s) matching "${searchQuery}"`
              : `No family members found matching "${searchQuery}"`,
        });
      }
    }

    if (action === "list") {
      // Use MCP server for listing (can include relationship data)
      try {
        const response = await callMCPServer("tools/call", {
          name: "get_all_family_nodes",
          arguments: {},
        });

        const nodes = safeParseJSON(response.content[0].text);
        return NextResponse.json({
          type: "list_results",
          data: nodes,
          message: `Found ${nodes.length} family member(s) in total`,
        });
      } catch (error) {
        // Fallback to direct database query if MCP fails
        console.warn("MCP list failed, falling back to direct query:", error);
        const nodes = await sql`SELECT * FROM family_node ORDER BY name`;

        return NextResponse.json({
          type: "list_results",
          data: nodes,
          message: `Found ${nodes.length} family member(s) in total`,
        });
      }
    }

    if (action === "create") {
      // Use MCP server for AI suggestions (can leverage existing family data)
      try {
        const response = await callMCPServer("tools/call", {
          name: "ai_suggest_family_node",
          arguments: {
            description: message,
          },
        });

        const suggestion = safeParseJSON(response.content[0].text);
        return NextResponse.json({
          type: "creation_suggestion",
          data: suggestion,
          message: "Here's what I suggest based on your description:",
        });
      } catch (error) {
        // Fallback to direct OpenAI if MCP fails
        console.warn(
          "MCP create suggestion failed, falling back to direct OpenAI:",
          error
        );
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a family tree assistant. When given a description of a family member, extract the relevant information and return it as a JSON object with the following fields:
              - name (required)
              - birth (YYYY-MM-DD format if available)
              - birthLocation
              - death (YYYY-MM-DD format if available)
              - deathLocation
              - occupation
              - gender (male or female)
              
              If any information is not available, use null for that field. Only return the JSON object, no other text.`,
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.1,
        });

        const suggestion = JSON.parse(
          completion.choices[0].message.content || "{}"
        );

        return NextResponse.json({
          type: "creation_suggestion",
          data: suggestion,
          message: "Here's what I suggest based on your description:",
        });
      }
    }

    if (action === "suggest_relationships") {
      // Use MCP server for relationship suggestions (can leverage existing family data)
      try {
        const response = await callMCPServer("tools/call", {
          name: "ai_suggest_relationships",
          arguments: {
            nodeName: message,
          },
        });

        const suggestions = safeParseJSON(response.content[0].text);
        return NextResponse.json({
          type: "relationship_suggestions",
          data: suggestions,
          message: `Here are potential relationships for "${message}":`,
        });
      } catch (error) {
        // Fallback to direct OpenAI if MCP fails
        console.warn(
          "MCP relationship suggestions failed, falling back to direct OpenAI:",
          error
        );
        const existingNodes =
          await sql`SELECT * FROM family_node ORDER BY name`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a family tree assistant. Given a person's name and a list of existing family members, suggest potential relationships. Return the suggestions as a JSON array of objects with fields:
              - name: the existing family member's name
              - relationship: the suggested relationship (e.g., "father", "mother", "spouse", "child", "sibling")
              - confidence: "high", "medium", or "low"
              
              Only return the JSON array, no other text.`,
            },
            {
              role: "user",
              content: `Person: ${message}\n\nExisting family members: ${JSON.stringify(
                existingNodes
              )}`,
            },
          ],
          temperature: 0.3,
        });

        const suggestions = JSON.parse(
          completion.choices[0].message.content || "[]"
        );

        return NextResponse.json({
          type: "relationship_suggestions",
          data: suggestions,
          message: `Here are potential relationships for "${message}":`,
        });
      }
    }

    if (action === "create_node") {
      // Use MCP server to actually create the family node
      try {
        const response = await callMCPServer("tools/call", {
          name: "create_family_node",
          arguments: message, // message should be the node data object
        });

        const result = safeParseJSON(response.content[0].text);
        return NextResponse.json({
          type: "node_created",
          data: result,
          message: "Family member created successfully!",
        });
      } catch (error) {
        console.error("MCP create node failed:", error);
        return NextResponse.json({
          type: "error",
          message: "Failed to create family member. Please try again.",
        });
      }
    }

    // Default: try to understand the intent and respond appropriately
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful family tree assistant. You can help users:
          1. Create new family members
          2. Search for existing family members
          3. List all family members
          4. Suggest relationships
          
          Respond in a friendly, helpful way and suggest what they might want to do next.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      type: "general_response",
      message:
        completion.choices[0].message.content ||
        "I'm here to help with your family tree!",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
}
