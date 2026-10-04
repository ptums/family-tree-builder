import { getSql, setSql, type Sql } from "./db";
import { createPgliteDb } from "./pglite";

// The real in-memory database is exercised by the e2e suite; here we only check routing.
jest.mock("./pglite", () => ({ createPgliteDb: jest.fn() }));

describe("getSql", () => {
  const originalUrl = process.env.DATABASE_URL;
  afterEach(() => {
    setSql(null);
    process.env.DATABASE_URL = originalUrl;
  });

  it("fails clearly when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;
    await expect(getSql()).rejects.toThrow("DATABASE_URL is not set");
  });

  it("returns the client set by tests", async () => {
    const fake: Sql = async () => [];
    setSql(fake);
    expect(await getSql()).toBe(fake);
  });

  it("uses a seeded in-memory database for pglite:// urls (used by e2e)", async () => {
    const fake: Sql = async () => [];
    jest
      .mocked(createPgliteDb)
      .mockResolvedValue({ sql: fake, reset: jest.fn(), close: jest.fn() });
    process.env.DATABASE_URL = "pglite://memory";

    expect(await getSql()).toBe(fake);
    expect(createPgliteDb).toHaveBeenCalledWith({ seed: true });
  });

  it("creates one client even when the first requests arrive together", async () => {
    const fake: Sql = async () => [];
    jest.mocked(createPgliteDb).mockClear();
    jest
      .mocked(createPgliteDb)
      .mockResolvedValue({ sql: fake, reset: jest.fn(), close: jest.fn() });
    process.env.DATABASE_URL = "pglite://memory";

    const [a, b] = await Promise.all([getSql(), getSql()]);
    expect(a).toBe(b);
    expect(createPgliteDb).toHaveBeenCalledTimes(1);
  });
});
