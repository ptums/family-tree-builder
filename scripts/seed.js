const { neon } = require("@neondatabase/serverless");
require("dotenv/config");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const sql = neon(DATABASE_URL);

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

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      userId UUID NOT NULL REFERENCES family_node(id)
    )
  `;

  console.log("Seeding complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
