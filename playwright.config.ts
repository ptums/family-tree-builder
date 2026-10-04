import { createHash } from "crypto";
import { defineConfig, devices } from "@playwright/test";

// Each worktree gets its own port and its own server, so parallel agents never
// test each other's builds (a real failure in the parks project: SELF_IMPROVEMENT.md).
const port =
  Number(process.env.E2E_PORT) ||
  3100 + (createHash("md5").update(process.cwd()).digest().readUInt16BE(0) % 800);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  // One retry in CI to capture a trace, but a test that only passes on retry fails
  // the run: flakiness gets fixed, not hidden (AGENTS.md rule 12).
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  // E2E_BASE_URL (a deployed preview or production URL) skips the local server: used for @smoke runs.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // pglite://memory = in-memory Postgres seeded with e2e/fixtures/seed.sql. No secrets needed.
        command: `pnpm build && pnpm start --hostname 127.0.0.1 --port ${port}`,
        // Ready means the database is booted and seeded, not just that "/" answers;
        // otherwise the first tests pay PGlite's cold start and time out on slow CI runners.
        url: `${baseURL}/api/family`,
        env: { DATABASE_URL: "pglite://memory", OPENAI_API_KEY: "e2e-not-used" },
        reuseExistingServer: false,
        timeout: 180_000,
      },
});
