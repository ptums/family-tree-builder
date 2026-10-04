# Family Tree Builder

Browse and edit a family tree: people, parents, spouses, children, documents, and AI-assisted import from Ancestry.com text. Started as the Barnwell family tree; being generalized to user-owned, multiple trees.

- **Board:** https://github.com/users/ptums/projects/2 (all work is tracked here)
- **CI/CD:** https://github.com/ptums/family-tree-builder/actions

## Run it

Requires Node 22 and pnpm (`corepack enable`).

```sh
pnpm install
cp .env.example .env.local   # DATABASE_URL (use a Neon branch), OPENAI_API_KEY, UPLOADTHING_TOKEN
pnpm dev
```

No database handy? Set `DATABASE_URL=pglite://memory` to run against an in-memory Postgres with a small synthetic family (resets on restart).

## Test it

| Command      | What it runs                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `pnpm test`  | Jest: unit, component (RTL + jest-axe), and API integration tests on real SQL (PGlite, in memory)      |
| `pnpm e2e`   | Playwright on desktop + phone against a production build with an in-memory database. No secrets needed |
| `pnpm check` | Prettier, ESLint, typecheck, Jest with coverage thresholds, build (what CI's `check` job runs)         |

Git hooks (Husky): `pre-commit` runs lint-staged + typecheck; `pre-push` runs Jest.

## How work happens

This repo is built with a multi-agent workflow (Claude Code subagents) under human review:

- [`AGENTS.md`](AGENTS.md): roles, stack, rules, privacy, definition of done
- [`PROCESS.md`](PROCESS.md): the orchestrator's playbook (intake -> spec -> tickets -> parallel build in worktrees -> review -> PR -> human merge -> deploy)
- [`SELF_IMPROVEMENT.md`](SELF_IMPROVEMENT.md): what went wrong and the process change that followed
- [`docs/REVIEW_LOG.md`](docs/REVIEW_LOG.md), [`docs/VERIFICATION.md`](docs/VERIFICATION.md): review findings and what was checked, by whom
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): how it fits together

To start: open Claude Code here and say _"read process.md and work the board"_.

## Deploy

GitHub Actions deploys to Vercel: a preview for every PR (with smoke tests and a URL comment) and production after CI passes on `main`. Vercel's Git auto-deploy is off (`vercel.json`). See PROCESS.md section 6 for the required secrets and variables.

## Data and privacy

The database holds real people, some living. The repo is public: never commit `data/` (`pnpm backup` output), and use only the synthetic fixtures in `e2e/fixtures/seed.sql` for tests. There is currently **no authentication**; see the board.
