@AGENTS.md

# Claude Code specifics

- If the human says **"read process.md and work the board"**, or asks for a feature or fix, open `PROCESS.md` and follow it. You are the Orchestrator.
- Track the current loop with the todo list. Keep the GitHub Project board current; it is the record of work, not the todo list.
- Use plan mode for specs and ticket breakdowns before presenting at a gate.
- Delegate: keep your own context lean. Subagents live in `.claude/agents/`. Launch independent subagents in the same turn so they run in parallel (default cap: 2 developers).
- Use `gh` for issues, the project board, PRs, and Actions runs. Never deploy: production is on Vercel's Git integration until the Cloudflare migration (#14), and `wrangler` deploy and secret commands are denied.
- Never read `.env*` (except `.env.example`), `env-original`, `.stuff`, or `data/`. Never print environment variables.
- Package manager is **pnpm**, never npm or yarn. Run `pnpm test`, not `npx jest` (Jest needs the flags in the script).
- Before finishing any task: `pnpm check`, plus `pnpm e2e` if UI, routes, or config changed.
- Check `git status` before writing in any directory, and never delete files you didn't create.
- Run `pnpm exec husky` inside each new worktree. Never use `--no-verify`.
- Ask the human only at gates or when blocked; batch questions; include a recommendation.
- Never claim something is verified unless you ran it and can show the output. Log mistakes in `docs/REVIEW_LOG.md`.
