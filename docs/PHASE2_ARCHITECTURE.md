# Phase 2 — Salesforce write-back + agent grounding (NOT built yet)

This documents the target architecture for turning the discussion canvas into a system of record in Salesforce and
grounding a headless Agentforce agent on it. **Nothing here is built for the Friday review** — it is the turnkey
drop-in for after Blackbaud provisions org access and the Architecture Review Board (ARB) / security review has run.

## Why staged, not built now

1. **The Friday review has no org wiring by design.** The site deliberately avoids mapping where contracts live, and
   write-back means standing up auth, custom objects, and permission sets in the org.
2. **Write access raises the security bar.** The Claudeforce discussion was explicit that *write* access (even
   creating records or reports) raises the ARB bar well above read-only, especially with sensitive customer data in
   scope. Writing stakeholder opinions about tooling into Salesforce belongs **after** the governance presentation.
3. **localStorage + Markdown export is the no-regrets capture for Friday.** Nothing is lost; the export becomes the
   seed data for the records when Phase 2 is built.

## Target data model (IDO org: `trailsignup-f1af94b9143a4a`)

Two custom objects, shaped to match `src/content/capabilities.js` 1:1 so migration is a straight map:

### `Capability_Assessment__c`
| Field | Type | Source |
|---|---|---|
| `Name` | Text | sub-capability (e.g. "Forecasting & Pipeline") |
| `Value_Stream__c` | Picklist (A2R / I2R) | `valueStream` |
| `Domain__c` | Text | `domain` |
| `Tools__c` | Long Text | `tools` (comma-joined) |
| `Primary_Users__c` | Text | `primaryUsers` |
| `Alignment__c` | Picklist (Native / Integrates / Data 360 / Partial / Gap / Discuss) | `alignment` |
| `SF_Products__c` | Long Text | `sfProducts` |
| `Draft_Note__c` | Long Text | `draftNote` |
| `SE_Review__c` | Long Text | `seReview` |
| `External_Id__c` | Text (External ID, unique) | `id` (idempotent upsert key) |

### `Alignment_Note__c` (child of `Capability_Assessment__c`)
| Field | Type | Source |
|---|---|---|
| `Capability__c` | Master-Detail → `Capability_Assessment__c` | by `External_Id__c` |
| `Note__c` | Long Text | the captured discussion note |
| `Captured_By__c` | Text | optional attribution |
| `Captured_At__c` | DateTime | export timestamp |

A `BB_Alignment_Admin` permission set grants FLS on both objects (never edit the Admin profile — the DISW lesson).

## Write-back path (BFF)

The BFF already reserves the seam. Phase 2 adds:
- `POST /api/assessment/:id/note` — client-credentials OAuth → Actions/Composite REST → upsert `Alignment_Note__c` by
  the capability's `External_Id__c`. Gated behind `ALLOW_WRITES=true` (mirrors the HAV/DISW write gate) so the demo
  default is read-only.
- A seed script that upserts all `Capability_Assessment__c` rows from `capabilities.js` and imports the exported
  Markdown/JSON notes.
- The notes UI gains an opt-in "Save to Salesforce" toggle; localStorage stays the default offline capture.

## Agent grounding (Headless 360 / Aiforce)

The reserved `/api/agent/*` seam (currently 501) activates exactly like the DISW `DISW_Support_Assistant`:
- Build an Agentforce agent in the IDO org whose search action grounds on `Capability_Assessment__c` +
  `Alignment_Note__c`.
- Set `SF_AGENT_ID` + `SF_CLIENT_ID` / `SF_CLIENT_SECRET` / `SF_INSTANCE_URL` config vars (My Domain = instance URL;
  the Agent API host is `api.salesforce.com`, My Domain passed in the session body — see the Salesforce Agent API
  reference).
- Flip the roadmap tile to a live chat drawer. Then "Where does Salesforce overlap with our Revenue Intelligence
  stack?" is answered from real records, not a hardcoded file.

## Data 360 extension (structured + unstructured) — the target state

Beyond the structured records, ingest into Data 360 for the IDO org:
- **Structured:** the two custom objects + the tool inventory.
- **Unstructured:** the inventory spreadsheets, the external research brief, the Salesforce preliminary analysis,
  and (where appropriate) meeting transcripts — as a Data 360 unstructured data source for retrieval-augmented
  grounding.

The agent then grounds on the full corpus (records + documents), making the rationalization conversation itself
answerable in natural language — the DISW knowledge-grounding pattern, one tier richer.

## Sequencing

1. **Now → Friday:** discussion canvas, localStorage capture, Trailhead rail. No org.
2. **After ARB / security review + org access:** deploy custom objects + perm set; seed from the notes export; turn
   on `/api/assessment` write-back (read-only default).
3. **Then:** build + wire the Agentforce agent; flip the roadmap tile live.
4. **Then:** add Data 360 structured + unstructured grounding for the richest agent.
