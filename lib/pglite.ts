import { readFileSync } from "fs";
import path from "path";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "./db";

const SCHEMA = path.join(process.cwd(), "db/schema.sql");
const SEED = path.join(process.cwd(), "e2e/fixtures/seed.sql");

/**
 * In-memory Postgres for integration tests and e2e. Never used in production.
 * `seed: true` loads the synthetic fixture family from e2e/fixtures/seed.sql.
 */
export async function createPgliteDb({ seed = false } = {}) {
  const db = new PGlite();
  await db.exec(readFileSync(SCHEMA, "utf8"));

  const sql: Sql = async (strings, ...values) => {
    const result = await db.sql(strings, ...values);
    return result.rows as Record<string, unknown>[];
  };

  /** Empties every table, then reloads the fixtures if `seed` is set. */
  async function reset() {
    await db.exec("TRUNCATE family_node, spouse, child, documents RESTART IDENTITY CASCADE");
    if (seed) await db.exec(readFileSync(SEED, "utf8"));
  }

  await reset();
  return { sql, reset, close: () => db.close() };
}
