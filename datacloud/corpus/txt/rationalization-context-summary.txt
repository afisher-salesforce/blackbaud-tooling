# Blackbaud Application Rationalization — Context Summary

_Sanitized synthesis for agent grounding. Facts and decisions only — no named individuals, no internal or candid
commentary. Point-in-time, for discussion; not a contract._

## The opportunity

Blackbaud is a large Salesforce customer that also competes with Salesforce in the nonprofit market, and has made a
significant commercial commitment to the Salesforce platform. A recurring pattern has been identified: teams
evaluate or run RFPs for capabilities Blackbaud may already own under its Salesforce entitlements. The guiding
principle for this work is to **"start inward first"** — check what is already licensed before evaluating net-new
tools. Framed differently: several active evaluations are for capabilities already paid for, representing savings
"out of the box."

## Value streams in scope

- **Awareness-to-Revenue (A2R):** marketing, sales, and revenue operations.
- **Implement-to-Renew (I2R):** onboarding, adoption, support, and renewals.

Enterprise Architecture and the value-stream leads for A2R and I2R are the key internal audiences; executive
sponsorship exists at the CIO level.

## Entitlement facts (point-in-time, Charleston management org)

- Core CRM — **Sales Cloud and Service Cloud (Unlimited Edition)** — is active and is the enterprise system of record.
- **Agentforce for Sales and for Service** add-ons are licensed.
- **Customer Experience Intelligence (CXI)** — conversation-intelligence capability — is licensed.
- **Revenue Cloud Advanced (the CPQ upgrade)** is licensed **at the same time as** legacy CPQ Plus (SteelBrick) —
  i.e., both the old and new quoting products are on the entitlement simultaneously; the migration between them has
  stalled.
- **Data Cloud / Data 360** (provisioning + data-services credits) is licensed.
- **Qualified** (agentic marketing / website chat) is licensed and in use.
- **Service Cloud Voice** via Partner Contact Center with Amazon Connect is licensed.
- **Tableau** (Cloud + Server) is licensed but the term ends in the near window (~January 2027); **Tableau Next**
  (embedded, within the Data 360 context) is now part of the entitlement.
- **Marketing Cloud Engagement (Corporate Edition)** is licensed; a near-term migration path exists to the natively
  rebuilt Marketing Cloud.
- **Slack (Enterprise Grid)** is licensed under a separate agreement; practical use is concentrated in engineering.
- **MuleSoft** is limited to the data-loader utility today; broader API-management use would be an expansion.
- **Platform trust** — Shield (encryption/compliance) and full-copy sandboxes — is in place.
- **CRM Analytics Plus** is not separately licensed; **MuleSoft Anypoint / API Manager** is not licensed.

## Capability posture (selected)

- **Forecasting / pipeline:** Collaborative Forecasting, Territory Management, and Pipeline Inspection are included in
  the owned Sales Cloud edition; Agentforce for Sales adds conversational access. A forecasting evaluation is in
  flight for a capability already owned — an implementation question, not a procurement one.
- **Conversation intelligence:** CXI is the owned capability that overlaps the incumbent third-party tool; whether
  and when to retire the third-party tool is a sales-process conversation, not a licensing one.
- **Marketing automation:** the native platform is not a clean one-for-one replacement for the incumbent today; the
  gap centers on identity/personalization. Treated as discovery, not a recommendation.
- **Revenue Cloud / CPQ:** the central decision — because both the legacy and replacement quoting products are owned,
  restarting the stalled migration is a Professional Services engagement. Configure-price-quote is inseparable from
  opportunity management (new-logo deals the sales team runs) and renewals (which Customer Success runs), so a
  Revenue Cloud deployment is a sales-and-renewal **process change**, best paired with contract lifecycle management
  (CLM) and Agentforce Revenue Management (ARM) together rather than as separate projects.
- **Analytics:** Tableau Next covers the Salesforce-resident analytics natively and works best when data is in
  Salesforce or zero-copied into Data 360; a standalone-Tableau-versus-incumbent-BI decision is separate.
- **Service telephony:** Service Cloud Voice brings the existing carrier (Amazon Connect / partner) into the agent
  console; whether the current contact-center tool is a retire candidate or remains the carrier is an open question
  pending confirmation of how telephony is sourced.

## The alignment model

Capability alignment is expressed on a six-way spectrum rather than a binary verdict: **Native, Integrates, Data 360,
Partial, Gap, Discuss.** The canonical example of why binary verdicts mislead is a sales-intelligence tool that
Salesforce can surface in-platform and unify via Data 360 — neither "covered" nor "a gap," but "integrates." All
alignment verdicts are a preliminary Salesforce point of view for discussion, not commitments.

## AI direction

There is interest in surfacing Salesforce capabilities through conversational AI (Agentforce), including a
"coworker"-style assistant and embedding agents where sellers and service teams already work. Agentforce is the
owned, Salesforce-native path that grounds in CRM data and honors the permission model. Expanding AI access to
go-to-market roles is a current initiative.
