---
name: rationalization-site
description: >-
  Drive the end-to-end build of a customer "application-rationalization discussion site" + live
  Agentforce agent, following the Blackbaud playbook. TRIGGER when a Salesforce SE wants to build a
  tooling-rationalization or capability-alignment discussion site/canvas for an account — mapping the
  customer's tool inventory to the Salesforce capability that already covers it, capturing the
  customer's corrections live, and (optionally) backing it with a headless Agentforce agent grounded
  in Salesforce + Data 360 — e.g. "build a rationalization site like Blackbaud for <account>",
  "capability-alignment canvas", "application-rationalization discussion site", "map their tools to
  what they already own in Salesforce". DO NOT TRIGGER for: a generic React app with no
  rationalization/alignment framing (use building-ui-bundle-app or frontend skills); building or
  editing an Agentforce agent on its own (use developing-agentforce); Data Cloud/Data 360 work with
  no site (use the datacloud skills); or editing THIS repo's existing site (just edit it directly).
---

# Rationalization site + live agent — build driver

You are helping a Salesforce SE build, for a specific account, the artifact documented in the
**playbook**. This skill is thin on purpose: the playbook is the single source of truth for the
method, the file inventory, the decisions, the architecture, the deploy/config steps, and the
gotchas. Your job is to **read it, then drive the build in the right order** — not to re-derive it.

## Step 0 — Load the playbook (do this first, always)

Read the full playbook before anything else:

- **Working inside the `blackbaud-tooling` repo:** read `docs/PLAYBOOK.md` locally.
- **Working in another account's project:** fetch it from the reference implementation —
  `https://github.com/afisher-salesforce/blackbaud-tooling/blob/main/docs/PLAYBOOK.md` (raw:
  `https://raw.githubusercontent.com/afisher-salesforce/blackbaud-tooling/main/docs/PLAYBOOK.md`).
  Also browse that repo as the worked example when you need a concrete file to mirror.

Everything below refers to sections of that playbook. If the playbook and this file ever disagree,
**the playbook wins** — tell the user and follow the playbook.

## Step 1 — Plan first; lock the decisions (do NOT start coding)

Enter plan mode. Use the playbook's **§0 opening prompt** shape to interview the SE, then get explicit
answers on the **§2 decisions** before writing any code. At minimum confirm:

1. Discussion canvas vs. verdict tool (default: **discussion canvas**).
2. The **6-way alignment spectrum** + the honest "draft, not validated" disclaimer (§2.2).
3. "retire" is reframed to **"overlap / consolidate"** everywhere (§2.3).
4. Commercial columns (renewal/ACV/users) **hidden for meeting 1** (§2.4).
5. **Stage it:** read-only site first, live agent second (§2.5).
6. Hosting/source-control: **GitHub + Heroku auto-deploy, secrets in config vars** (§2.6).
7. **Reserve the `/api/agent/*` seam** in v1 even if the agent comes later (§2.7).

Also confirm the SE has (or will gather) the **§1 grounding files** — especially the **Salesforce
asset/entitlement export**, the highest-leverage input. Do not fabricate a tool inventory or
entitlements; if a grounding file is missing, say so and proceed with what exists, flagging the gap.

Present the plan (ExitPlanMode) and get approval before building.

## Step 2 — Build the read-only discussion site (a complete increment)

Follow playbook **§3 (architecture)**. Mirror the reference implementation's shape:

- Content as the single source of truth in `src/content/*.js` (capabilities / alignment /
  entitlements), **shaped 1:1 onto future Salesforce custom objects** so it can be seeded later.
  **Reconcile the tool count exactly** — a number that doesn't tie out kills credibility.
- Vite + React + react-router-dom + Tailwind + lucide-react SPA; small **Express BFF** (`server.js`)
  serving `dist/` + `/api/*`. The SF token must never reach the browser.
- Per-capability shared notes with **graceful localStorage fallback when `DATABASE_URL` is unset**
  (`db.js`), a Trailhead learning rail pulled **offline** into a committed catalog, honest disclaimer
  banner, hidden commercial columns, and the **reserved `/api/agent/*` seam** (501 + roadmap tile).

Verify with a clean `vite build` and a browser pass (preview tools), then this is demoable on its own.

## Step 3 — Hosting + config-var hygiene

Follow playbook **§4**. `Procfile` = `web: node server.js`; `heroku-postbuild` runs the Vite build;
connect GitHub + enable **auto-deploy on `main`**. **All secrets are Heroku config vars, never in the
repo or the client bundle.** `.trim()` every env var in `server.js` (whitespace from copy-paste is a
real bug). If the Heroku app is in a Private Space, verify via `heroku releases`/`logs`, not external
curl.

## Step 4 — Wire the live agent (Phase 2, optional / staged)

Only after the read-only site is shipped. Follow playbook **§5 in that exact order**: 3 custom objects
(+`External_Id__c`, seed script) → grounding Apex action → **ECA with JWT client-credentials, Run-As a
provisioned Agent User + perm set** → author the AiAuthoringBundle and **`sf agent publish
authoring-bundle` + `sf agent activate` (NOT a metadata deploy)** → Data 360 Data Library (sanitized
`.txt` corpus) attached as a retriever → flip the Heroku config vars.

**Honor the §5 gotchas — they each cost a detour the first time:**
- Publish the agent with `sf agent publish`, never metadata deploy.
- **New custom fields need FLS *applied*, not just declared** in the perm-set XML; verify FLS actually
  landed on the agent/integration user. A "read-only"/"withheld" symptom is usually FLS, not the gate.
- **Builder Preview never persists writes** — test write actions in the live drawer only.
- Data Library takes PDF/HTML/**TXT, not `.md`** — convert the corpus.
- ECA client-credentials needs a **Run-As user** set, or you get `invalid_grant`.
- Agent API: `api.salesforce.com/einstein/ai-agent/v1`, client-credentials JWT, `bypassUser:false`,
  structured message body, **My Domain** URL in `instanceConfig.endpoint`.

## Step 5 — Demo script

Produce a `docs/DEMO_SCRIPT.md` per the reference: read the disclaimer first, lead with "what do you
already own," show the overlap/consolidation story, exercise the live agent, and close on "it's all
captured in Salesforce, not a deck."

## Guardrails

- **Thin skill, playbook is truth.** Don't restate the playbook's substance here; read it and drive.
- **Plan before code.** The credibility of the artifact with Enterprise Architecture depends on the
  framing decisions being settled first.
- **Never overclaim.** Name real gaps honestly (the `gap` alignment); don't invent coverage,
  entitlements, or consolidation claims the grounding files don't support.
- **Secrets never in the repo or bundle.** Config vars only.
- **Sanitize transcripts** (strip names + candid internal remarks) before anything goes into a Data
  360 grounding corpus; have the SE review the sanitized summary before upload.
