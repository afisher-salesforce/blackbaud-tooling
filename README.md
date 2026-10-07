# Blackbaud × Salesforce — Capability Alignment

A **discussion / alignment canvas** that maps Blackbaud's application inventory (86 tools across the
Awareness-to-Revenue and Implement-to-Renew value streams) against the Salesforce platform Blackbaud already
invests in. Built for a working review with Blackbaud **Enterprise Architecture (Russ Tallon)** and the **A2R / I2R
Value Stream Leads** — a structured place to react to, correct, and decide what to explore, not a verdict scorecard.

It is a static React/Vite SPA served by a small Express BFF (same architecture as the Siemens DISW Knowledge site),
hosted on Heroku in a Private Space.

> **SE building something like this for another account?** Start with **[`docs/PLAYBOOK.md`](docs/PLAYBOOK.md)** —
> the end-to-end recipe: the opening prompt, the grounding files to gather, the decisions and why, the phase-by-phase
> build, Heroku + GitHub + config-var hygiene, and the gotchas that cost time the first time.

## What it does

- **Capability map** — every capability against a **6-way alignment** placement: Native · Integrates · Data 360 ·
  Partial · Gap · Discuss. Deliberately NOT binary — the point for Enterprise Architecture is the shades of gray
  (e.g. LinkedIn Sales Navigator *integrates* in-platform and via Data 360; it is neither "covered" nor "a gap").
- **Entitlement status** — every capability shows whether Blackbaud **already licenses** the Salesforce capability
  (Licensed / Licensed·expiring / Separate agreement / Not licensed), grounded in the Salesforce asset-line-item
  export (Charleston org) and aligned to the August 2026 evidence matrix. Where a capability is owned AND overlaps a
  third-party tool, a "you already own this — candidate to retire [tool]" callout makes the rationalization payoff
  explicit (Clari, Gong, CoPilot Studio, SteelBrick CPQ, Five9, Qlik). Revenue Cloud is a dedicated thread: CPQ Plus
  and Revenue Cloud Advanced are both licensed today, the migration stalled, and it is framed as a sales-and-renewal
  process change (the Professional Services engagement), not a tool swap.
- **Honest framing** — the alignment column is labeled a **preliminary Salesforce point of view for discussion**,
  starting from Christa's quickly-assembled (partly Gemini-assisted) draft and explicitly not validated with
  Blackbaud. Every capability shows Christa's draft note alongside a Salesforce SE review.
- **Shared discussion notes** — multiple reviewers comment per capability; notes pool together in **Heroku Postgres**
  (threaded, with reviewer name + timestamp) and export to Markdown. Falls back to per-browser localStorage when no
  `DATABASE_URL` is configured, so local dev and un-provisioned deploys still work.
- **Trailhead learning rail** — where Salesforce aligns with an existing tool, curated Trailhead content turns
  "you already own this" into an enablement path.
- **Roadmap tile** — a reserved seam for a future headless Agentforce "rationalization agent" (see Phase 2).

> Deliberately **not** shown for this review: renewal dates, contract value, user counts, utilization. Those are a
> post-meeting data request, not something to map before the session.

## Run locally

```bash
npm install
npm run dev          # Vite dev server on :5173 (proxies /api → :3001)
npm run dev:server   # Express BFF on :3001 (Trailhead catalog + notes API)
```

Requires **Node 20.6+** (the `dev:server` script uses `--env-file-if-exists`). No `.env` is needed for the review;
set `DATABASE_URL` only if you want to exercise the shared-notes store locally (otherwise it falls back to
per-browser localStorage).

Build + serve the production bundle (what Heroku runs):

```bash
npm run build
npm start            # Express serves dist/ + the API on $PORT
```

## Architecture

| Piece | What it is |
|---|---|
| `src/content/capabilities.js` | The data model — 86 tools mapped into capability rows with 6-way alignment, Christa's draft note, the SE review, discussion prompts, and a Trailhead slug. |
| `src/content/alignment.js` | The 6-way alignment taxonomy + the honest disclaimer copy. |
| `src/pages/` | Overview (hero + heatmap + roadmap tile), Capability Map (filterable table), Capability detail (notes + Trailhead rail), A2R / I2R value-stream views. |
| `src/hooks/useLocalNotes.js` | Client-side discussion-note persistence + export. |
| `server.js` | Express BFF: `/api/health`, `/api/trailhead/recommendations/:slug`, and a **reserved, disabled** `/api/agent/*` seam (501) for the future agent. |
| `trailhead.js` + `trailhead-catalog.json` | Runtime reads a committed, human-reviewed catalog (zero live MCP on the request path). `scripts/refresh-trailhead.js` re-pulls the Trailhead MCP offline for review. |

### Refreshing Trailhead content

```bash
npm run refresh:trailhead            # all slugs
npm run refresh:trailhead -- forecasting data360   # specific slugs
```

Review the printed diff, commit `trailhead-catalog.json`, and restart the BFF (the catalog is read once at load).

## Deploy (Heroku, Private Space)

Repo: `afisher-salesforce/blackbaud-tooling` · App: `blackbaud-tooling`. Auto-deploys on push to `main`
(`heroku-postbuild` runs the Vite build; `web: node server.js` serves `dist/` + the API). The app is in a Private
Space, so it is not reachable from the public internet — verify via `heroku releases` / `heroku logs`, not an
external fetch.

**Shared notes store (Heroku Postgres, Private Space):**

```bash
heroku addons:create heroku-postgresql:private-0 --app blackbaud-tooling
```

This sets `DATABASE_URL` automatically. On the next deploy the BFF detects it, creates the `review_notes` table on
boot, and `/api/health` reports `notesStore: "postgres"`. Until then the app runs in per-browser localStorage mode.

## Phase 2 (not built yet)

Writing captured assessments + notes back to Salesforce custom objects, and grounding a headless Agentforce agent on
those records plus Data 360 (structured + unstructured). See [`docs/PHASE2_ARCHITECTURE.md`](docs/PHASE2_ARCHITECTURE.md).

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
