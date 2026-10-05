# Phase 2b — Data 360 grounding (structured DMOs + unstructured Data Library)

Adds Data 360 as a **second** grounding source for the Rationalization Agent, alongside the Phase-2a Apex action.
Structured records become Data Cloud DMOs; the curated source documents become an **Agentforce Data Library**
(auto-vectorized RAG). The Apex action stays — the planner routes precise record facts to it and research/rationale
prose to the library. Data 360 is enabled in the IDO org (`trailsignup-f1af94b9143a4a`).

## Repo artifacts (already authored)

- `datacloud/corpus/*.md` — the curated corpus:
  - `rationalization-context-summary.md` — **sanitized** transcript synthesis (no names, no candid commentary). Hand-authored; review before upload.
  - `blackbaud-tool-inventory.md`, `salesforce-entitlements.md`, `salesforce-capability-map.md` — generated from the site content by `scripts/build-corpus.mjs` (re-run after any `capabilities.js`/`entitlements.js` change).
  - `external-research-brief.md` — placeholder; populate with the research-brief text (see below), then re-upload.
- `scripts/build-corpus.mjs` — regenerates the three data-derived corpus files.
- `scripts/upload-datalibrary.mjs` — uploads the corpus files to the org as ContentVersion records.
- Agent bundle updated — new `research_context` subagent + router entry route prose/"why" questions to the library.

## Runbook (user, against the IDO org)

### A. Structured DMOs (the lower-value half; can be deferred)
1. Setup → **Data Cloud Setup** → confirm Data Cloud is provisioned.
2. **Data Cloud → Data Streams → New → Salesforce CRM.** Create a stream for each: `BB_Capability__c`,
   `BB_Entitlement__c`, `BB_Tool__c`. Accept default field mapping; no identity resolution needed (reference data,
   not customer profiles).
3. Deploy / let the streams run; confirm each maps to a DMO with the expected row counts (13 / 59 / 86).

### B. Unstructured Data Library (the high-value half)
1. (If adding the research brief) populate `datacloud/corpus/external-research-brief.md`:
   `pdftotext "Blackbaud — External Research Brief.pdf" datacloud/corpus/external-research-brief.md` (or paste the text).
2. **Review `rationalization-context-summary.md`** — confirm no names / no candid internal commentary.
3. Upload the files:
   ```bash
   node scripts/upload-datalibrary.mjs trailsignup.f1af94b9143a4a@salesforce.com
   ```
   (Prints a ContentVersion id per file. Placeholder files with "Content pending" are skipped.)
4. Setup → **Data Cloud → Data Libraries → New.** Create a library (e.g. "Blackbaud Rationalization"), add the
   uploaded files as its source, and let indexing/vectorization reach **Complete**.

### C. Attach to the agent + republish
5. In **Agentforce Studio**, open `BB_Rationalization_Agent` and add the Data Library as a **grounding source** /
   retriever available to the `research_context` subagent (and generally).
6. Republish + activate so the routing changes ship:
   ```bash
   sf agent publish authoring-bundle --api-name BB_Rationalization_Agent -o trailsignup.f1af94b9143a4a@salesforce.com
   sf agent activate --api-name BB_Rationalization_Agent -o trailsignup.f1af94b9143a4a@salesforce.com
   ```
   (Version bumps to v2. `SF_AGENT_ID` is unchanged — same BotDefinition.)

## Verify
- **Regression (structured still precise):** drawer → "What do we already own?" / "retire candidates in A2R?" →
  precise answers from the Apex action, unchanged.
- **New (unstructured):** drawer → "Why is Revenue Cloud a process change, not just a tool swap?" / "What's the
  rationalization strategy?" → grounded in the Data Library passages (the context summary / capability map prose).
- **Sanitization check:** ask something that might surface internal detail ("who said what in the meetings?") →
  the agent must not surface names or candid commentary (the summary carries none; the system prompt forbids it).
- No site/Heroku change needed — the drawer renders the richer answers as-is.

## Notes
- Data Library *creation* + *attachment* are UI steps (the API surface is uneven); the upload of source files is
  scripted. If Data Library API ingest matures, the upload can be folded into library creation.
- The DMO half (section A) is optional for the demo — the Data Library alone delivers the unstructured win.
- **`external-research-brief.md` is included as-is** (user decision 2026-10-05). It is AI-generated company research
  carrying its own "verify before use" caveat, named executives + quotes, financials, and competitive framing — the
  agent may surface those as grounded fact. Acceptable because this is an internal demo/enablement org, not a
  customer-facing deployment. The other four corpus files derive from authoritative first-party data and the context
  summary is sanitized; this one is the exception, by choice. Re-review before any customer-facing reuse.
