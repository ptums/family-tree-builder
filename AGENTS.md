# AGENTS.md: Roles, Stack, and Rules

Tool-agnostic. Applies to the Orchestrator and every subagent. `PROCESS.md` says _when_; this file says _who_ and _how_.

Family Tree Builder is a Next.js app for browsing and editing family trees. It started as one family's tree (Barnwell) and is being generalized to user-owned, multiple trees. It is a long-running product, not a one-off: work flows continuously through the GitHub Project board.

## Ground rules

1. **GitHub is the source of truth for work.** Every change starts as an issue on the [project board](https://github.com/users/ptums/projects/2). No issue, no branch. Requirements live in the issue's acceptance criteria; if they conflict with the code or another issue, flag it and don't resolve it silently.
2. One ticket = one branch (`ticket/<issue#>-<slug>`) = one PR, in its own worktree under `.worktrees/`. Stay inside the ticket's **Files touched**.
3. Never push to `main`. Never merge. The human merges. Merging to `main` deploys to production.
4. Every PR links its issue (`Closes #N`), passes `pnpm check` and `pnpm e2e`, and pastes the output.
5. Small PRs (~300 changed lines, lockfile and snapshots aside). Bigger: ask the ticketer to split.
6. Dependencies: only a ticket that says so may edit `package.json` / `pnpm-lock.yaml`. Need one otherwise? Comment on the issue, label `blocked`, stop. Two open PRs must never both touch the lockfile.
7. Blocked or ambiguous: comment on the issue, label `blocked`, stop. Don't guess on requirements.
8. **Secrets.** Never read or print `.env`, `.env.*`, `env-original`, `.stuff`, or any token or key. Never put secrets in prompts, issues, commits, PRs, or logs. `.env.example` (names only) is fine. If you ever see a secret, stop, tell the human which file, and don't repeat the value.
9. **Real family data is private** (see "Privacy" below). Never read `data/`, never copy real names, dates, places, photos, or documents into code, fixtures, tests, issues, PRs, or logs. Use the synthetic family in `e2e/fixtures/seed.sql`.
10. Check `git status` before writing; never delete or overwrite files you didn't create. Unexpected changes in the tree: stop and tell the human.
11. Log real process problems in `SELF_IMPROVEMENT.md`; log every review finding in `docs/REVIEW_LOG.md`.
12. **Honesty about verification.** Never say "verified", "tested", or "works" unless you ran the check in this session and can show the output. Quote the real summary lines (Jest totals; Playwright passed _and_ failed), never a recollection or another agent's report. State what you did NOT check.
13. **The human must be able to defend every line.** Simple, readable code: small functions, plain names, comments only where the _why_ isn't obvious. In PRs, point out the risky parts and how to check them.
14. **Never bypass the gates.** No `--no-verify`, no skipping hooks or CI, no `.only` / `.skip` / `.todo` / `test.fixme` in merged tests, no lowering coverage thresholds, no adding entries to `eslint.baseline.mjs` or `KNOWN_VIOLATIONS` in `e2e/a11y.spec.ts`. Those lists only shrink. If a hook fails, fix the cause.
15. **Accessibility and tests are part of done.** Every ticket ships tests; every UI ticket ships keyboard, label, and focus behavior as acceptance criteria, with jest-axe and Playwright checks.

## Privacy and security (read before touching data or APIs)

- The database holds **real people, some living**: names, birth dates and places, photos, documents. The repo is **public**. `data/` (backups from `pnpm backup`) is gitignored and must stay that way.
- Synthetic fixtures only (`e2e/fixtures/seed.sql`: Arthur/Beatrice/Charles... Example). New fixtures follow the same pattern: obviously fake names, "Testshire" places, `0000...` UUIDs.
- **There is currently no authentication** (Clerk was removed during generalization), so the production API accepts writes from anyone. Treat this as the top security risk; don't widen it (no new write endpoints without an auth ticket), and flag any PR that does.
- The OpenAI key is server-side only (`app/api/llm`). Never call OpenAI in tests or CI: mock `openai` (see `app/api/llm/route.test.ts`).
- Uploaded documents go to UploadThing; images to Cloudinary. Don't log their URLs alongside names.

## Roles (each is `.claude/agents/<name>.md`)

| Role             | Tools                               | Job                                                                                                                                                                                                                                                                 |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **orchestrator** | all                                 | Runs PROCESS.md. Owns the board, worktrees, the independent check, gates. Doesn't write feature code.                                                                                                                                                               |
| **pm**           | Read, Write, Edit, Grep, Glob       | Turns a human request into a short spec (`docs/specs/<slug>.md`): user stories, scope cuts, assumptions, risks, acceptance criteria. Proposes, never applies, changes to existing specs.                                                                            |
| **architect**    | Read, Write, Edit, Grep, Glob, Bash | Owns `docs/ARCHITECTURE.md` and ADRs (`docs/adr/NNNN-<slug>.md`) for cross-cutting changes: schema and migrations, auth, multi-tree data model, API shape. States trade-offs and what was deliberately not built.                                                   |
| **ticketer**     | Read, Grep, Glob, Bash              | Turns a spec into small, parallelizable GitHub issues (using the ticket template) with disjoint Files touched, checkable acceptance criteria, `Depends on`, size, and labels. Creates them in Backlog.                                                              |
| **developer**    | Read, Write, Edit, Grep, Glob, Bash | Implements exactly one ticket in its worktree. Tests alongside code. Runs `pnpm check` and `pnpm e2e`, reports the real output. Doesn't push or open the PR.                                                                                                        |
| **tester**       | Read, Write, Edit, Grep, Glob, Bash | Requirement -> test coverage map; adds missing tests (tests-only PRs, label `testing`); smoke-tests deployments; keeps `docs/VERIFICATION.md` current with evidence.                                                                                                |
| **reviewer**     | Read, Grep, Glob, Bash              | Read-only diff review: acceptance criteria met, correctness, edge cases, tests meaningful (not vacuous), security and privacy, scope creep. Ranks blocker / should-fix / nit. Lists 2-3 "read this closely" items for the human. Output is ready for REVIEW_LOG.md. |
| **a11y-auditor** | Read, Grep, Glob, Bash              | Read-only, UI tickets: keyboard flow, tab order, focus, labels, contrast, semantics, live regions, reduced motion. Runs Playwright + axe. Blockers must be fixed before the PR opens. Axe passing is never the claim.                                               |
| **release**      | Read, Write, Edit, Grep, Glob, Bash | CI/CD and environments: workflows, hosting config (the Cloudflare migration, #14), env var _names_, deploy smoke tests, rollback steps, README run instructions. Never touches secret values; gives the human the exact command instead.                            |

## Models

- **Orchestrator and judgment roles** (pm, architect, reviewer, a11y-auditor, release): the session's model (`model: inherit`); start the session on Opus.
- **developer, tester, ticketer**: Sonnet (`model: sonnet`). A cheaper implementer is fine because the independent check and the reviewers catch problems; a weaker reviewer is not.
- Default parallelism: **2** concurrent developer subagents. The human can raise it.
- Never state a model name you haven't confirmed.

## Stack (fixed; changing it needs an ADR and human approval)

- **pnpm** (version pinned in `packageManager`), **Node 22** (`engines`; local, CI and hosting use the same).
- **Next.js 15 App Router**, React 19, TypeScript, Tailwind 4, Headless UI, TanStack Query, react-hook-form, `react-family-tree` / `relatives-tree` for layout.
- **Database: Neon Postgres** via `@neondatabase/serverless`. All access goes through `getSql()` in `lib/db.ts`, never `neon()` directly. Schema source of truth: `db/schema.sql`. Postgres lowercases unquoted identifiers, so `birthLocation` comes back as `birthlocation` (mapped in `utils/familyUtils.ts`).
- Uploads: UploadThing. AI import: OpenAI (`app/api/llm`).
- **Tests:**
  - Unit + integration: **Jest 30** + `@swc/jest`, two projects: `dom` (jsdom; `*.test.tsx`; React Testing Library, user-event, jest-dom, jest-axe) and `node` (`*.test.ts`; API routes, `lib/`, `utils/`).
  - Integration tests hit **real SQL** on **PGlite** (in-memory Postgres) with the real schema: `setupTestDatabase({ seed })` from `test/pglite.ts`. Don't mock the database.
  - E2E: **Playwright** (desktop + phone) + `@axe-core/playwright`, against a production build (`next build && next start`) with `DATABASE_URL=pglite://memory`, an in-memory database seeded with the synthetic family. No secrets needed.
  - Tests tagged `@smoke` are read-only and data-agnostic, so they can run against real deployments (`E2E_BASE_URL=<url> pnpm e2e:smoke`).
- Lint and format: ESLint 9 flat config (`next/core-web-vitals`, `next/typescript`, all recommended jsx-a11y rules as errors, `eslint-config-prettier`) and Prettier. **Husky + lint-staged**: `pre-commit` = lint-staged then typecheck; `pre-push` = Jest. CI mirrors all of it.
- **Hosting: moving from Vercel to Cloudflare Workers** (epic #14). Until cutover, production runs on Vercel's Git integration: it auto-deploys `main` and builds a preview per PR, outside GitHub Actions. Don't add Vercel-specific code or config, and don't add Cloudflare code outside an epic #14 ticket. Never deploy from a laptop.

### Known gotchas (learned the hard way; respect them)

- **PGlite under Jest** needs `--experimental-vm-modules` (it does a dynamic `import()`). The `pnpm test` scripts set it; running `npx jest` directly fails with `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG`.
- **Don't name non-hook helpers `use*`.** `react-hooks/rules-of-hooks` flags them at top level in test files.
- **`lib/db.ts` keeps the client on `globalThis`.** Next bundles routes separately; a module variable would give each route its own in-memory DB in e2e. Never create SQL clients at module load: it breaks `next build` without secrets.
- **pnpm blocks postinstall scripts** unless the package is in `pnpm.onlyBuiltDependencies`. `@swc/core` missing from it = Jest can't transform.
- **Husky hooks are silently skipped in a fresh git worktree.** Run `pnpm exec husky` inside every new worktree. CI is the backstop.
- **E2E ports are derived per worktree** and servers are never reused (`playwright.config.ts`); parallel worktrees once tested each other's builds in another project.
- **jsx-a11y:** map only the rules the recommended set enables to `error`. Mapping every key turns on deprecated, contradictory rules (`label-has-for`).
- **Axe misses a lot.** The tree nodes were clickable `<div>`s with zero axe violations. Keyboard tests (Tab, Enter, Space, Esc) are required for interactive UI.
- **Dates are strings** (`"06/30/1917"`, `"1932"`). `new Date("1932")` is UTC midnight, the previous day in US time zones. Never round-trip dates through `Date` for display.
- The tree root (`ROOT_NODE_ID` in `components/FamilyTree.tsx`), the title, and the `/` redirect are still Barnwell-specific; the e2e fixture reuses that root id until multi-tree lands.
- The client caches `/api/family` in IndexedDB (`idb-keyval`) for an hour. After a write, the cache must be invalidated or the UI shows stale data.

## Commands (`package.json` is the interface)

`pnpm dev` · `pnpm build` · `pnpm check` (format:check + lint + typecheck + test:coverage + build) · `pnpm format` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test:coverage` · `pnpm e2e` · `pnpm e2e:smoke` · `pnpm backup` (writes real data to `data/`; human only) · `pnpm seed` (creates tables; human only)

## Testing rules

- Every ticket ships tests for the behavior it adds or changes. Bug fixes start with a failing test.
- Put each test at the lowest level that proves the behavior: pure logic -> unit; API route + SQL -> integration (PGlite); component behavior -> RTL; user journeys, routing, keyboard, layout -> Playwright.
- Assert on what users and callers see (roles, text, JSON), not implementation details.
- No vacuous tests: a test must fail if the feature breaks. If you stub a network route, assert it was hit.
- Coverage thresholds in `jest.config.cjs` only go up. `app/api`, `lib`, and `utils` are held at 90/90/80% statements; the global floor rises as legacy components get tests.

## Product rules

1. **Missing data**: render only what exists. Never invent or default a birth date, place, parent, or gender. Tests cover a person with every optional field missing.
2. **Accessibility (WCAG 2.2 AA)**: real elements (`<button>`, `<a>`, `<label>`), never clickable `<div>`s in new code. Every control labelled; keyboard operable (Tab, Enter, Space, Esc closes dialogs); focus moves into dialogs and returns to the trigger; visible focus; AA contrast; works at 320px width and 200% zoom. Don't claim compliance; say what was tested.
3. **Relationships stay consistent**: parent/child rows, `fatherId`/`motherId`, and two-way spouses must agree after every write. Integration tests check the resulting `GET /api/family`.
4. **Genealogy data is messy**: partial dates, unknown parents, remarriages, half-siblings. Handle them deliberately and test them.

## Definition of done (per ticket)

Acceptance criteria met · `pnpm check` and `pnpm e2e` green (checked independently by the orchestrator) · tests shipped, thresholds met, baselines not grown · UI: keyboard + labels + focus covered, jest-axe and Playwright axe clean · hooks passed without bypass · no real family data or secrets in the diff · docs updated (ARCHITECTURE/ADR if structure changed) · reviewer (and a11y-auditor for UI) approved · PR open with `Closes #N` and "read this closely" items · findings in `docs/REVIEW_LOG.md` · human merged · deploy green.
