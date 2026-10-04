# SELF_IMPROVEMENT.md

A running log of what went wrong or right in the agent workflow, and the concrete change that follows.

## Rules

- Append only. Newest at the bottom of the Log.
- Every entry ends with an **ACTION** that changes a file (AGENTS.md, PROCESS.md, a subagent definition, CI, a template). "Be more careful" is not an action.
- The Orchestrator reads the last ~10 entries before starting work, and appends after every gate or failure.
- Apply approved actions in a PR labeled `process`.
- Never log secrets or real family data.

## Entry format

```
### [YYYY-MM-DD] <loop> / <agent>
OBSERVED: what happened (link the PR/issue/run)
CAUSE: best guess at why
ACTION: exact change (file + what)
STATUS: proposed | applied (PR #) | rejected (why)
```

## Carried over from the parks-finder project (actions already applied here)

1. **Husky hooks silently don't run in a new git worktree** (a type-error commit went through). ACTION (applied): PROCESS.md C.1 runs `pnpm exec husky` in every worktree; CI mirrors the hooks.
2. **Parallel e2e runs shared fixed ports**, so one worktree tested another's build. ACTION (applied): `playwright.config.ts` derives the port from the worktree path and never reuses a server.
3. **Stacked PRs got merged into their parent branches, not `main`.** ACTION (applied): every PR targets `main`; dependent tickets wait in Backlog until their parent merges.
4. **Agent-reported numbers were wrong until recomputed**, and "18 passed" hid 2 failures. ACTION (applied): AGENTS.md rule 12 requires quoting the real summary lines, passed and failed.
5. **A vacuous stub test passed CI** (its route glob never matched). ACTION (applied): AGENTS.md testing rules require asserting a stub was hit.
6. **A secret was typed into a chat command** and ended up in a transcript. ACTION (applied): PROCESS.md section 6 has the human set secrets in GitHub or hosting settings; agents only list names.
7. **Deploy configs passed review but failed on first real run.** ACTION (pending, epic #14): the Cloudflare `deploy.yml` must run `@smoke` e2e against every preview, so deploy config is exercised on the PR, before `main`.
8. **Two tickets that passed alone failed together.** ACTION (applied): CI runs the full suite on `main` after every merge; the orchestrator rebases open branches after each G3.

## Log

### [2026-10-03] foundation / orchestrator

OBSERVED: During setup the orchestrator ran `cat` on an unfamiliar dotfile (`.stuff`) while surveying the repo; it held a plaintext login. Nothing was committed, and the value was not repeated.
CAUSE: Bulk `cat` of every root file to "see what's there", with no deny rule for unknown files.
ACTION: `.claude/settings.json` denies reads of `.stuff`, `env-original`, `.env*` (except `.env.example`) and `data/`; AGENTS.md rule 8 lists them. Human should move that credential to a password manager and delete the file.
STATUS: applied (PR for #1)

### [2026-10-03] foundation / orchestrator

OBSERVED: Copying the parks ESLint config, which set _every_ jsx-a11y recommended key to `error`, turned on deprecated rules the recommended set deliberately disables (`label-has-for`), producing contradictory errors.
CAUSE: `Object.keys(recommended.rules)` includes rules set to `"off"`.
ACTION: `eslint.config.mjs` filters out `"off"` rules before mapping to `error`; AGENTS.md gotcha added. (The parks repo has the same latent bug.)
STATUS: applied (PR for #1)

### [2026-10-03] foundation / orchestrator

OBSERVED: The first unit tests found `formatDate("1932")` returned `12/31/1931` and ISO dates shifted back a day in US time zones.
CAUSE: `new Date("YYYY")` / `new Date("YYYY-MM-DD")` parse as UTC; `getDate()` reads local time.
ACTION: Fixed in `utils/familyUtils.ts` with regression tests pinned to America/New_York; AGENTS.md gotcha: never round-trip genealogy dates through `Date`.
STATUS: applied (PR for #1)

### [2026-10-03] foundation / CI

OBSERVED: The first CI run on PR #11 was green but reported "2 flaky": the two first e2e tests timed out and passed on retry. Locally all 14 passed every time.
CAUSE: The readiness check waited for `/`, which doesn't touch the database, so the first tests paid PGlite's cold start on a slower runner; reading the code also found that concurrent first requests created two clients (`getSql` cached the client, not the in-flight promise).
ACTION: `lib/db.ts` caches the promise (with a regression test); `playwright.config.ts` waits on `/api/family` and sets `failOnFlakyTests` in CI so a retry can never turn red into green; AGENTS rule 12 already requires quoting passed and failed (and flaky) counts.
STATUS: applied (PR #11)
