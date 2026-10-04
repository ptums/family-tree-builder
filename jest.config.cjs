/** Two projects: "dom" (components, jsdom) and "node" (API routes, lib, utils). */
const transform = {
  "^.+\\.(t|j)sx?$": [
    "@swc/jest",
    {
      jsc: {
        parser: { syntax: "typescript", tsx: true },
        transform: { react: { runtime: "automatic" } },
      },
    },
  ],
};
const moduleNameMapper = {
  "^@/(.*)$": "<rootDir>/$1",
  "\\.css$": "<rootDir>/test/fileStub.cjs",
};
// .worktrees and e2e live outside these roots, so Jest never scans them.
const shared = {
  transform,
  moduleNameMapper,
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

module.exports = {
  projects: [
    {
      ...shared,
      displayName: "dom",
      testEnvironment: "jsdom",
      roots: ["<rootDir>/components", "<rootDir>/contexts", "<rootDir>/app"],
      testMatch: ["**/*.test.tsx"],
      setupFilesAfterEnv: ["<rootDir>/test/setup-dom.ts"],
    },
    {
      ...shared,
      displayName: "node",
      testEnvironment: "node",
      roots: ["<rootDir>/lib", "<rootDir>/utils", "<rootDir>/app"],
      testMatch: ["**/*.test.ts"],
    },
  ],
  collectCoverageFrom: [
    "app/api/**/*.ts",
    "lib/**/*.ts",
    "utils/**/*.ts",
    "components/**/*.tsx",
    "contexts/**/*.tsx",
    "!**/*.test.{ts,tsx}",
    // Thin wrappers over third-party SDKs with no logic of our own.
    "!utils/uploadthing.ts",
    "!app/api/uploadthing/**",
  ],
  // Ratchet only: raise these as coverage grows, never lower them to pass.
  // Server code and utilities are held to a high bar now; "global" (in practice the
  // legacy UI components, since Jest removes path-matched files from it) starts at
  // today's level and must rise as components are touched.
  coverageThreshold: {
    "./app/api/": { statements: 90, branches: 65, functions: 90, lines: 90 },
    "./lib/": { statements: 90, branches: 50, functions: 90, lines: 90 },
    "./utils/": { statements: 80, branches: 55, functions: 90, lines: 75 },
    global: { statements: 15, branches: 3, functions: 5, lines: 15 },
  },
};
