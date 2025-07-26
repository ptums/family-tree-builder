// app/llm/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { randomUUID } from "crypto";
import { buildFamilyExtractorPrompt } from "./prompts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(DATABASE_URL);

export async function POST(request: Request) {
  const { text, insertToDatabase = false } = await request.json();
  if (!text)
    return NextResponse.json({ error: "No text provided" }, { status: 400 });

  const prompt = buildFamilyExtractorPrompt(text);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful JSON extractor." },
      { role: "user", content: prompt },
    ],
    temperature: 0,
    max_tokens: 1000,
  });

  // Grab and parse the JSON
  const raw = completion.choices[0].message?.content || "";
  let parsed;

  try {
    // Remove markdown code blocks if present
    const jsonContent = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    parsed = JSON.parse(jsonContent);
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON from LLM", raw },
      { status: 500 }
    );
  }

  // If insertToDatabase is true, insert the data into the database
  if (insertToDatabase && parsed.nodes) {
    try {
      const insertedNodes = [];
      const insertedRelations = [];

      // Insert nodes
      for (const node of parsed.nodes) {
        const nodeId = node.id || randomUUID();

        const result = await sql`
          INSERT INTO family_node (
            id, name, gender, birth, birthLocation, death, deathLocation, 
            fatherId, motherId, occupation, profileImg, facts
          ) VALUES (
            ${nodeId}, ${node.name}, ${node.gender}, ${node.birth}, 
            ${node.birthLocation}, ${node.death}, ${node.deathLocation}, 
            ${node.fatherId}, ${node.motherId}, ${node.occupation}, 
            ${node.profileImg}, ${node.facts}
          ) RETURNING id
        `;

        insertedNodes.push({ ...node, id: result[0]?.id || nodeId });

        // Insert parent-child relationships
        if (node.fatherId) {
          await sql`
            INSERT INTO child (parent_id, child_id) VALUES (${node.fatherId}, ${nodeId})
          `;
        }
        if (node.motherId) {
          await sql`
            INSERT INTO child (parent_id, child_id) VALUES (${node.motherId}, ${nodeId})
          `;
        }
      }

      // Insert relations (spouses, etc.)
      if (parsed.relations) {
        for (const relation of parsed.relations) {
          if (relation.type === "married") {
            await sql`
              INSERT INTO spouse (node_id, spouse_id) VALUES (${relation.source}, ${relation.target})
            `;
            insertedRelations.push(relation);
          }
        }
      }

      return NextResponse.json({
        message: "Data successfully inserted into database",
        nodes: insertedNodes,
        relations: insertedRelations,
        extractedData: parsed,
      });
    } catch (dbError) {
      console.error("Database insertion error:", dbError);
      return NextResponse.json(
        {
          error: "Failed to insert data into database",
          dbError: dbError instanceof Error ? dbError.message : "Unknown error",
          extractedData: parsed,
        },
        { status: 500 }
      );
    }
  }

  // Return just the extracted data if not inserting to database
  return NextResponse.json(parsed);
}
