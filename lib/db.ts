import { neon } from "@neondatabase/serverless";

export type Row = Record<string, unknown>;
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

// Kept on globalThis because Next bundles each route separately; a module-level
// variable would give each route its own in-memory database in e2e runs.
const store = globalThis as unknown as { __ftbSql?: Sql };

/**
 * Returns the SQL client. Created lazily so `next build` works without
 * DATABASE_URL, and so tests can swap in PGlite with `setSql`.
 *
 * DATABASE_URL=pglite://memory runs an in-memory Postgres seeded with the
 * schema and e2e fixtures. Only Playwright uses that.
 */
export async function getSql(): Promise<Sql> {
  if (store.__ftbSql) return store.__ftbSql;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  if (url.startsWith("pglite://")) {
    const { createPgliteDb } = await import("./pglite");
    store.__ftbSql = (await createPgliteDb({ seed: true })).sql;
  } else {
    store.__ftbSql = neon(url) as unknown as Sql;
  }
  return store.__ftbSql;
}

/** Test seam: replace the SQL client (pass null to reset). */
export function setSql(sql: Sql | null) {
  store.__ftbSql = sql ?? undefined;
}
