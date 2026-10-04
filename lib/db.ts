import { neon } from "@neondatabase/serverless";

export type Row = Record<string, unknown>;
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

// Kept on globalThis because Next bundles each route separately; a module-level
// variable would give each route its own in-memory database in e2e runs.
// It holds the promise, not the client, so requests that arrive together while
// the client is being created share one client instead of each making their own.
const store = globalThis as unknown as { __ftbSql?: Promise<Sql> };

/**
 * Returns the SQL client. Created lazily so `next build` works without
 * DATABASE_URL, and so tests can swap in PGlite with `setSql`.
 *
 * DATABASE_URL=pglite://memory runs an in-memory Postgres seeded with the
 * schema and e2e fixtures. Only Playwright uses that.
 */
export function getSql(): Promise<Sql> {
  if (store.__ftbSql) return store.__ftbSql;

  const pending = createSql();
  store.__ftbSql = pending;
  // Don't cache a failure: the next request should try again.
  pending.catch(() => {
    if (store.__ftbSql === pending) store.__ftbSql = undefined;
  });
  return pending;
}

async function createSql(): Promise<Sql> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  if (url.startsWith("pglite://")) {
    const { createPgliteDb } = await import("./pglite");
    return (await createPgliteDb({ seed: true })).sql;
  }
  return neon(url) as unknown as Sql;
}

/** Test seam: replace the SQL client (pass null to reset). */
export function setSql(sql: Sql | null) {
  store.__ftbSql = sql ? Promise.resolve(sql) : undefined;
}
