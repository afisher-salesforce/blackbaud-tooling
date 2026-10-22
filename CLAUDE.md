# CLAUDE.md — Blackbaud Tooling / Application Rationalization

Project context recovered from prior Claude Code sessions (Oct 2–9, 2026; main transcript `795db99b`) plus saved
memory. Raw transcripts live in `docs/prior-sessions/` (gitignored — may contain secrets; never commit).

## What this is

A **capability-alignment discussion site** for Blackbaud's application-rationalization effort. Blackbaud spends
~$6M/yr with Salesforce yet treats it as a competitor in non-profit; the CIO supports rationalizing **86 tools toward
the 60s**. The site maps Blackbaud's 86-tool inventory (A2R = Awareness-to-Revenue, I2R = Implement-to-Renew value
streams) against Salesforce capabilities and what Blackbaud **already owns**.

- **Audience:** Blackbaud Enterprise Architecture lead + A2R/I2R Value Stream Leads (EA review held Fri 2026-10-09);
  CTO is the forward-to-exec target after EA buy-in.
- **Team:** AE = Christa · SE = Drew Fisher.
- **Thesis:** "Start inward first — build the platform you already own." Platform strategy / less context-switching,
  **not** ripping tools out. Overclaiming to EA kills credibility — leave genuine gaps as gaps.
- **Revenue Cloud thread:** Blackbaud pays for BOTH SteelBrick CPQ Plus and Revenue Cloud Advanced; migration stalled.
  Frame as a sales + renewal process change (CLM with Agentforce Revenue Management; OSF likely partner) to set up a
  PS engagement — don't hard-sell.
- **Related earlier work:** Blackbaud forecasting demo (Jul 2026, Clari/Gong replacement) and the Aug 2026
  Salesforce-capabilities-first site (`afisher-salesforce/blackbaud-capabilities`, branch `feature/heroku-clerk-auth`,
  `BLACKBAUD_EVIDENCE_MATRIX.md`). Keep entitlement vocabulary consistent with that matrix.

## Locked design decisions

1. Discussion canvas, not a verdict tool — verdicts are conversation starters.
2. **6-way alignment taxonomy** (`src/content/alignment.js`): `native` · `integrates` · `data360` · `partial` · `gap` ·
   `discuss`. Canonical example: LinkedIn Sales Navigator = integrates + Data 360.
3. Christa's draft (partly Gemini-assisted) is labeled "shared, not yet validated by Salesforce"; each row also has an
   SE review. In the **standalone EA file** it is relabeled **"Google Gemini notes"** and no individual is named.
4. **"Retire" was reframed to "overlap / consolidation"** (2026-10-06) — contract lock-in and sunk implementation cost
   may block retirement. Use `overlaps`, `consolidationCandidates()`, `OverlapCallout`. Don't reintroduce "retire".
5. Renewal date / ACV / users / utilization were hidden for the review; per-tool commercial data is now captured live
   on `BB_Tool__c` (Priority, Contract Maturity, Users, Contract Amount).

## Canonical numbers (must reconcile everywhere)

86 tools · 59 capability areas (BB rows, *not* SF capabilities) · 14 SF entitlements owned · 12 capabilities already
covered · **65 tools Salesforce overlaps** (native+integrates+data360+**partial**) · 5 consolidation candidates
(Clari, Gong, CoPilot Studio, SteelBrick CPQ, Qlik — Qlik/Tableau expiring ~Jan 2027). A2R 42 + I2R 17 = 59.
Entitlements went 13→14 on 2026-10 when Blackbaud executed a **MuleSoft Anypoint Platform – Platinum Edition** order
(26-month term; base subscription + prod/pre-prod vCores + Anypoint MQ 500M + Flex Gateway 1M×100). It licenses the
integration-runtime layer but NOT dedicated API Manager / API Governance SKUs or premium connectors — so `ipaas-integration`
now points at the new `anypoint-platform` entitlement (not `mulesoft-dataloader`, which remains a distinct owned entitlement).
Capability-level tallies (licensed 12 / covered 65) are unchanged — only the raw entitlement count moved. `entitlementCount()`
is defined but unused in the UI, so no page renders the total. The downstream Downloads matrix
(`~/Downloads/blackbaud-capabilities-summary.html`, the separate 75-cap/10-domain SF taxonomy file) flipped Integration's
`IEI` to Separate Agreement (licensed 65→66, 88%); `IAM` stays a gap (no API Manager SKU on the order).
Lifecycle map: 20 caps (16 native + 3 integrates + 1 data360); of 16 native, 7 licensed / 9 not.
SteelBrick CPQ sits in `overlaps`, not `tools`, so the count stays 86.

## Architecture

- Vite + React + react-router + Tailwind + lucide-react (recharts removed). Express BFF `server.js` serves `dist/` +
  API. Same pattern as the Siemens DISW Knowledge site.
- Single source of truth: `src/content/capabilities.js`, `entitlements.js`, `alignment.js`. Lifecycle stage mapping
  lives in the `/lifecycle` page module only.
- Pages: `/` Overview · `/map` Capability Map (+ dynamic ToolingVenn) · `/lifecycle` · `/capability/:id` · `/a2r` · `/i2r`.
- Trailhead: `trailhead.js` reads committed `trailhead-catalog.json`; `npm run refresh:trailhead` is offline only.
- Shared review notes: Heroku Postgres (`db.js`, `review_notes` table auto-created); falls back to localStorage when
  no `DATABASE_URL`.
- **Standalone EA file:** `standalone/blackbaud-capability-alignment.html` (~83 KB, zero external refs, no writes /
  agent / live MCP), generated by `scripts/build-standalone-html.mjs` — regenerate, don't hand-edit.
- Reusable accelerator: `docs/PLAYBOOK.md` + thin skill `.claude/skills/rationalization-site/SKILL.md` (user-level
  copy in `~/.claude/skills/` must be re-`cp`'d by Drew after edits).

## Hosting & org

- GitHub `afisher-salesforce/blackbaud-tooling` (`main`) → Heroku app `blackbaud-tooling`, auto-deploy on push.
- Heroku is in a **Private Space** — external curl/WebFetch returns empty; verify with `heroku releases -a
  blackbaud-tooling` / `heroku logs`.
- Config vars: `SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_INSTANCE_URL` (My Domain), `SF_AGENT_ID=0XxgK000002OdIPSA0`,
  `ALLOW_WRITES=true`, `DATABASE_URL`. Secrets live only in Heroku / local `.env`. `server.js` `.trim()`s all env vars.
- Salesforce **Tech IDO demo org** `trailsignup-f1af94b9143a4a` (synthetic reference data, not customer prod).

## Rationalization Agent (Phase 2a + 2b — live)

- Objects: `BB_Capability__c`, `BB_Entitlement__c`, `BB_Tool__c`, `BB_Alignment_Note__c` (all upsert on
  `External_Id__c`). Capability ext ids are full slugs (`revenue-forecasting`); tool ext ids `slug(tool)--<capId>`.
- Apex: `BB_SearchRationalization` (SOSL read), `BB_CaptureNote` (note write), `BB_UpdateTool` (tool write) — both
  writers fuzzy-resolve (exact ext id → name → single LIKE hit).
- Perm set `BB_Rationalization_Agent`. Seed: `node scripts/seed-salesforce.mjs <org>` (13 / 59 / 86).
- Data 360: Agentforce Data Library `Blackbaud_Rationalization`, retriever `1CxgK000000LbJ7SAK`, attached via
  "Answer Questions with Agentic Retriever" with the id in a **variable** (deliberate showcase). Corpus in
  `datacloud/corpus/` (+ `txt/`), generated and name-sanitized by `scripts/build-corpus.mjs`.
- Agent on **v6** (writes on: `allowWrites` agent variable = the real gate; BFF `ALLOW_WRITES` gates only the site's
  `POST /api/tool/:externalId`). Subagents: entitlements, capability alignment, value stream, research_context,
  note_capture, tool_capture.
- **Agentforce Builder is source of truth** for the agent. Don't `sf agent publish` from the repo `.agent` — it drops
  the UI-wired retriever. Mirror changes into the repo with
  `sf project retrieve start --metadata GenAiPlannerBundle:BB_Rationalization_Agent_vN --api-version 65.0`.

## Gotchas (each cost time once)

- Deploy objects/classes/permsets only: `sf project deploy start -d force-app/main/default/{objects,classes,permissionsets}`
  — exclude `aiAuthoringBundles`. Use `--api-version 65.0` for agent/planner retrieve and Apex deploys.
- LongTextArea can't be `required`; perm sets can't list FLS for required fields.
- New fields: FLS must actually be **applied** to the agent user — perm-set XML alone wasn't enough. Misleading
  symptom: agent says "read-only" / action "withheld".
- Builder Preview **never persists** side-effecting Apex — test writes via the live site drawer or anonymous Apex.
- Client-credentials `invalid_grant` → set the Run-As user on the ECA Client Credentials Flow.
- Seed script uses `sf api request rest` (hand-built Bearer header failed); composite `referenceId` is `[A-Za-z0-9_]` only.
- Data Library upload rejects `.md` — use the `.txt` copies; upload via Setup → Agentforce Data Library UI.
- `like` is an Apex reserved word. `overflow-x-auto` also sets `overflow-y:auto` and clips tooltips.
- Agent API: see the 5 host/path/token/body fixes (api.salesforce.com `/einstein/ai-agent/v1`, `bypassUser:false`,
  structured message body, My Domain in `instanceConfig.endpoint`).

## Working rules

- Claude's sandbox can't write `.git/`, `~/.claude/`, reach the npm registry, bind ports, or reach the org/Heroku.
  Claude edits files and verifies with `vite build`; **Drew runs git, `sf`, `heroku`, and `npm install`** in his terminal.
- Commit trailer: `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Keep named individuals and candid quotes out of anything customer-facing (corpus, standalone file).

## Open items / known drift

- `README.md` is partly stale: still says "candidate to retire", lists Five9, and describes the agent as a roadmap
  seam. Update to the overlap/consolidation framing and the live agent.
- `capabilities.js` `seReview` / `draftNote` still contain individual names (shown on the Heroku site) — cleanup candidate.
- `external-research-brief` corpus file is AI-generated with exec names/financials — re-review before anything customer-facing.
- `SF_CLIENT_SECRET` was pasted into chat 2026-10-05; risk accepted (demo org; ECA secrets can't be rotated in place).
- Outcome of the 2026-10-09 EA review is not captured in the transcripts — add it here.
