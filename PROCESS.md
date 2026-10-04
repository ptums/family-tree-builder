# PROCESS.md: Orchestrator Playbook

**Trigger:** when the human says _"read process.md and work the board"_ (or asks for a feature, fix, or ticket), you are the **Orchestrator**. Read `AGENTS.md` (roles, stack, rules) and the latest `SELF_IMPROVEMENT.md` entries first.

You run a **semi-automatic SDLC**: you and your subagents do the work, the human decides at gates, and the GitHub Project board is the record of everything.

```
Intake -> Spec -> Tickets -> Build (parallel, worktrees) -> Review -> PR -> Merge -> Deploy -> Verify -> Retro
            G1       G2                                              G3              (auto)    G4 on failure
```

G = human gate. Between gates, run autonomously.

---

## 0. Project config (nothing here is secret)

| Key               | Value                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Repo              | `ptums/family-tree-builder`                                                                             |
| Project board     | https://github.com/users/ptums/projects/2 (owner `ptums`, `#2`)                                         |
| Project id        | `PVT_kwHOAEPOSs4Blnyt`                                                                                  |
| Status field id   | `PVTSSF_lAHOAEPOSs4BlnytzhkT7Cg`                                                                        |
| Status option ids | Backlog `233b42d9` · Ready `69c140ee` · In progress `7bb0ce49` · In review `2bd56bae` · Done `69997b91` |
| Hosting           | Vercel Git integration today; moving to Cloudflare Workers (epic #14)                                   |
| Default branch    | `main` (protected; merging deploys to production)                                                       |

Never read `.env` to find config. If something here is wrong, ask.

## 1. The board

| Status          | Meaning                                         | Who moves it there              |
| --------------- | ----------------------------------------------- | ------------------------------- |
| **Backlog**     | Written, not approved                           | ticketer / anyone               |
| **Ready**       | Approved at G2 and every `Depends on` is merged | orchestrator (after G2 / merge) |
| **In progress** | A worktree and an agent exist for it            | orchestrator                    |
| **In review**   | PR open, checks green, waiting on the human     | orchestrator                    |
| **Done**        | Merged and the production deploy passed         | orchestrator (after deploy)     |

`blocked` is a label, not a column: the card stays where it is and the latest issue comment says what's needed.

Moving a card (best effort; labels and issue comments are the fallback):

```sh
ITEM=$(gh project item-add 2 --owner ptums --url <issue-url> --format json --jq .id)   # also returns the id if already added
gh project item-edit --project-id PVT_kwHOAEPOSs4Blnyt --id "$ITEM" \
  --field-id PVTSSF_lAHOAEPOSs4BlnytzhkT7Cg --single-select-option-id <option-id>
```

## 2. Operating rules

**Autonomous (no asking):** reading code, creating branches and worktrees, writing code, tests, and docs inside a ticket, running lint, typecheck, tests, and builds, `gh` and `git` reads, creating issues in **Backlog**, moving cards, commenting on issues, pushing `ticket/*` branches, opening PRs, watching CI.
**Always ask first:** approving scope or tickets (G1, G2), merging anything, pushing to `main`, production rollbacks or redeploys, changing GitHub secrets, variables, or branch protection, changing Vercel or Cloudflare settings, schema changes against a real database, adding dependencies outside a ticket that allows it, deleting files you didn't create, anything that costs money.
**Never:** bypass hooks or CI; read or print secrets or `data/`; use real family data anywhere; merge your own PRs; run `pnpm seed` / `pnpm backup` (they hit the real database).
**Honesty about verification:** see AGENTS.md rule 12. Mistakes (yours, a subagent's, a test's) go in `docs/REVIEW_LOG.md`.

**Asking well.** At each gate, send ONE message: what was done (3-6 lines), what you need decided, your recommendation, and the exact next step if approved. Batch questions. Don't ask what the docs already answer.

**Waiting is not idle.** While waiting on the human, only do work that doesn't depend on their answer. If none exists, say what you're waiting on and stop.

## 3. Loops

### A. Intake and spec (G1)

1. Restate the request in two lines. Search the board (`gh issue list --search`) for existing tickets.
2. Small and clear (a bug, one component): skip to B and write the ticket yourself.
3. Otherwise spawn **pm** -> `docs/specs/<slug>.md` (problem, user stories, scope and cuts, assumptions, risks, acceptance criteria). If it changes structure (schema, auth, data model, API shape, new dependency), also spawn **architect** -> ADR in `docs/adr/` and an `ARCHITECTURE.md` update. Launch them in the same turn when independent.
4. **G1:** summary, open questions, recommendation. Wait for approval.

### B. Tickets (G2)

1. Spawn **ticketer** with the spec. It creates issues from `.github/ISSUE_TEMPLATE/ticket.yml` in **Backlog**, each with: context, acceptance criteria (checkable by someone who didn't see the reasoning), **Files touched** (globs; disjoint for tickets meant to run together), **Depends on** (`#N`), test plan, size `S`/`M`, labels.
2. Show a table: issue, title, size, depends on, files touched. Plus a mermaid dependency graph if more than 3 tickets.
3. **G2:** the human approves, cuts, or reorders. Move approved tickets with no open dependencies to **Ready**.

### C. Build (parallel, automatic)

For each **Ready** ticket, up to 2 at a time (oldest and most-unblocking first):

1. `git fetch && git worktree add .worktrees/t<N> -b ticket/<N>-<slug> origin/main`, then `cd .worktrees/t<N> && pnpm install --frozen-lockfile && pnpm exec husky` (hooks are silently skipped in a new worktree until you do). Card -> **In progress**; comment "Started in `ticket/<N>-<slug>`".
2. Spawn **developer** with: the issue text (`gh issue view N`), Files touched, the worktree path, and pointers to the AGENTS.md sections that matter. Launch concurrent developers in the same turn.
3. When a developer reports done, run the **independent check** (section 4) yourself. Don't trust a green claim; if it was wrong, log it in REVIEW_LOG.
4. Spawn **reviewer** (and **a11y-auditor** for UI tickets) on `git diff origin/main...HEAD` in the worktree. Blockers go back to the developer; at most 2 rounds, then label `blocked` and raise it at the next gate. Append should-fix and above (and anything the check or CI caught) to `docs/REVIEW_LOG.md`.
5. Before **any** push to a branch that already has a PR, check it's still open: `gh pr view <branch> --json state --jq .state` must be `OPEN`; if it's `MERGED`, start a new branch from `origin/main` and cherry-pick. Push (`git push -u origin ticket/<N>-<slug>`), `gh pr create --fill-first` with the PR template completed: `Closes #N`, check output, reviewer verdict, a11y notes, "read this closely". Card -> **In review**. Wait for CI; fix red in the branch.
6. Continue with tickets that don't depend on open PRs.

### D. Merge (G3)

**G3 message:** each PR (number, title, one line, reviewer verdict, risk) **in recommended merge order**, each with 2-3 **read these closely** items (file and function, what could be wrong, how to check). The human owns every line; say which parts deserve their own eyes. Then: "Reply `merged` when done, plus any findings you want logged."
On reply: log the human's findings (found by: human); `git fetch`; remove merged worktrees (`git worktree remove .worktrees/t<N>`); rebase open branches that now conflict; move newly unblocked tickets to **Ready**; go back to C.

### E. Deploy and verify (automatic; G4 only on failure)

1. Merge to `main` -> **CI** on `main` -> production deploy. **Until the Cloudflare cutover (#14)** the deploy is Vercel's Git integration, not a workflow: ask the human to confirm the production deploy succeeded, then smoke-test it with `E2E_BASE_URL=<production url> pnpm e2e:smoke --project=desktop`. After cutover, `deploy.yml` does both (see section 6).
2. CI and smoke green -> card **Done**.
3. Red -> **G4:** say what failed (log excerpt, no secrets), propose a fix ticket or a rollback (the human runs or approves it). Log the cause in `SELF_IMPROVEMENT.md`.

### F. Retro (after each batch of merges)

Append to `SELF_IMPROVEMENT.md` for every real process problem (blocked agent, conflict, CI surprise, deploy failure, review finding that a test should have caught). Every entry ends with an ACTION that changes a file. Apply approved actions in a PR labeled `process`.

## 4. Independent check (before any PR)

In the ticket's worktree:

1. `pnpm check` (Prettier check, ESLint, typecheck, Jest with coverage thresholds, build) and `pnpm e2e`. Quote the real summary lines.
2. `git diff --stat origin/main...HEAD`: only Files touched changed; `package.json` / lockfile only if the ticket allows it.
3. `git diff origin/main...HEAD -- eslint.baseline.mjs e2e/a11y.spec.ts jest.config.cjs`: baselines didn't grow, thresholds didn't drop.
4. No `.only` / `.skip` / `.todo` / `fixme`; new behavior has tests that would fail without it.
5. No secrets or real family data in the diff (names, dates, URLs from Cloudinary or UploadThing).
6. UI tickets: keyboard and axe checks exist for each new state.

Anything fails: send it back; don't open the PR.

## 5. Ticket format

Issues use `.github/ISSUE_TEMPLATE/ticket.yml`. Title: `<area>: <imperative summary>` (e.g., `tree: make person cards keyboard operable`). Rules: one PR's worth (S < ~100 lines, M ~100-300), checkable acceptance criteria, disjoint Files touched for parallel work, explicit Depends on.

## 6. CI/CD

- `.github/workflows/ci.yml` (every PR and push to `main`): forbid focused or skipped tests -> format:check -> lint -> typecheck -> Jest with coverage -> build -> Playwright e2e (PGlite, no secrets). Uploads the Playwright report on failure.
- **Deploy, today:** Vercel's Git integration (outside Actions) deploys `main` to production and builds a preview per PR. There is no deploy workflow in this repo.
- **Deploy, after the Cloudflare migration (epic #14)**: `.github/workflows/deploy.yml` uploads a Workers preview version per PR + runs `@smoke` e2e against it + comments the URL; after CI passes on `main` it deploys production + runs `@smoke`. The design is settled in the ADR from #12.
- Required configuration for Cloudflare (#13; the human sets values; agents only check names with `gh secret list` / `gh variable list`): secret `CLOUDFLARE_API_TOKEN`, variable `CLOUDFLARE_ACCOUNT_ID`; Worker secrets (`DATABASE_URL`, `OPENAI_API_KEY`, `UPLOADTHING_TOKEN`) per environment. Previews use a Neon **branch**, never the production database, because smoke tests run there.
- Branch protection on `main`: require the `CI / check` and `CI / e2e` checks, require a PR, no force pushes.

## 7. Failure handling

- Subagent stuck or looping: one retry with a sharper prompt, then label `blocked` and raise it at the next gate.
- Merge conflict: rebase on `main`; non-trivial -> developer resolves and re-runs the check.
- Flaky test: never retry it into green silently. Open a `testing` ticket with the failure output; quarantine only with human approval.
- Unexpected working-tree changes you didn't make: stop and tell the human.

## 8. Ledger formats

**`docs/REVIEW_LOG.md`** (append-only):
| # | Issue/PR | Finding | Severity | Found by (reviewer / a11y-auditor / independent check / CI / human / agent self-report) | How found | Fix (commit/PR) | Status |

**`docs/VERIFICATION.md`** (what was checked, how, by whom):
| Check | Type (automated / agent / human) | Result | Evidence (command, run link, or note) | Date |

Keep a standing section of **checks passing tests can miss**: keyboard-only pass on a real browser; VoiceOver pass on the tree and profile dialog; phone-size and 200% zoom; a real large tree (performance, layout overlap); a person with every optional field missing; stale IndexedDB cache after edits; preview deploy against a Neon branch, not production data.
