import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { randomUUID } from "crypto";
import {
  findSiblings,
  mapFamilyTreeNodeKeys,
  mapParents,
  mapSpouses,
} from "@/utils/familyUtils";
import { FamilyNode } from "@/types/FamilyNode";

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
  const familyData = nodes.map((node) => {
    const parents = mapParents(node);

    // Build children array

    // Build spouses array
    const spousesData = mapSpouses(node);

    // Siblings can be derived later; for now, leave empty
    const siblings = findSiblings(
      nodes,
      node as unknown as FamilyNode,
      "fatherid",
      "motherid"
    );

    return mapFamilyTreeNodeKeys(node, siblings, spouseMap, childMap, parents);
  });

  return NextResponse.json(familyData);
}

export async function POST(request: Request) {
  const data = await request.json();
  const {
    id,
    name = null,
    birth = null,
    birthLocation = null,
    death = null,
    deathLocation = null,
    fatherId = null,
    motherId = null,
    occupation = null,
    profileImg = null,
    children = [], // Accept children array
    spouses = [], // Accept spouses array,
    gender = null,
  } = data;

  // Convert empty strings to null for UUID fields
  const normalizedFatherId = fatherId === "" ? null : fatherId;
  const normalizedMotherId = motherId === "" ? null : motherId;

  if (id) {
    // Update existing node
    await sql`
      UPDATE family_node SET
        name = ${name},
        birth = ${birth},
        birthLocation = ${birthLocation},
        death = ${death},
        deathLocation = ${deathLocation},
        fatherId = ${normalizedFatherId},
        motherId = ${normalizedMotherId},
        occupation = ${occupation},
        profileImg = ${profileImg}
      WHERE id = ${id}
    `;
    return NextResponse.json({ message: "Node updated" });
  } else {
    // Create new node with generated UUID
    const newId = randomUUID();
    const result = await sql`
      INSERT INTO family_node (
        id, name, birth, birthLocation, death, deathLocation, fatherId, motherId, occupation, profileImg, gender
      ) VALUES (
        ${newId}, ${name}, ${birth}, ${birthLocation}, ${death}, ${deathLocation}, ${normalizedFatherId}, ${normalizedMotherId}, ${occupation}, ${profileImg}, ${gender}
      ) RETURNING id
    `;

    // Insert children relationships
    if (fatherId) {
      await sql`
        INSERT INTO child (parent_id, child_id) VALUES (${fatherId}, ${newId})
      `;
    }
    if (motherId) {
      await sql`
        INSERT INTO child (parent_id, child_id) VALUES (${motherId}, ${newId})
      `;
    }

    // Insert spouse relationships
    for (const spouseId of spouses) {
      await sql`
        INSERT INTO spouse (node_id, spouse_id) VALUES (${newId}, ${spouseId?.id})
      `;
    }

    return NextResponse.json({ message: "Node created", id: result[0]?.id });
  }
}
