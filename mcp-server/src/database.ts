import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { randomUUID } from "crypto";
import {
  FamilyNode,
  CreateFamilyNodeRequest,
  UpdateFamilyNodeRequest,
} from "./types";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(DATABASE_URL);

export class FamilyTreeDatabase {
  async getAllNodes(): Promise<FamilyNode[]> {
    const nodes = await sql`SELECT * FROM family_node`;
    const spouses = await sql`SELECT node_id, spouse_id FROM spouse`;
    const children = await sql`SELECT parent_id, child_id FROM child`;

    // Build relationship maps
    const spouseMap = new Map();
    for (const { node_id, spouse_id } of spouses) {
      if (!spouseMap.has(node_id)) spouseMap.set(node_id, []);
      spouseMap.get(node_id).push(spouse_id);
      if (!spouseMap.has(spouse_id)) spouseMap.set(spouse_id, []);
      spouseMap.get(spouse_id).push(node_id);
    }

    const childMap = new Map();
    for (const { parent_id, child_id } of children) {
      if (!childMap.has(parent_id)) childMap.set(parent_id, []);
      childMap.get(parent_id).push(child_id);
    }

    // Attach relationships to nodes
    return nodes.map((node) => {
      const sm = spouseMap.get(node.id) || [];
      const cm = childMap.get(node.id) || [];

      const spouses =
        sm?.map((id: string) => ({
          id,
          type: "married" as const,
        })) || [];

      const children = cm?.map((id: string) => ({
        id,
        type: "blood" as const,
      }));

      return {
        ...node,
        spouses,
        children,
      } as FamilyNode;
    });
  }

  async createNode(
    data: CreateFamilyNodeRequest
  ): Promise<{ id: string; message: string }> {
    const newId = randomUUID();
    const normalizedFatherId = data.fatherId === "" ? null : data.fatherId;
    const normalizedMotherId = data.motherId === "" ? null : data.motherId;

    await sql`
      INSERT INTO family_node (
        id, name, birth, birthLocation, death, deathLocation, fatherId, motherId, occupation, profileImg, gender
      ) VALUES (
        ${newId}, ${data.name}, ${data.birth || null}, ${
      data.birthLocation || null
    }, 
        ${data.death || null}, ${
      data.deathLocation || null
    }, ${normalizedFatherId}, 
        ${normalizedMotherId}, ${data.occupation || null}, ${
      data.profileImg || null
    }, ${data.gender || null}
      )
    `;

    // Insert parent-child relationships
    if (normalizedFatherId) {
      await sql`
        INSERT INTO child (parent_id, child_id) VALUES (${normalizedFatherId}, ${newId})
      `;
    }
    if (normalizedMotherId) {
      await sql`
        INSERT INTO child (parent_id, child_id) VALUES (${normalizedMotherId}, ${newId})
      `;
    }

    // Insert spouse relationships
    if (data.spouses) {
      for (const spouseId of data.spouses) {
        await sql`
          INSERT INTO spouse (node_id, spouse_id) VALUES (${newId}, ${spouseId})
        `;
      }
    }

    return { id: newId, message: "Node created successfully" };
  }

  async updateNode(
    data: UpdateFamilyNodeRequest
  ): Promise<{ message: string }> {
    const normalizedFatherId = data.fatherId === "" ? null : data.fatherId;
    const normalizedMotherId = data.motherId === "" ? null : data.motherId;

    await sql`
      UPDATE family_node SET
        name = COALESCE(${data.name}, name),
        birth = COALESCE(${data.birth}, birth),
        birthLocation = COALESCE(${data.birthLocation}, birthLocation),
        death = COALESCE(${data.death}, death),
        deathLocation = COALESCE(${data.deathLocation}, deathLocation),
        fatherId = ${normalizedFatherId},
        motherId = ${normalizedMotherId},
        occupation = COALESCE(${data.occupation}, occupation),
        profileImg = COALESCE(${data.profileImg}, profileImg),
        gender = COALESCE(${data.gender}, gender)
      WHERE id = ${data.id}
    `;

    return { message: "Node updated successfully" };
  }

  async getNodeById(id: string): Promise<FamilyNode | null> {
    const nodes = await sql`SELECT * FROM family_node WHERE id = ${id}`;
    if (nodes.length === 0) return null;

    const node = nodes[0];
    const spouses =
      await sql`SELECT spouse_id FROM spouse WHERE node_id = ${id}`;
    const children =
      await sql`SELECT child_id FROM child WHERE parent_id = ${id}`;

    return {
      ...node,
      spouses: spouses.map((s) => ({
        id: s.spouse_id,
        type: "married" as const,
      })),
      children: children.map((c) => ({
        id: c.child_id,
        type: "blood" as const,
      })),
    } as FamilyNode;
  }

  async searchNodes(query: string): Promise<FamilyNode[]> {
    const nodes = await sql`
      SELECT * FROM family_node 
      WHERE name ILIKE ${`%${query}%`} 
      OR birthLocation ILIKE ${`%${query}%`}
      OR deathLocation ILIKE ${`%${query}%`}
      OR occupation ILIKE ${`%${query}%`}
    `;
    return nodes as FamilyNode[];
  }
}
