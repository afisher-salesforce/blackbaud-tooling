# Playbook — Build a customer "application-rationalization discussion site" + live Agentforce agent

> **What this is.** A repeatable recipe for turning a customer's messy tooling inventory into a
> **live, SE-built discussion canvas** that (1) maps every tool the customer runs to the Salesforce
> capability that already covers it, (2) captures the customer's own corrections *in the meeting*,
> and (3) is backed by a **headless Agentforce agent grounded in Salesforce + Data 360** so the room
> can ask the data questions out loud. `blackbaud-tooling` (this repo) is the worked example — a
> customer that spends $6M/yr with Salesforce yet treats it as a competitor; the site reframes the
> conversation from "should we buy tool X?" to "you already own this."
>
> **Audience:** fellow Salesforce SEs. Assumes you know what an ECA, permission set, perm-set FLS,
> SOQL, and a React/Node app are. It focuses on the *method, the decisions, and the gotchas* — the
> things that cost time the first time.
>
> **Time to market:** ~1 day to a deployed read-only discussion site; +1 day to wire the live agent
> with Data 360 grounding. The long pole is **gathering good grounding files**, not the build.

---

## 0 · How to start — the opening prompt

Don't ask the model to "build a site." Ask it to **plan**, hand it the raw material, and lock the
decisions first. This is the prompt shape that worked (paraphrased — adapt the specifics):

> *"I'm a Salesforce SE prepping for a review with [customer]'s Enterprise Architecture lead and
> their value-stream owners. They run ~[N] tools and spend $[X]/yr with Salesforce but treat us as
> a competitor. I want to build them a **discussion canvas** — a working web app that maps each of
> their tools to the Salesforce capability that already covers it, so the conversation becomes
> 'what do you already own?' rather than a pitch. I'll give you their tool inventory, a first-pass
> analysis, their Salesforce entitlement export, and some call transcripts. I have a GitHub repo and
> a Heroku app already created. Use the Trailhead MCP to ground capability claims. Build me a plan
> and ask clarifying questions before writing code."*

Then **go to plan mode** and let the model interview you. The decisions below are the ones worth
settling up front — they shaped everything downstream.

### Why plan-first matters here
The whole artifact lives or dies on **credibility with Enterprise Architecture**. If the model
starts coding before you've decided "is this a verdict tool or a discussion tool?" you get a
confident-looking site that overclaims and loses the room. Plan mode forces the framing decisions
to the front.

---

## 1 · Grounding files to gather (the real long pole)

Collect these *before* building. The quality of the map is capped by the quality of these inputs.
For Blackbaud the set was:

| File | What it is | Why it matters | Authority |
|---|---|---|---|
| **Tool inventory** (`BB-Tool-Inventory.xlsx`) | Every tool × value stream × capability × sub-capability × primary users | The spine — defines **what exists** and the row structure of the whole site | Authoritative for *what* |
| **First-pass analysis** (`Oct FY27 … Tech Stack Inventory.xlsx`) | The customer's / a colleague's quick mapping (here: Gemini-assisted) with Covered / Not Covered / Inconclusive verdicts + prose | Your **draft to correct** — surface it honestly as "a quick draft, not validated," then improve it | Starting point only |
| **Salesforce entitlement export** (`… Asset Line Items … .xlsx`, from the mgmt/Charleston org) | Exactly what the customer already **owns** — SKUs, seat counts, expiry dates | The reframe engine: "you already pay for this." The single highest-leverage file | Authoritative for *owned* |
| **Capability-map PDF** | Salesforce's capability taxonomy / preliminary tool analysis | Grounds the alignment vocabulary | Reference |
| **External research brief** (PDF) | Analyst / web research on the customer's AI & platform priorities | Feeds the unstructured Data 360 corpus | Reference |
| **Call transcripts** (external discovery + internal prep) | What was actually said — RFCs in flight, stalled migrations, who owns what | Source of the *narrative* (sanitized) + the sharpest talking points | Reference — **sanitize before grounding** |

**Lessons on grounding files:**
- The **entitlement export is the star.** Everything persuasive ("you own 13 Salesforce entitlements
  covering 12 of these capabilities; 5 overlap a tool you also run") derives from it. Get it early.
- The first-pass analysis will be **too black-and-white.** Treat it as a draft to improve, and *say
  so on the site* — the honesty is the credibility move (see §2, decision 2).
- **Transcripts must be sanitized** before they go into any grounding corpus — strip names and candid
  internal commentary, keep facts and decisions. (See §4, Data Library.)
- Reconcile the tool count exactly. 86 raw rows → 59 capability rows; one duplicate (Calendly) had to
  be removed. A number that doesn't tie out undermines trust.

---

## 2 · Decisions that shaped the build (and why)

These are the forks worth deciding deliberately. Each is a lever on credibility, not just UX.

1. **Discussion canvas, not a verdict tool.** Frame every alignment as a conversation starter the
   customer corrects — capture their input per capability. A decision tool invites "who are you to
   decide?"; a discussion canvas invites participation.

2. **A nuanced alignment spectrum, not binary "covered / not covered."** We used a **6-way taxonomy**:
   `native` (SF out-of-box) · `integrates` (SF surfaces the tool in-platform) · `data360` (keep the
   tool, unify its data) · `partial` · `gap` (SF genuinely doesn't play) · `discuss` (needs input).
   The canonical "shades of gray" example: *LinkedIn Sales Navigator = integrates + Data 360*, not
   "inconclusive." **Naming real gaps honestly is what makes the Native calls believable to EA.**

3. **Reframe "retire" → "overlap / consolidate."** Never tell a customer to retire a tool — they may
   have contractual lock-in or sunk implementation cost. The thesis is *consolidate work onto the
   platform you already own and cut context-switching*; contract terms decide what actually moves.
   This single wording change de-risks the whole conversation.

4. **Hide the commercial columns for the first meeting.** Renewal date / ACV / #users / utilization
   were deliberately **not** mapped before the review — that data is a *post-meeting ask*. (Later we
   added optional per-tool capture fields once the customer wanted to record them live — see §3.)

5. **Stage the build: read-only site first, live agent second.** Ship a complete, demoable read-only
   discussion site, then add org connectivity + Data 360 grounding as a clean second phase. Don't
   block the first demo on org access or a security review of write-back.

6. **Own the hosting + source-control story.** GitHub repo + Heroku app with auto-deploy on `main`;
   **config/secrets in Heroku config vars, never in the repo or the client bundle** (see §4).

7. **Reserve the agent seam even in v1.** The read-only site shipped with a stubbed `/api/agent/*`
   (501) and a visible "roadmap" tile, so turning the agent on later was a drop-in, not a rebuild.

---

## 3 · The architecture (what the React app needs to work)

A deliberately boring, portable stack — the point is reproducibility, not novelty.

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (React SPA)                                           │
│   Vite + React + react-router-dom + Tailwind + lucide-react   │
│   Content lives in src/content/*.js (capabilities, alignment, │
│   entitlements) — the single source of truth, shaped 1:1 onto │
│   Salesforce custom objects for later seeding.                │
└───────────────┬───────────────────────────────────────────────┘
                │ /api/*  (same-origin; no secrets in the browser)
┌───────────────▼───────────────────────────────────────────────┐
│ Express BFF (server.js) — serves dist/ AND the API             │
│   • /api/notes*      shared review notes (Heroku Postgres)     │
│   • /api/tools, /api/tool/:id   per-tool commercial capture    │
│   • /api/agent/*     Agent API proxy (holds the SF token)      │
│   • /api/trailhead/* serves a committed catalog (no live MCP)  │
│   • /api/health      reports what's configured                 │
└───────────────┬───────────────────────────────────────────────┘
                │ client-credentials JWT (server-side only)
┌───────────────▼───────────────────────────────────────────────┐
│ Salesforce org (Tech IDO) — Agentforce agent + 3 custom        │
│   objects (BB_Capability__c / BB_Entitlement__c / BB_Tool__c)  │
│   + Data 360 Data Library (unstructured RAG grounding)         │
└─────────────────────────────────────────────────────────────────┘
```

**Why a BFF (Backend-for-Frontend) and not a static site?**
- The Salesforce token must **never** reach the browser. The Express server holds the
  client-credentials secret and proxies the Agent API. The React app only ever calls same-origin
  `/api/*`.
- One process (`web: node server.js`) serves both the built SPA (`dist/`) and the API, so Heroku
  needs a single dyno. `heroku-postbuild` runs `vite build`.

**Key files (real paths in this repo):**
- `src/content/capabilities.js` — 59 capability rows reconciling 86 tools; helpers `licensedCount()`,
  `consolidationCandidates()`, `entitlementsOwnedCount()`, `toolsCoveredCount()`.
- `src/content/alignment.js` — the 6-way taxonomy + the honest disclaimer string.
- `src/content/entitlements.js` — `OWNED_PRODUCTS` (what the customer owns), from the asset export.
- `server.js` — the BFF: notes, tool capture, agent proxy, trailhead, health.
- `db.js` — lazy, idempotent Postgres; **graceful fallback to localStorage when `DATABASE_URL` is
  unset**, so local dev and un-provisioned deploys never crash.
- `trailhead.js` + `trailhead-catalog.json` + `scripts/refresh-trailhead.js` — Trailhead grounding is
  **pulled offline** into a committed catalog, so there is zero live-MCP dependency on the request path.

**Trailhead MCP as a grounding tool.** Use the Trailhead MCP to validate capability claims and to
populate a learning rail — but do the pull **offline** (`npm run refresh:trailhead`) and commit the
catalog. Live MCP calls on every page request are fragile and slow.

---

## 4 · Deploy, GitHub, and config-var hygiene

### GitHub + Heroku auto-deploy
1. Create the GitHub repo and the Heroku app (SE does this once; both pre-exist here).
2. In Heroku → **Deploy** tab, connect the GitHub repo and **enable automatic deploys on `main`**.
3. `Procfile`: `web: node server.js`. `package.json` has `"heroku-postbuild": "npm run build"`
   (Vite build) and `"start": "node server.js"`.
4. From then on, **every push to `main` auto-builds and deploys.** No manual release step.

### Config vars live in Heroku, not the repo
**Nothing secret is committed.** The client bundle is public; the repo is (often) shareable. All
configuration is Heroku **config vars**, read by `server.js` via `process.env`:

| Config var | Purpose |
|---|---|
| `DATABASE_URL` | Heroku Postgres (set automatically by the addon). Absent → notes fall back to localStorage |
| `SF_AGENT_ID` | The deployed Agentforce agent's BotDefinition Id |
| `SF_CLIENT_ID` / `SF_CLIENT_SECRET` | ECA client-credentials creds (the token the BFF mints) |
| `SF_INSTANCE_URL` | The org's **My Domain** URL (used in the Agent API `instanceConfig.endpoint`) |
| `SF_LOGIN_URL` | Token endpoint host |
| `SF_API_VER` | Salesforce API version (e.g. `v65.0`) |
| `SF_AGENT_API_HOST` | Agent API host (defaults to `api.salesforce.com`) |
| `ALLOW_WRITES` | Honest gate on write-back routes; the real enforcement is org FLS + the agent's `allowWrites` var |

- Shared review notes: `heroku addons:create heroku-postgresql:private-0 --app <app>` (Private-Space
  compatible). The table auto-creates on first boot; no migration step.
- `/api/health` reports `agentConfigured` and `notesStore: postgres|local` so you can confirm wiring
  without leaking anything.

> **Private Space note:** if the Heroku app is in a Private Space it is **not publicly reachable** —
> verify deploys with `heroku releases` / `heroku logs`, not an external `curl` or browser-from-nowhere.

### Secret-handling gotcha (cost real time)
`SF_INSTANCE_URL` was set with a **trailing space/newline**, producing `Failed to parse URL`. **`.trim()`
every env var in `server.js`** and re-set the config var cleanly. Copy-paste from a spreadsheet or
chat almost always smuggles whitespace.

---

## 5 · Wiring the live agent (Phase 2) — the hard-won sequence

The agent is a **headless Agentforce agent** called from the site's chat drawer via the Agent API.
Grounding is two-tier: **structured** (Apex action over 3 custom objects) + **unstructured** (Data 360
Data Library / RAG). Do it in this order:

1. **Model the data.** 3 custom objects (`BB_Capability__c`, `BB_Entitlement__c`, `BB_Tool__c`) with a
   unique `External_Id__c` on each for idempotent upsert, related by lookups. Seed from the site's own
   `src/content/*.js` via Composite REST (`scripts/seed-salesforce.mjs`) so the site and org never
   diverge.
2. **Build the grounding Apex action.** `BB_SearchRationalization` (`@InvocableMethod`), SOSL/SOQL over
   the 3 objects, returns the SE-review prose as the answer body + a relative `/capability/<id>` link
   for an in-app citation. (Write actions `BB_CaptureNote`, `BB_UpdateTool` are added later, gated.)
3. **Create the ECA (External Client App), not a classic Connected App.** Client-credentials flow,
   **"Issue JWT-based access tokens" enabled**, scopes `api chatbot_api sfap_api refresh_token`.
   Set the **Run-As user** to a provisioned Einstein **Agent User** (never an admin login) carrying a
   dedicated permission set — not the Admin profile.
4. **Author the agent as an AiAuthoringBundle** (`.agent`) and **publish with the agent plugin, not a
   metadata deploy:** `sf agent publish authoring-bundle --api-name <name>` then `sf agent activate`
   (needs `@salesforce/plugin-agent` v2.x). This is the single biggest "why won't it deploy" trap.
5. **Add Data 360 grounding.** Create an **Agentforce Data Library**, upload a *curated, sanitized*
   corpus, let it auto-chunk + vectorize, and attach it as a retriever. Keep the Apex action too — the
   planner routes precise facts to Apex and narrative questions to the library.
6. **Flip the site live.** Set the Heroku config vars; the reserved `/api/agent/*` seam activates and
   the roadmap tile becomes the live drawer. No front-end rebuild.

### Agent / org gotchas (each one cost a detour)
- **Publish via `sf agent publish`, NOT metadata deploy.** An AiAuthoringBundle pushed as metadata
  silently misbehaves.
- **New custom fields need FLS *applied*, not just *declared*.** A field created in the same deploy as
  the perm set often lands with **no FLS on the agent user**, even though the perm-set XML says
  `editable:true`. Symptom is misleading — the agent says "environment is read-only" / the action is
  "withheld," which looks like the write gate, **but the real cause is FLS.** After deploy, verify FLS
  actually applied to the agent/integration user; fix in the org UI and retrieve the perm set back.
- **Builder Preview never persists side-effecting Apex** (it mocks/withholds writes). A write action
  will "fail" in Preview and succeed only in the **live drawer**. Always test writes live, never trust
  Preview for them.
- **Client-credentials `invalid_grant: no client credentials user enabled`** → set the Run-As user on
  the ECA.
- **Data Library accepts PDF/HTML/TXT, not `.md`.** Convert the corpus to `.txt` before upload
  (`scripts/build-corpus.mjs` produces the `.txt` copies).
- **Agent API call shape** (the 5 things that make session+message calls work): host
  `api.salesforce.com/einstein/ai-agent/v1`, client-credentials JWT, `bypassUser:false`, a structured
  message body, and the **My Domain** URL in `instanceConfig.endpoint`.
- **Variable-driven retriever config** demos well: binding the Data Library retriever to an agent
  **variable** (rather than a fixed asset id) is itself a Data 360 best-practice worth showing a
  customer who's struggling with their own config.

---

## 6 · Reuse checklist — do this for the next account

- [ ] **Gather grounding files** — tool inventory, a first-pass analysis, the **Salesforce asset/
      entitlement export** (highest leverage), capability PDF, research brief, sanitized transcripts.
- [ ] **Open with a plan-mode prompt** (§0); lock the 7 decisions (§2) before any code.
- [ ] Model content in `src/content/*.js`, shaped 1:1 onto future custom objects; **reconcile the tool
      count exactly.**
- [ ] Build the read-only discussion site (6-way alignment, honest disclaimer, hidden commercial cols,
      per-capability notes, Trailhead rail). **Reserve the `/api/agent/*` seam.**
- [ ] GitHub repo + Heroku app; **auto-deploy on `main`**; `Procfile` + `heroku-postbuild`;
      **secrets in Heroku config vars only**; `.trim()` every env var.
- [ ] Ship + demo read-only. (This is a complete increment.)
- [ ] Phase 2: 3 custom objects + `External_Id__c` + seed script; grounding Apex action; **ECA with
      JWT client-credentials, Run-As Agent User + perm set**; author + **`sf agent publish`** + activate.
- [ ] Data 360 Data Library (sanitized `.txt` corpus) attached as a retriever; keep the Apex action.
- [ ] **Verify FLS actually applied; test writes in the live drawer, not Preview.**
- [ ] Flip Heroku config vars → agent live; demo the conversational grounding.
- [ ] Write the demo script (`docs/DEMO_SCRIPT.md`) — read the disclaimer first, lead with "what do you
      already own," end on "it's all captured in Salesforce, not a deck."

---

## Appendix — this repo as the reference implementation

- **Pages:** Overview (`/`), Capability Map (`/map`), capability detail (`/capability/:id`), value-stream
  views (`/a2r`, `/i2r`).
- **Docs:** [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) · [`PHASE2_ARCHITECTURE.md`](PHASE2_ARCHITECTURE.md) ·
  [`PHASE2B_DATA360.md`](PHASE2B_DATA360.md) (Data 360 runbook).
- **Scripts:** `seed-salesforce.mjs`, `migrate-notes-to-sf.mjs`, `build-corpus.mjs`,
  `upload-datalibrary.mjs`, `refresh-trailhead.js`.
- **Apex:** `BB_SearchRationalization` (grounding) · `BB_CaptureNote`, `BB_UpdateTool` (gated writes) +
  tests.
- **Agent:** `force-app/main/default/aiAuthoringBundles/BB_Rationalization_Agent/`.
