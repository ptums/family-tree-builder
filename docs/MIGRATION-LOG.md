# Migration log: Vercel -> Cloudflare Workers

Epic #14 · spike/ADR ticket #12 · human setup #13. Append as work happens. No secrets, no real family data.

## Timing

| Event                            | Time (UTC)           |
| -------------------------------- | -------------------- |
| Start                            | 2026-10-04T02:22:32Z |
| Gate 1 (ADR ready, before spike) | 2026-10-04T02:29:33Z |
| End                              | _pending_            |

## Token usage and cost

Not available to the agent: Claude Code's `/cost` is a user command, and the agent can't run it or read its output. **Human: run `/cost` at each gate and paste the line here.**

| When   | /cost output    |
| ------ | --------------- |
| Gate 1 | _human to fill_ |

## Attempts, failures and retries

| #   | Step       | What failed                                                                                       | What changed                                                               | Tries  |
| --- | ---------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| 1   | 1 Snapshot | `@axe-core/playwright` threw "Please use browser.newContext()"                                    | Script creates a context, then a page                                      | 2      |
| 2   | 1 Snapshot | Single Lighthouse run (mobile perf 89) looked stable; reruns gave 75 and 76 (CLS flips 0 / 0.729) | Baseline uses the median of 3 runs per preset                              | 3 runs |
| 3   | 1 Snapshot | Shell working directory reset to the main checkout mid-task                                       | Re-ran with absolute worktree paths; no files written outside the worktree | 1      |

## Commands that matter

| Time (UTC) | Command                                                                   | Why / result                                                                                                                        |
| ---------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 02:22      | `git worktree add .worktrees/t12 -b ticket/12-cloudflare-adr origin/main` | Spike/ADR work isolated from production; base is `005ecae` (Next 15.3.5, `vercel.json` present: Vercel Git deploys **off** on main) |
| 02:23      | `gh api repos/ptums/family-tree-builder/deployments` + `/statuses`        | Find production deployments: last success 2025-08-04                                                                                |
| 02:24      | `npx vercel@62 inspect <latest production deployment>` (read-only)        | Production aliases: `familytreebuilder.building-stuff.xyz`, `family-tree-builder-gamma.vercel.app`; build 1m 22s + post-build 37s   |

| 02:26 | Playwright snapshot of production (status, counts, console, failed requests, axe; no page text) | **Blank**: Clerk script from `clerk.building-stuff.xyz` fails `ERR_NAME_NOT_RESOLVED`; same on the gamma alias |
| 02:28 | `dig clerk.building-stuff.xyz`, `dig NS building-stuff.xyz`, `whois` | Clerk host has no record; DNS at Namecheap BasicDNS; app CNAME -> `vercel-dns-017.com` |
| 02:30 | `pnpm build` + `next start` with `DATABASE_URL=pglite://memory` (local, port 3555) | Local baseline: 6 people render, 0 console errors |
| 02:31-02:40 | `npx lighthouse@12` ×3 mobile, ×3 desktop (Chrome for Testing 1243, headless) | Medians: mobile perf 76, desktop 89; a11y 100, BP 96, SEO 90 |
| 02:32 | Axe via Playwright on the local run | 0 violations |
| 02:35 | `npm view vinext / @opennextjs/cloudflare / wrangler` | vinext 1.0.1 (React >= 19.2.6, Vite 8); OpenNext 1.20.8 (Next >= 15.5.27); wrangler 4.147.0 |

## Deviations from PROCESS.md

- The ADR was written by the orchestrator, not an `architect` subagent: all the evidence was already in this session, and a fresh subagent would have had to re-gather it. The human (or a `reviewer` subagent) should review it at Gate 1.

## Observations outside the task

- An untracked `old_site/` folder appeared in the main checkout during this task. Not created by the agent; not read or touched. Reported to the human.

## Not checked (as of Gate 1)

- Hosted Lighthouse: production is blank, so there is no hosted baseline. A Vercel preview after #15/#17 would give one.
- The Vercel plan and bill (cost "unknown").
- The configured TTL in Namecheap, and the full list of DNS records for `building-stuff.xyz`.
- Whether the Clerk DNS record was removed deliberately.
- Anything about vinext or OpenNext beyond their published peer-dependency ranges: no spike work done yet (Gate 1).
