const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");
require("dotenv/config");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const sql = neon(DATABASE_URL);

// Read family-tree.json
const dataPath = path.join(__dirname, "../data/family-tree.json");
const familyData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

async function main() {
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS family_node (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      gender TEXT,
      birth TEXT,
      birthLocation TEXT,
      death TEXT,
      deathLocation TEXT,
      fatherId UUID,
      motherId UUID,
      occupation TEXT,
      profileImg TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS spouse (
      id SERIAL PRIMARY KEY,
      node_id UUID NOT NULL REFERENCES family_node(id),
      spouse_id UUID NOT NULL REFERENCES family_node(id),
      UNIQUE(node_id, spouse_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS child (
      id SERIAL PRIMARY KEY,
      parent_id UUID NOT NULL REFERENCES family_node(id),
      child_id UUID NOT NULL REFERENCES family_node(id),
      UNIQUE(parent_id, child_id)
    )
  `;

  // Insert family nodes
  for (const node of familyData) {
    await sql`
      INSERT INTO family_node (id, name, gender, birth, birthLocation, death, deathLocation, fatherId, motherId, occupation, profileImg)
      VALUES (${node.id},${node.name},${node.gender},${node.birth},${
      node.birthLocation
    },${node.death},${node.deathLocation},${node.fatherId || null},${
      node.motherId || null
    },${node.occupation || null},${node.profileImg || null})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // Insert spouse relationships (bidirectional, but only one direction to avoid duplicates)
  for (const node of familyData) {
    if (Array.isArray(node.spouses)) {
      for (const spouseId of node.spouses) {
        if (node.id < spouseId) {
          // Only insert one direction
          await sql`
            INSERT INTO spouse (node_id, spouse_id) VALUES (${node.id}, ${spouseId}) ON CONFLICT DO NOTHING
          `;
        }
      }
    }
  }

  // Insert child relationships
  for (const node of familyData) {
    if (Array.isArray(node.children)) {
      for (const childId of node.children) {
        await sql`
          INSERT INTO child (parent_id, child_id) VALUES (${node.id}, ${childId}) ON CONFLICT DO NOTHING
        `;
      }
    }
  }

  console.log("Seeding complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
