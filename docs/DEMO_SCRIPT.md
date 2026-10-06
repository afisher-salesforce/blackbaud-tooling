# Friday review — walkthrough script

**Audience:** Russ Tallon (Enterprise Architecture) + the A2R and I2R Value Stream Leads. **Framing:** a *working
discussion canvas* backed by a live Agentforce agent — not a pitch. The goal is to get Blackbaud reacting to and
correcting the alignment, and to **capture their input live, written straight back to Salesforce**. Run ~25 min.

## Before you start
- Open the site; click the header **Connected** indicator once — BFF up, Trailhead served, agent live. Honest tone:
  real app, real org, nothing hidden.
- Confirm `ALLOW_WRITES` is on and the `BB_Tool__c` fields are blank (clean slate for live capture).
- Dark/light toggle to match the room.

## 0 · Set the frame (2 min) — Overview `/`
- Hero: **86 tools across A2R and I2R; the anchor question is "which of these do you already own?"**
- **Read the amber disclaimer aloud** — the credibility move: "This alignment is *our* preliminary view, built fast
  from a draft, almost certainly too black-and-white in places; today is about you correcting it." Say this first and
  EA trusts the rest.

## 1 · "Start inward first" (3 min) — Overview
- Green **"Start inward first — build the platform you already own"** banner + the stat tiles: **13 Salesforce
  entitlements owned · 12 capabilities already covered · 5 overlap · consolidation candidates**.
- Core message: teams are running RFPs — forecasting, CLM — for capabilities Blackbaud **already pays for**. The move
  isn't "rip tools out," it's **consolidate work onto the platform you own and cut context-switching**; contract
  terms and prior investment decide what actually moves.
- Grounded in Blackbaud's actual Salesforce entitlement data (Charleston org), aligned to the August evidence matrix.

## 2 · The heatmap (2 min) — Overview
- "Each dot is a capability, colored by draft alignment. Green/blue clusters = where Salesforce already plays; slate =
  genuine gaps." Note the A2R vs I2R split. Click a dot to jump into a capability — it's interactive.

## 3 · Shades-of-gray centerpiece (3 min) — `/capability/prospecting-sales-intelligence`
- **LinkedIn Sales Navigator.** The set-piece: a draft "Inconclusive" becomes **Integrates** — Sales Navigator
  surfaces *inside* the Salesforce record and Data 360 can unify its signal; you keep the LinkedIn graph (Microsoft
  EA) *and* get it in-platform. "A yes/no verdict would mislead — that's why the map is a 6-way spectrum."
- Type a **Discussion note** live; reload → it persists (shared, written to Salesforce). That's the capture mechanism.

## 4 · The money filter + Revenue Cloud centerpiece (5 min) — Capability Map `/map`
- Filter **Entitlement = "Owned · overlaps a tool"**. The sharpest consolidation candidates surface: Clari
  (forecasting), Gong (conversation intelligence), CoPilot Studio (Agentforce), SteelBrick CPQ (Revenue Cloud), Qlik
  (renewal analytics, **expiring ~Jan 2027**). Framing: owned capability overlaps a tool you also run — a candidate to
  consolidate, not a directive to retire.
- Open **Configure-Price-Quote & Revenue Lifecycle** — the **centerpiece**. Blackbaud pays for BOTH legacy CPQ Plus
  AND Revenue Cloud Advanced (the upgrade) at once; the migration stalled. Walk the three prompts: what blocked it,
  who owns quote-to-cash end to end (sales for new logos, CS for renewals), deploying CLM + Agentforce Revenue
  Management together. **Sets up the Professional Services engagement** — a sales-and-renewal process change, not a
  tool swap.

## 5 · The live agent — find information conversationally (4 min) — "Ask the Agent"
- Open the agent drawer. "This is a headless Agentforce agent, grounded in your Salesforce data **and** Data 360 — the
  same Data 360 that's one of the entitlements on this map."
- **Structured ask:** *"What Salesforce capabilities do we already own?"* → grounded answer citing the records.
- **Research ask (Data 360 retrieval):** *"Why is Revenue Cloud a process change, not just a tool swap?"* → answered
  from the knowledge library prose. "That came from the research corpus, not a hardcoded reply."
- **Overlap ask:** *"Where does Salesforce overlap our A2R tools?"* → names Clari, Gong, CoPilot Studio, SteelBrick
  CPQ with the owned capability each overlaps.

## 6 · Capture tooling data live — the write-back moment (4 min) — the showcase
- The pitch: "As we discuss each tool, we can capture Blackbaud's own commercial facts — priority, contract/renewal
  date, users, annual spend — and write them straight into Salesforce, two ways."
- **Via the agent:** in the drawer, say *"Set Gong to High priority, renews 2026-12-31, 450 users, $500,000."* The
  agent confirms it saved. (It resolves "Gong" to the record itself.)
- **Via the capability page:** open **Conversation Intelligence** → the **Blackbaud tooling** section lists Gong with
  the 4 fields → show the value the agent just wrote is already there → edit one (e.g. bump priority) → **Save** →
  persists. "Same record, two surfaces — type it or tell the agent."
- Land it: "This is the point. The renewal/spend/user data we deliberately left out of the read-only version is now
  captured live, in your org, as the system of record for the rationalization — not a spreadsheet that goes stale."

## 7 · Gaps + value streams (3 min)
- Capability Map → filter **Alignment = Gap**: "We're not claiming these — Adobe Creative Cloud, Getty, G2, Jira,
  Camtasia. Naming where Salesforce doesn't play is what makes the Native calls credible."
- `/a2r` and `/i2r`: hand each Value Stream Lead their stream. A2R: the Marketo question is genuinely unsettled
  (identity/personalization) — a Discuss by design. I2R: Service Cloud Voice *integrates* Amazon Connect; the open
  question is whether Connect is direct or via a voice partner.

## 8 · Close (1 min)
- Everything captured today — notes and tooling data — is **already in Salesforce**, queryable and durable. "Your
  input didn't go into a deck; it's in the platform, ready to drive the consolidation roadmap."

## Guardrails for the room
- If asked "did Salesforce decide these verdicts?" → "Our SE's starting view on top of a quick draft — explicitly for
  you to correct. That's the session."
- If a verdict is challenged → capture it in the note and move on. Agreement on the *process* beats winning any one cell.
- On "retire": always "consolidate / overlap," never "retire." Contract terms and prior implementation investment
  decide what actually moves — this is a platform-strategy conversation.
- The entitlement/alignment data is a point-in-time read for discussion, not a contract — say so if spend/renewal
  numbers come up.
