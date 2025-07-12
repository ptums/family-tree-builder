import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { FamilyNode } from "@/types/FamilyNode";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(DATABASE_URL);

export async function GET() {
  // Fetch all nodes
  const nodes = await sql`SELECT * FROM family_node`;
  // Fetch all spouses
  const spouses = await sql`SELECT node_id, spouse_id FROM spouse`;
  // Fetch all children
  const children = await sql`SELECT parent_id, child_id FROM child`;

  // Build maps for relationships
  const spouseMap = new Map();
  for (const { node_id, spouse_id } of spouses) {
    if (!spouseMap.has(node_id)) spouseMap.set(node_id, []);
    spouseMap.get(node_id).push(spouse_id);
    // Also add reverse for bidirectional
    if (!spouseMap.has(spouse_id)) spouseMap.set(spouse_id, []);
    spouseMap.get(spouse_id).push(node_id);
  }

  const childMap = new Map();
  for (const { parent_id, child_id } of children) {
    if (!childMap.has(parent_id)) childMap.set(parent_id, []);
    childMap.get(parent_id).push(child_id);
  }

  // Attach relationships to nodes
  const familyData = nodes.map((node) => ({
    ...node,
    spouses: spouseMap.get(node.id) || [],
    children: childMap.get(node.id) || [],
  }));

  return NextResponse.json(familyData);
}

export async function POST(request: Request) {
  const data = await request.json();
  const {
    id,
    name,
    birth,
    birthLocation,
    death,
    deathLocation,
    fatherId,
    motherId,
    occupation,
    profileImg,
  } = data;

  if (id) {
    // Update existing node
    await sql`
      UPDATE family_node SET
        name = ${name},
        birth = ${birth},
        birthLocation = ${birthLocation},
        death = ${death},
        deathLocation = ${deathLocation},
        fatherId = ${fatherId},
        motherId = ${motherId},
        occupation = ${occupation},
        profileImg = ${profileImg}
      WHERE id = ${id}
    `;
    return NextResponse.json({ message: "Node updated" });
  } else {
    // Create new node
    const result = await sql`
      INSERT INTO family_node (
        name, birth, birthLocation, death, deathLocation, fatherId, motherId, occupation, profileImg
      ) VALUES (
        ${name}, ${birth}, ${birthLocation}, ${death}, ${deathLocation}, ${fatherId}, ${motherId}, ${occupation}, ${profileImg}
      ) RETURNING id
    `;
    return NextResponse.json({ message: "Node created", id: result[0]?.id });
  }
}
