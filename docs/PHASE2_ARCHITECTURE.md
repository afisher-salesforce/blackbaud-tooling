# Phase 2 — Rationalization Agent (grounding + write-back)

Activates the reserved agent seam: a headless Agentforce agent, embedded in the site as a chat drawer, that answers
natural-language questions about Blackbaud's application-rationalization picture — grounded in Salesforce. All the
repo-side artifacts are built; the Salesforce-side deploy is a runbook (below).

Target org: **Salesforce Tech IDO** `trailsignup-f1af94b9143a4a`.

## What is stored in Salesforce to ground the agent

Three custom objects (+ a note object), seeded from the site's own content files (`capabilities.js`,
`entitlements.js`) via `scripts/seed-salesforce.mjs` so they stay the single source of truth. All upsert by
`External_Id__c`.

- **`BB_Capability__c`** (59) — the capability rows: value stream, domain, alignment (6-way), SF products, draft note,
  **SE review (richest grounding text)**, derived entitlement status, retire candidates, and a lookup to the owning
  entitlement. → *the Salesforce capabilities + how they align.*
- **`BB_Entitlement__c`** (13) — the owned Salesforce products from the asset line items: products/SKUs, status
  (owned / owned-expiring / separate-agreement), expiry, as-of date, source. → *licensed Salesforce entitlements.*
- **`BB_Tool__c`** (86) — Blackbaud's A2R + I2R tooling, each linked to its capability, flagged `Overlaps_SF__c` and
  `Retire_Candidate__c`. → *the Blackbaud tooling by value stream.*
- **`BB_Alignment_Note__c`** — discussion notes (reviewer or agent), child of capability. The agent's write target and
  the migration destination for the Postgres `review_notes`.

Relationships: `BB_Capability__c.Primary_Entitlement__c` → `BB_Entitlement__c`; `BB_Tool__c.Capability__c` and
`BB_Alignment_Note__c.Capability__c` → `BB_Capability__c`.

### Data 360 (Phase 2b — the richer grounding)
- **Structured:** ingest the four objects as DMOs; map to a unified search index / data library the agent retrieves
  from (in addition to, or instead of, the Apex action).
- **Unstructured:** upload the source corpus as `ContentVersion` files — `BB-Tool-Inventory.xlsx`, the entitlement
  export, the Salesforce capability-map PDF, the external research brief, (optional) transcripts — and register them
  as a Data 360 unstructured data source, vectorized for RAG. This is the vector-search/RAG capability the Aug 2026
  evidence matrix listed as "validation pending".

## Agent

`aiAuthoringBundles/BB_Rationalization_Agent` — router + four subagents (entitlements/rationalization, capability
alignment, value stream, note capture) + an off-topic handler. Grounds via `apex://BB_SearchRationalization`;
captures notes via `apex://BB_CaptureNote` (gated by the `allowWrites` agent variable + the BFF `ALLOW_WRITES`).
Agent Script validation passes (0 blocking). **Set `default_agent_user` to the real Einstein Agent User before
publish** (currently a placeholder).

## Apex

- `BB_SearchRationalization` (`@InvocableMethod`, `global without sharing`) — SOSL across the three objects, assembles
  an agent-ready answer body (capability + alignment + entitlement + owned products + retire candidates + SE review)
  and a relative `/capability/<External_Id__c>` citation link. Tests: `BB_SearchRationalizationTest`.
- `BB_CaptureNote` (`@InvocableMethod`, `with sharing`) — inserts a `BB_Alignment_Note__c` by capability external id.
  Tests: `BB_CaptureNoteTest`.

## Site (already wired in the repo)

- `server.js` — the Agent-API proxy is live behind the config gate: JWT client-credentials token from the IDO My
  Domain, `api.salesforce.com/einstein/ai-agent/v1` session + message + delete, `bypassUser:false`, structured
  message body, My Domain in `instanceConfig.endpoint`. Returns 501 (roadmap) until the config vars are set.
- `RationalizationAgentChat.jsx` — the chat drawer + `AgentChatProvider` context; header "Ask the Agent" button and
  the Overview RoadmapTile both open it. Renders `[text](/capability/id)` replies as in-app citation pills. Shows the
  roadmap state gracefully when the agent isn't configured.

## Deploy runbook (user runs against the IDO org)

1. **Auth:** `sf org login web --alias bb-ido` (the IDO org).
2. **Deploy metadata:** `sf project deploy start -o bb-ido` (objects, fields, perm set, Apex).
3. **Tests:** `sf apex run test -o bb-ido -l RunSpecifiedTests -t BB_SearchRationalizationTest BB_CaptureNoteTest -r human -w 10`.
4. **Agent User + perm set:** ensure an Einstein Agent User exists; assign `BB_Rationalization_Agent` perm set to it
   (and to the client-credentials Run-As user). Put that user's username in the `.agent` `default_agent_user`.
5. **Seed:** `node scripts/seed-salesforce.mjs bb-ido` → 13 entitlements, 59 capabilities, 86 tools.
6. **Publish agent:** `sf agent publish authoring-bundle --api-name BB_Rationalization_Agent -o bb-ido` then
   `sf agent activate --api-name BB_Rationalization_Agent -o bb-ido` (needs `@salesforce/plugin-agent` v2.x — NOT a
   metadata deploy). Capture the BotDefinition Id.
7. **ECA / Connected App:** client-credentials flow, **"Issue JWT-based access tokens"** enabled, scopes
   `api chatbot_api sfap_api refresh_token`, Run-As the Agent User.
8. **Heroku config vars:** `heroku config:set -a blackbaud-tooling SF_AGENT_ID=<id> SF_CLIENT_ID=<key>
   SF_CLIENT_SECRET=<secret> SF_INSTANCE_URL=https://<ido-my-domain>` (+ `ALLOW_WRITES=true` only after ARB clears
   the write path).
9. **Verify:** `/api/health` → `agentConfigured:true`; open the drawer; "What do we already own?" → grounded answer
   citing a capability record.
10. **Migrate notes (optional):** `DATABASE_URL=<pg> node scripts/migrate-notes-to-sf.mjs bb-ido`.
11. **Data 360 (2b):** ingest the four objects as DMOs + upload the unstructured corpus; add a Data 360 retriever as a
    second grounding source.

## Guardrails
- Keep `ALLOW_WRITES=false` until the ARB / security review clears the write path (the Claudeforce finding). The
  read-only agent demos fully without it.
- The agent runs as the provisioned Einstein Agent User, never an admin login.
- Entitlement/alignment answers stay framed as point-in-time, for-discussion — enforced in the agent's system prompt.
