# Outcomes: Vercel -> Cloudflare migration

Before/after evidence for epic #14. Measurements never record page text (real family data): only status, counts, errors, and scores.

## Before (snapshot 2026-10-04, ~02:30-02:45 UTC)

### Production status: **blank**

| Check               | `familytreebuilder.building-stuff.xyz` (also `family-tree-builder-gamma.vercel.app`)                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| HTTP                | 200; `/` redirects to `/barnwell-family-tree`                                                                                       |
| Renders             | **No.** Body text length 0, 0 `h1`, 0 person cards, after network idle + 3 s                                                        |
| Console errors      | `Failed to load resource: net::ERR_NAME_NOT_RESOLVED` (1)                                                                           |
| Failed requests     | `clerk.building-stuff.xyz/npm/@clerk/clerk-js@5/dist/clerk.browser.js`: `ERR_NAME_NOT_RESOLVED` (`dig` returns no record)           |
| Deployed code       | Commit `6aeb21b` (2025-08-04), still wrapped in `ClerkProvider`; Clerk's custom domain no longer resolves, so the app never renders |
| Next.js             | 15.3.5: 3 critical / 12 high advisories (#16); Vercel now refuses to deploy this version                                            |
| Deploys from `main` | **Off** since #11 merged (`vercel.json` `git.deploymentEnabled: false`); #15 turns them back on                                     |

**Cause in one line:** production is broken by a stale Clerk dependency, not by hosting. `main` already removed Clerk; it just hasn't deployed (see the deploy row).

### Lighthouse and axe: **local run**, not production (production doesn't render)

Local = `main` at `005ecae` (Next 15.3.5), `next build && next start` on a MacBook (arm64), in-memory DB with the 6-person synthetic family, Lighthouse 12.8.2, Chrome for Testing 1243 headless, URL `/barnwell-family-tree`.

Three runs per preset; **the median is the baseline** for the "no regression" criterion.

| Metric         | Mobile (default): runs → **median** | Desktop (`--preset=desktop`): runs → **median** |
| -------------- | ----------------------------------- | ----------------------------------------------- |
| Performance    | 89, 75, 76 → **76**                 | 89, 89, 89 → **89**                             |
| Accessibility  | 100, 100, 100 → **100**             | 100, 100, 100 → **100**                         |
| Best practices | 96, 96, 96 → **96**                 | 96, 96, 96 → **96**                             |
| SEO            | 90, 90, 90 → **90**                 | 90, 90, 90 → **90**                             |
| LCP (ms)       | 2108, 2136, 2082 → **2108**         | 473, 473, 474 → **473**                         |
| TBT (ms)       | 45, 39, 42 → **42**                 | 0, 0, 0 → **0**                                 |
| CLS            | 0.000, 0.729, 0.729 → **0.729**     | 0.217, 0.217, 0.217 → **0.217**                 |

Mobile performance is unstable because CLS flips between 0 and 0.729 (a large layout shift, likely the tree's auto-scroll and lazily loaded cards; not investigated, out of scope). One run (89) would have overstated the baseline.

| Axe (wcag2a, wcag2aa, wcag22aa) | Local                                                          | Production                                |
| ------------------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| Violations                      | **0** (6 people rendered, 0 console errors, 0 failed requests) | 0, but **meaningless**: the page is empty |

Caveats: a local run on a laptop with a 6-person in-memory tree is not comparable to a hosted run against Neon with the real tree. The "after" comparison must use the same local method **and** a hosted run, labelled separately. Axe 0 is not "accessible": tree cards aren't keyboard operable (#4).

### Deploy time (merge to live)

| Source                                                                         | Value                                                                                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Vercel's own numbers for the last production deploy (`vercel inspect`)         | build 1m 22s + post-build 37s ≈ **2 min**                                                                  |
| GitHub deployment records (push -> success status), last 12 production deploys | 0 s to several days: **unreliable** (redeploys and late status updates); 3 of the last 5 failed within 1 s |
| Merge to live today                                                            | **N/A**: deploys from `main` are off (see above)                                                           |

### Hosting cost

**Unknown.** Account `peter-ts-projects-33da9322`; the plan and the bill were not visible to the agent. The last build used 4 CPU-minutes (2 vCPU × 2 min).

## After

_Filled in after the spike and the Cloudflare smoke test (Gate 2)._
