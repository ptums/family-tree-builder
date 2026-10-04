# ADR 0001: Move hosting from Vercel to Cloudflare Workers

- **Status:** Proposed. Waiting on **Gate 1** (human approval before the spike starts).
- **Date:** 2026-10-04
- **Issues:** epic #14 · spike #12 · human setup #13 · depends on #15 (Vercel deploys back on) and #16/#17 (Next.js security upgrade)
- **Evidence:** `docs/OUTCOMES.md` ("Before"), `docs/MIGRATION-LOG.md`

## Context

The owner wants to host on Cloudflare instead of Vercel. The "Before" snapshot changes the picture:

1. **Production is blank today, and hosting isn't the cause.** The live deployment (August 2025) still loads Clerk from `clerk.building-stuff.xyz`, which no longer resolves, so React never renders. `main` already removed Clerk, but it hasn't deployed: #11 turned Vercel's Git deploys off (`vercel.json`), and Vercel now **refuses to deploy Next.js 15.3.5** because of critical advisories (#16).
2. **So Vercel is not currently a working rollback target.** The brief keeps Vercel "live as the rollback until Cloudflare passes a smoke test", and a blank page is no rollback. Merging #15 then #17 fixes production on Vercel and is a **precondition** for this migration, independent of it.
3. Adapter requirements found before the spike: **OpenNext** (`@opennextjs/cloudflare` 1.20.8) needs `next >= 15.5.27`, which is #17. **vinext** (1.0.1) needs React >= 19.2.6, Vite 8 and `@vitejs/plugin-rsc`; the app has React 19.1.0. Either way, the spike starts from #17's branch.
4. **DNS for `building-stuff.xyz` is at Namecheap** (BasicDNS). `familytreebuilder.building-stuff.xyz` is a CNAME to Vercel. Workers custom domains and routes need the zone to be **active on Cloudflare**, so cutover needs a nameserver move first (see Cutover).
5. Facts about this app that matter on Workers: Neon over HTTP (`@neondatabase/serverless`); `openai` SDK in `/api/llm`; `uploadthing/next` route handler; `crypto.randomUUID` imported from `"crypto"`; `next/image` with Cloudinary `remotePatterns`; `next/dynamic` with `ssr: false`; a redirect in `next.config.ts`; `lib/pglite.ts` reads `db/schema.sql` and `e2e/fixtures/seed.sql` from disk (e2e only).

## Decision (proposed)

Run a **time-boxed spike** comparing vinext and OpenNext on the same criteria, then migrate to Workers with the winner **only if every GO criterion below passes**. Otherwise **NO-GO**: stay on Vercel and fix the app there.

Until Gate 2, Vercel serves production unchanged. The Cloudflare "production" Worker runs on its `*.workers.dev` URL only; no DNS changes.

## Metric this should move

**Needs the owner's input at Gate 1.** The brief doesn't say why Cloudflare. Candidates, each with a baseline from OUTCOMES:

| Candidate goal               | Metric                                | Baseline                                                                        | Target (proposed)                                           |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Cost / account consolidation | Monthly hosting cost                  | Unknown on Vercel                                                               | Measured after 1 month; $0 on Workers Free if within limits |
| Deploy reliability           | Merge-to-live time and failure rate   | ≈ 2 min build; 3 of the last 5 production deploys failed; deploys currently off | ≤ 5 min, with a smoke-tested deploy on every merge          |
| Performance                  | Hosted Lighthouse performance and LCP | No hosted baseline (production is blank)                                        | No regression vs a hosted Vercel run after #15/#17          |

Guardrails regardless of goal: Lighthouse doesn't regress, axe stays at 0, smoke test passes, rollback is under 15 minutes.

## GO / NO-GO criteria (fixed before the spike)

Each is measured the same way for **vinext** and **OpenNext**. The adapter that passes more criteria wins; ties go to the smaller diff to the app.

| #   | Criterion (GO only if it passes)                                | How it's measured                                                                                                                                                                                                                                                      | vinext  | OpenNext |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| 1   | Compatibility check passes on this app                          | vinext: its compatibility check (`migrate-to-vinext` skill). OpenNext: `opennextjs-cloudflare build` succeeds with no unsupported-feature errors. Both: all routes build.                                                                                              | _spike_ | _spike_  |
| 2a  | UploadThing route handler works on Workers                      | `GET /api/uploadthing` returns the route config; one real upload of a synthetic PDF on the preview Worker                                                                                                                                                              | _spike_ | _spike_  |
| 2b  | OpenAI route handler works                                      | `/api/llm` returns parsed JSON for a synthetic "John Example" text (one real call, gpt-4o-mini, ≤1000 tokens)                                                                                                                                                          | _spike_ | _spike_  |
| 2c  | `crypto.randomUUID` works                                       | `POST /api/family` and `POST /api/documents` create rows with UUIDs                                                                                                                                                                                                    | _spike_ | _spike_  |
| 2d  | Cloudinary images work                                          | A profile with a Cloudinary `profileImg` renders the image (optimized, or `unoptimized` as a documented workaround)                                                                                                                                                    | _spike_ | _spike_  |
| 3a  | E2E suite runs on Cloudflare's local runtime                    | `pnpm e2e` (all 14 tests, desktop + phone) passes against `wrangler dev` / `vinext dev` in workerd                                                                                                                                                                     | _spike_ | _spike_  |
| 3b  | The in-memory test DB stays out of the deployed bundle          | No `@electric-sql/pglite` in the uploaded Worker bundle (inspect the build output); bundle under the Workers size limit                                                                                                                                                | _spike_ | _spike_  |
| 4   | Preview per PR with a smoke test; production after CI on `main` | A test PR gets a preview URL comment and a green `@smoke` run; a `main` run deploys the Worker after CI                                                                                                                                                                | _spike_ | _spike_  |
| 5   | Lighthouse does not regress                                     | Median of 3 runs, same local method as the baseline (but on workerd): performance ≥ baseline − 3 (mobile 73, desktop 86); accessibility, best practices, SEO ≥ baseline (100 / 96 / 90). Plus a hosted run on the `workers.dev` URL, recorded for the after-comparison | _spike_ | _spike_  |

**NO-GO** (stay on Vercel, fix the app instead) if any criterion has a blocker with no workaround, or the **time-box of 2 working sessions** runs out. _(Owner: define a "working session" at Gate 1; proposed: one sitting of up to ~3 hours of agent work.)_

## Known risks going in

- **Preview Workers share production secrets.** Preview _versions_ of a Worker use that Worker's secrets, so a preview would hit the **production** database. Proposed fix: a separate Worker for previews (`family-tree-builder-preview`, wrangler `--env preview`) with its own `DATABASE_URL` pointing at the Neon preview branch. The spike verifies this.
- **PGlite on workerd** has no filesystem; `lib/pglite.ts` reads SQL files from disk. Options: inline the SQL at build time (vinext/Vite `?raw` imports), run PGlite in workerd if its WASM loads there, or run e2e against a Neon branch reset per run (which needs a CI secret). The spike picks one; criterion 3 decides.
- **Bundle size**: Workers limits compressed Worker size per plan; `openai`, `uploadthing`, and React Server Components bundles add up.
- **`next/image`**: Vercel's optimizer goes away; Cloudflare Images (a binding, possibly paid) or `unoptimized`.
- **Upgrades on the critical path**: Next 15.5.27 (both adapters); React 19.2.6+ and Vite 8 (vinext). These are dependency changes inside a ticket that allows them.

## Smoke test (must pass on the Cloudflare URL before Gate 2)

Runs against the **preview Worker** (Neon preview branch). Write steps use only synthetic data and clean up after themselves.

| Step | Check                                                          | Note                                                                                                                                                             |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Home page renders, not blank: `h1` present and ≥ 1 person card | Data-agnostic, so it can also run on production                                                                                                                  |
| 2    | **Sign-in page loads**                                         | **Conflict: there is no sign-in.** Clerk was removed; auth is #5. Proposed: mark N/A until #5, and check `/import` loads instead. **Owner to decide at Gate 1.** |
| 3    | Create a person                                                | `POST` "Smoke Test Example" via the UI; the person appears; deleted afterwards (direct SQL on the preview branch, since there is no delete endpoint)             |
| 4    | Upload a document                                              | Synthetic one-page PDF via UploadThing on the smoke person; listed in the profile; removed after (DB row + UploadThing file)                                     |
| 5    | LLM responds                                                   | `/import` "Preview Data" with synthetic text returns parsed people. **One real OpenAI call per run (small cost); not inserted.**                                 |
| 6    | No console errors                                              | Collected across steps 1-5; any error fails the run                                                                                                              |

Steps 3-5 need the preview Worker's secrets (#13) and must never run against production data.

## CI/CD (Step 4 of the brief; built during the spike, kept behind Gate 2)

`.github/workflows/deploy-cloudflare.yml`, alongside Vercel (nothing Vercel-related is removed):

- **PR** (same-repo only): build with the chosen adapter -> `wrangler versions upload --env preview` (preview alias `pr-<n>`) -> smoke test (steps 1, 6; steps 3-5 behind a label so they don't run on every push) -> sticky PR comment with the URL.
- **`main`**: on `workflow_run` of CI succeeding on a push -> build -> `wrangler deploy` (production Worker, **`workers.dev` only until cutover**) -> smoke step 1 + 6.
- Credentials: secret `CLOUDFLARE_API_TOKEN`, variable `CLOUDFLARE_ACCOUNT_ID` (#13). Worker secrets are set by the owner per Worker, never by agents.

## Cutover (after Gate 2 only)

1. **Move DNS to Cloudflare without changing behavior:** add `building-stuff.xyz` to Cloudflare, copy **every** existing record (the owner checks the list in Namecheap; there may be mail or other subdomains), keep `familytreebuilder` as a **DNS-only** CNAME to Vercel, then switch Namecheap's nameservers to Cloudflare. Propagation takes up to 24-48 h; production stays on Vercel the whole time.
2. Lower the `familytreebuilder` record's TTL to 60 s at least one old-TTL period before the switch.
3. Switch: attach `familytreebuilder.building-stuff.xyz` as a Worker custom domain (this replaces the CNAME). Run the smoke test on the real domain.

## Rollback

| Situation                                | Action                                                                                                                                                                                                                                         | Time                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| After cutover (DNS on Cloudflare)        | Remove the Worker custom domain and re-create the DNS-only CNAME `familytreebuilder` -> `16012f7dd388855e.vercel-dns-017.com` (the current target; confirm in Vercel's domain settings). Vercel keeps serving since nothing there was removed. | ~2 min to edit + TTL (60 s if lowered) ≈ **5 min**                                   |
| During the NS move                       | Switch Namecheap nameservers back to `dns1/dns2.registrar-servers.com` (records there are untouched)                                                                                                                                           | Up to 24-48 h for resolvers; this is why the NS move happens with no behavior change |
| Bad Worker deploy (pre- or post-cutover) | `wrangler rollback` to the previous version (owner runs or approves)                                                                                                                                                                           | < 1 min                                                                              |

The rollback is rehearsed once on the `workers.dev` URL before Gate 2, and the time is recorded.

Observed today: public resolvers cache the current CNAME for at least ~8 min (486 s remaining when queried); the configured TTL in Namecheap is unknown, so the owner checks it.

## Deliberately not built

- The marketing site (`old_site/`, if that's what it is) and any feature changes
- Authentication (#5); the smoke test's sign-in step stays N/A until then
- R2, KV, D1, Queues, or Cloudflare Images unless criterion 2d needs Images
- Removing or disabling anything on Vercel (the owner does it after Gate 3)
- Next.js 16

## Consequences

- **GO:** two deploy paths run side by side until Gate 3; a preview Worker plus a production Worker, each with its own secrets; the e2e runtime moves to workerd. Agents' allow and deny lists gain wrangler rules.
- **NO-GO:** close #14 with the evidence; production stays on Vercel (already fixed by #15/#17); the spike branch is deleted.
