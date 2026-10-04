# Verification

What was checked, how, and by whom. "Automated" rows run in CI on every PR.

| Check                                                                                      | Type      | Result | Evidence                                                 | Date       |
| ------------------------------------------------------------------------------------------ | --------- | ------ | -------------------------------------------------------- | ---------- |
| Prettier, ESLint (max-warnings 0), typecheck                                               | automated | pass   | `pnpm check`, CI `check` job                             | 2026-10-03 |
| Jest unit + integration (API routes on PGlite) + component (jest-axe), coverage thresholds | automated | pass   | `pnpm test:coverage`: 8 suites, 46 tests                 | 2026-10-03 |
| Playwright e2e, desktop + phone, production build on in-memory DB                          | automated | pass   | `pnpm e2e`: 14 passed, 0 flaky (CI run 37168446675)      | 2026-10-03 |
| Format-only commit contains nothing beyond Prettier output                                 | agent     | pass   | Re-ran Prettier on the previous versions; 0 files differ | 2026-10-03 |
| Pre-commit hook runs lint-staged + typecheck                                               | agent     | pass   | Observed on the foundation commits                       | 2026-10-03 |
| Preview + production deploy and `@smoke` e2e against them                                  | automated | TODO   | First run after `VERCEL_TOKEN` is set                    |            |

## Checks passing tests can miss (standing list)

| Check                                                                                    | Type  | Status                                                  |
| ---------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------- |
| Keyboard-only pass on the tree and profile dialog (Tab, Enter, Space, Esc, focus return) | human | HUMAN TODO; known to fail (tree nodes aren't focusable) |
| VoiceOver pass: headings, dialog title, relatives lists                                  | human | HUMAN TODO                                              |
| Phone-size and 200% zoom on a real large tree                                            | human | HUMAN TODO                                              |
| Person with every optional field missing looks sensible                                  | agent | TODO                                                    |
| Edit a person: change shows without a reload, and after a reload (IndexedDB cache)       | human | known to fail (REVIEW_LOG #6)                           |
| Preview deploys use a Neon branch, not the production database                           | human | HUMAN TODO                                              |
