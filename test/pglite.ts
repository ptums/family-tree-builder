import { setSql } from "@/lib/db";
import { createPgliteDb } from "@/lib/pglite";

/**
 * Real Postgres (PGlite, in memory) with the real schema for integration tests.
 * One database per test file; every test starts from the same clean state.
 */
export function setupTestDatabase({ seed = false } = {}) {
  let db: Awaited<ReturnType<typeof createPgliteDb>>;

  beforeAll(async () => {
    db = await createPgliteDb({ seed });
    setSql(db.sql);
  });
  beforeEach(() => db.reset());
  afterAll(async () => {
    setSql(null);
    await db.close();
  });
}
