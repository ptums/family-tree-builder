const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");
require("dotenv/config");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const sql = neon(DATABASE_URL);
const OUTPUT_PATH = path.join(__dirname, "../data/db.json");

async function main() {
  try {
    const [familyNodes, spouses, children, documents] = await Promise.all([
      sql`SELECT * FROM family_node`,
      sql`SELECT * FROM spouse`,
      sql`SELECT * FROM child`,
      sql`SELECT * FROM documents`,
    ]);
    const data = {
      family_node: familyNodes,
      spouse: spouses,
      child: children,
      documents: documents,
    };
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log(`Data written to ${OUTPUT_PATH}`);
  } catch (err) {
    console.error("Error fetching or writing data:", err);
    process.exit(1);
  }
}

main();
