# Salesforce Capability Alignment — Narrative

How Salesforce aligns to each capability in Blackbaud's inventory, on the six-way spectrum (Native, Integrates, Data 360, Partial, Gap, Discuss). Alignment is a preliminary Salesforce point of view for discussion, not a commitment, and may be too black-and-white.

## CRM & Core Platform

### CRM System of Record (A2R)
- Tools in use: Blackbaud Salesforce, JG Salesforce
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Sales Cloud, Service Cloud
- Entitlement: owned
- Salesforce SE view: This is the anchor of the whole conversation: Blackbaud already runs two Salesforce orgs as systems of record. Everything else on this map is about consolidating around an investment they already own.

## Revenue Intelligence

### Forecasting & Pipeline (A2R)
- Tools in use: Clari
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Collaborative Forecasting, Pipeline Inspection, Territory Management, Agentforce for Sales
- Entitlement: owned
- Could retire: Clari
- Salesforce SE view: This is the live one: Blackbaud is running a forecasting RFP (Clari / Gong Forecast) for a capability it ALREADY owns — Collaborative Forecasting + Territory Management are included in Sales & Service Cloud Unlimited, and Agentforce for Sales (owned) adds conversational access to the forecast. the saving is meaningful because the capability is already owned. This is an IMPLEMENTATION play, not a procurement play. The one parity item to validate live: forward-looking conversion analytics (not just current-quarter rollup).

### Conversation Intelligence (A2R)
- Tools in use: Gong
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Customer Experience Intelligence (CXI), Einstein Conversation Insights
- Entitlement: owned
- Could retire: Gong
- Salesforce SE view: Important entitlement note: Blackbaud ALREADY owns Customer Experience Intelligence (Unlimited) — the conversation-intelligence capability that overlaps Gong is a paid, active entitlement, not a net-new buy. Still Partial on the business side: the prep call flagged that unwinding Gong is NOT a clean swap — it is woven into the sales process across Sales, Marketing and CS. So the honest message is "you already own the replacement capability; whether/when to retire Gong is a sales-process conversation, not a licensing one."

### Marketing Attribution (A2R)
- Tools in use: Marketo Measure (Bizible)
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Marketing Cloud Account Engagement, CRM Analytics, Data 360
- Entitlement: not-licensed
- Salesforce SE view: Partial. Multi-touch attribution modeling is a genuine strength of Marketo Measure; Salesforce can land campaign influence + revenue attribution natively, but parity on the attribution modeling depends on the marketing-automation decision (see Marketo) and how much is already in Data 360.

### Sales Engagement / Dialer (A2R)
- Tools in use: Nooks
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Sales Engagement, Sales Dialer
- Entitlement: not-licensed
- Salesforce SE view: Agree Native for the cadence/dialer jobs. Nooks adds an AI parallel-dialer/virtual-floor angle worth confirming is in scope.

## Marketing Automation

### Marketing Automation Platform (A2R)
- Tools in use: Marketo (Engage)
- Alignment: **Discuss** — Needs Blackbaud input before we can place it — depends on how the tool is actually used, integrated, or valued internally.
- Salesforce products: Marketing Cloud Account Engagement, Marketing Cloud Growth / Advanced
- Entitlement: na
- Salesforce SE view: Flagged Discuss, not Covered. The prep call was explicit: Blackbaud doesn’t love Marketo, but Marketing Cloud is NOT a clean replacement — it lacks the identity/personalization connection they need and would require web work to bridge. This is the weakest consolidation story today; raise it as discovery, not a recommendation.

### ABM Orchestration (A2R)
- Tools in use: Demandbase
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Marketing Cloud Account Engagement, Data 360
- Entitlement: not-licensed
- Salesforce SE view: Partial. Account-based nurture + scoring can land in Salesforce, but Demandbase’s intent/advertising orchestration overlaps with the ABM & Data Intelligence tools below and is better discussed as a cluster.

### Website Chat / Conversational (A2R)
- Tools in use: Qualified
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Qualified (now part of Salesforce), Agentforce, Messaging for Web
- Entitlement: owned
- Salesforce SE view: Entitlement update: Qualified is now part of Salesforce AND Blackbaud already owns it (Qualified Agentic Marketing Platform + SFDC connector, 260 seats) — the website chat on Blackbaud.com IS Qualified today. So this isn’t "could adopt" — it’s already in use. The opportunity is to link Qualified into the broader marketing + SDR architecture now that it is Salesforce-native, rather than treating it as a standalone point tool.

### Lead Routing / Matching (A2R)
- Tools in use: LeanData
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Lead Assignment Rules, Omni-Channel Routing, Flow Orchestration
- Entitlement: not-licensed
- Salesforce SE view: Agree Native for standard routing. The honest nuance: LeanData’s more complex matching/round-robin graphs are where teams sometimes keep it — worth confirming their routing complexity.

## Scheduling

### Meeting Scheduling (A2R)
- Tools in use: Chili Piper (Gong contract), OnceHub
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Salesforce Scheduler, Einstein 1 Inbox
- Entitlement: not-licensed
- Salesforce SE view: Agree Native. Note Chili Piper rides the Gong contract, so it is entangled with the Gong decision; OnceHub is a cleaner standalone consolidation. (Calendly sits in the I2R scheduling row.)

## Sales Enablement

### Content Mgmt, Enablement & Buyer Room (A2R)
- Tools in use: Spekit
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Enablement (formerly Sales Enablement), In-App Guidance
- Entitlement: not-licensed
- Salesforce SE view: Partial. In-App Guidance + Enablement cover the embedded-help and program jobs. Note the product is now "Enablement" (the former myTrailhead branding is retired) — don’t say myTrailhead. Spekit’s just-in-time knowledge-overlay style is the piece to validate.

### Demo Automation (A2R)
- Tools in use: Consensus
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree genuine Gap. Leave it; naming gaps honestly protects the credibility of the Native calls.

### RFP / Proposal Automation (A2R)
- Tools in use: Responsive.io (RFPIO)
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Mostly a Gap for the dedicated RFP-response database. The one forward-looking nuance to mention, not claim: an Agentforce + knowledge-grounded agent could assist drafting responses — but that is roadmap, not parity with Responsive today.

### Prospecting / Sales Intelligence (A2R)
- Tools in use: LinkedIn Sales Navigator (MSFT D365 Relationship Sales Plus)
- Alignment: **Integrates** — Salesforce does not replace the tool, but surfaces it inside the platform (packaged app / API) so the work happens in one place.
- Salesforce products: Sales Navigator for Salesforce, Data 360, Einstein Activity Capture
- Entitlement: not-licensed
- Salesforce SE view: THE canonical shades-of-gray example. This is not Covered and not a Gap: Salesforce surfaces Sales Navigator INSIDE the record (the Sales Navigator app for Salesforce), and Data 360 can unify its signal — so the honest placement is Integrates. You keep the LinkedIn graph (it rides a Microsoft EA) and still get it in-platform. Classic "both/and," which is why binary verdicts mislead here.

## ABM & Data Intelligence

### Data Enrichment / Prospecting (A2R)
- Tools in use: Clay Labs
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Data 360, Data Cloud enrichment
- Entitlement: not-licensed
- Salesforce SE view: Partial is right. Data 360 unifies and can enrich profiles; Clay’s automated waterfall-enrichment workflows are a distinct capability. Keep-and-unify (Data 360) is the realistic story, not replace.

### Competitive Intelligence (A2R)
- Tools in use: Klue Intelligence
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Quip / Files (battlecards), Enablement
- Entitlement: not-licensed
- Salesforce SE view: Partial. Battlecard storage/distribution can live in Salesforce; the automated competitive-intel gathering/scraping is Klue’s distinct value. Likely keep Klue, surface its output.

### Lead-to-Account / Media · Intent / Demand · Social Listening (A2R)
- Tools in use: Integrate.com, DemandFactor, Brandwatch
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Data 360, Marketing Cloud
- Entitlement: not-licensed
- Salesforce SE view: Partial / Data 360. These are data-feed and listening tools; the pattern is unify-and-activate the signal in Data 360, keep the specialized sources. Not a replacement story.

## Analytics & Measurement

### Web / Product Analytics · Session Replay · Survey/Forms · Data Pipeline (A2R)
- Tools in use: Adobe Analytics, Mouseflow, PointerPro, Windsor.AI
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Data 360, Tableau, Tableau Next
- Entitlement: owned-expiring (expires ~Jan 2027)
- Salesforce SE view: Partial, with an entitlement flag: Tableau is OWNED but EXPIRES ~Jan 2027 (Q4 FY2027) — a near-term decision point. Tableau Next (embedded, now part of the entitlement) covers the Salesforce-resident analytics natively and works best when data is in Salesforce or zero-copied into Data 360; standalone Tableau to replace Qlik is a separate renewal conversation. Session-replay/heatmap (Mouseflow) is a genuine gap within this cluster — analytics = strong, replay = keep.

### Survey / Experience (VoC) (A2R)
- Tools in use: Qualtrics Labs
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Feedback Management, Salesforce Surveys
- Entitlement: not-licensed
- Salesforce SE view: Partial, not Covered. Salesforce Surveys/Feedback Management covers embedded CSAT/NPS tied to records; Qualtrics is a far deeper experience-management platform (advanced research, stats, XM). For transactional CSAT in-CRM, native fits; for enterprise XM, keep Qualtrics.

### SEO / Search Console / Competitive Research (A2R)
- Tools in use: Google Search Console, Semrush
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap. Clean example of where Salesforce correctly does not play.

## Content & Creative

### Web Experimentation / CMS (A2R)
- Tools in use: Optimizely (JG + US)
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Salesforce CMS, Experience Cloud, Personalization (Data 360)
- Entitlement: not-licensed
- Salesforce SE view: Partial. Experience Cloud + Personalization can cover a portion of the experimentation/personalization story, but Optimizely is a dedicated A/B experimentation engine — parity on experimentation is weak. Keep for experimentation; consolidate the CMS/personalization pieces.

### DAM · Social Mgmt · AI Copywriting · Landing Pages (A2R)
- Tools in use: Bynder, Sprinklr, AnyWord, Instapage, Sprout Social
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Marketing Cloud (CloudPages), Salesforce CMS
- Entitlement: not-licensed
- Salesforce SE view: Partial. Landing pages + basic content land in Marketing Cloud; enterprise social publishing (Sprinklr/Sprout) and DAM (Bynder) are genuinely distinct. Realistic: consolidate landing pages, keep DAM + enterprise social.

### Personalized Content / Decks (A2R)
- Tools in use: Matik
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap for native deck generation (doc-gen AppExchange partners exist, but that is not Salesforce).

### Creative Suite · Stock Imagery (A2R)
- Tools in use: Adobe Creative Cloud, Getty Images
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap. Obvious non-overlap; keep on the map so the inventory is complete and honest.

## Video

### Webinar / Virtual Events · Video Hosting · Testimonials (A2R)
- Tools in use: Goldcast, Wistia, Vocal Video
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap. One nuance to mention: event/attendee RECORDS and campaign ROI can live in Salesforce even though the broadcast infrastructure does not — the data integrates, the platform does not.

## Events & Field

### Event Management (A2R)
- Tools in use: Swoogo
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Campaigns, Experience Cloud
- Entitlement: not-licensed
- Salesforce SE view: Partial is right. Campaign + attendee data is native; conference logistics (agendas, badges) is Swoogo. Keep Swoogo, integrate the data.

### Event Lead Capture (A2R)
- Tools in use: iCapture
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Web-to-Lead, Salesforce mobile
- Entitlement: not-licensed
- Salesforce SE view: Partial. Lead capture lands natively; offline tradeshow badge-scan/OCR is iCapture’s specialized hardware/software. Integrate.

### Direct Mail / Gifting (A2R)
- Tools in use: Postal
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap. Triggering a gift from a Flow is possible via integration, but fulfillment is Postal.

## Automation & Workflow

### AI Agent / Chatbot Builder (A2R)
- Tools in use: CoPilot Studio
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Agentforce, Agent Builder
- Entitlement: owned
- Could retire: CoPilot Studio
- Salesforce SE view: Native AND owned: Agentforce for Sales (750) and for Service (550) are active entitlements. CoPilot Studio rides the Microsoft EA; Agentforce is the owned, Salesforce-native equivalent that grounds in the CRM data and honors the permission model. The Agentforce Coworker pilot is already in the org and can be enabled by permission (Teams embedding targeted ~Oct). This is also the hook for the future Headless 360 / Aiforce roadmap tile on this site.

### iPaaS / Integration (A2R)
- Tools in use: Zapier
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: MuleSoft (Anypoint / Composer), Flow Integration
- Entitlement: not-licensed
- Salesforce SE view: Native at the enterprise tier (MuleSoft). The honest nuance: Zapier’s long-tail SMB connector breadth is different from MuleSoft’s enterprise integration — for lightweight marketing automations, Flow/Composer fit; for the breadth of ad-hoc Zaps, confirm scope.

### Workflow Automation (inline grid) (A2R)
- Tools in use: Gridmate
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Flow, Dynamic Forms, Enhanced List Views
- Entitlement: not-licensed
- Salesforce SE view: Agree Native. Enhanced list views + inline edit cover the grid-editing job well.

### Project / Work Mgmt (A2R)
- Tools in use: Asana
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap for dedicated project management (Slack can orchestrate work, but it is not Asana parity).

### Issue Tracking / Work Mgmt (A2R)
- Tools in use: Jira
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap. The one adjacency to mention: Service↔Jira sync for support-engineering escalation exists via integration, but Jira itself is not replaced.

## Community & Advocacy

### Online Community Platform (A2R)
- Tools in use: Higher Logic Vanilla
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Experience Cloud
- Entitlement: not-licensed
- Salesforce SE view: Native for branded community/portal + forums. The nuance: Higher Logic’s engagement-automation/email-to-community features are deeper — confirm whether those specific features are in use.

### Customer Advocacy · Reference Mgmt · Peer Referral (A2R)
- Tools in use: Influitive, ReferenceEdge, PeerBound
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Experience Cloud, Gamification
- Entitlement: not-licensed
- Salesforce SE view: Partial. Advocacy community + gamification can land in Experience Cloud; the specialized reference-management workflows (tracking reference burnout, matching, rewards) are a genuine gap. Split: advocacy = partial, reference-management = gap.

## Website & SEO

### Web Hosting / CMS · SEO Optimization · Tag Mgmt / CDP (A2R)
- Tools in use: Pantheon, ORM Technologies, Tealium
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Data 360 (CDP), Salesforce CMS
- Entitlement: not-licensed
- Salesforce SE view: Partial / Data 360. The CDP/tag-management job (Tealium) is where Data 360 genuinely competes — that is the one to lean on. Web hosting (Pantheon) and SEO optimization are gaps. Precise framing: Tealium→Data 360 is a real conversation; Pantheon is not.

## Review & Peer Sites

### Review / Peer Listing (A2R)
- Tools in use: G2, Capterra, Software Advice
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap. Intent data FROM these (e.g. G2 buyer intent) could flow into Data 360, but the directories themselves are not replaced.

## DevOps / SF Release Mgmt

### Salesforce Release / DevOps (A2R)
- Tools in use: Prodly
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: DevOps Center
- Entitlement: not-licensed
- Salesforce SE view: Partial, not Covered. DevOps Center covers metadata release pipelines; Prodly’s specialty is relational REFERENCE/CONFIG DATA deployment (e.g. CPQ data), which DevOps Center does not do. For code/metadata = native; for config-data seeding = keep Prodly.

## Customer Success

### Customer Health / Retention (A2R)
- Tools in use: Gainsight
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Service Cloud, CRM Analytics, Data 360, Agentforce
- Entitlement: not-licensed
- Salesforce SE view: Partial is honest and important. Salesforce can assemble health scoring + success plans, but Gainsight’s turnkey CS playbooks/journey orchestration is mature. This is a build-vs-buy conversation; do not overclaim parity to EA. Note the Claudeforce call named "customer health" as a priority use case — relevant for the Agentforce angle.

## CPQ / Quoting

### Configure-Price-Quote & Revenue Lifecycle (A2R)
- Tools in use: PSQuote
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Revenue Cloud Advanced, Agentforce Revenue Management (ARM), CPQ Plus (legacy)
- Entitlement: owned
- Could retire: SteelBrick CPQ, PSQuote
- Salesforce SE view: The sharpest entitlement finding on the whole map: Blackbaud is paying for BOTH the legacy CPQ Plus (SteelBrick) AND its replacement, Revenue Cloud Advanced (the "CPQ Upgrade"), simultaneously — the migration stalled, so the old and new sit side by side on the entitlement. Restarting that migration is a Professional Services engagement, not a licensing question. Crucially it is NOT a standalone CPQ swap: configure-price-quote is inseparable from opportunity management (new-logo deals the sales team runs) and from renewals (which Customer Success runs) — so a Revenue Cloud deployment is really a sales-and-renewal PROCESS change. Pairing it with CLM and Agentforce Revenue Management (ARM) is the right shape: ARM unlocks product-catalog, pricing and bundling, all API-enabled unlike CPQ. (OSF is the likely implementation partner.)

## PSA / Services ERP

### PSA / Services Financials (A2R)
- Tools in use: Certinia (FinancialForce)
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap for the ERP/GL and PSA financials. Certinia is native-on-platform (built on Salesforce) but is a third party — Salesforce does not provide the PSA/ERP itself. Honest gap.

## Search & Relevance

### Enterprise Search / Relevance (A2R)
- Tools in use: Coveo for Salesforce
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Einstein Search, Data 360 federated search, Agentforce
- Entitlement: not-licensed
- Salesforce SE view: Partial. Einstein Search + Agentforce grounding cover in-Salesforce relevance well; Coveo’s cross-repository enterprise search + ML relevance tuning is deeper. For Knowledge-grounded agent answers, native/Agentforce is strong (this is exactly the DISW pattern we proved); for broad enterprise search, Coveo may stay.

## Support

### Contact Center / Telephony · WFO · Noise Cancellation (I2R)
- Tools in use: Five9, Amazon Connect, Calabrio / Controlio, Krisp
- Alignment: **Integrates** — Salesforce does not replace the tool, but surfaces it inside the platform (packaged app / API) so the work happens in one place.
- Salesforce products: Service Cloud Voice (Partner Contact Center + Amazon Connect), Omni-Channel
- Entitlement: owned
- Salesforce SE view: Entitlement note: Blackbaud already owns Partner Contact Center with Amazon Connect (Unlimited, 420) — so Service Cloud Voice is a paid entitlement, not a net-new buy. Integrates is still the precise placement: it brings Amazon Connect (and partner telephony) INTO the console — you keep the carrier and unify it in Service Cloud. Deliberately NOT marking Five9 as a retire candidate: the prep call left open whether Amazon Connect is a direct AWS relationship or runs through a voice partner, and Five9 may BE the carrier rather than a tool to replace. That carrier question is the thing to resolve before any consolidation claim — hence a discussion, not a retire. Noise cancellation (Krisp) is out of scope for Salesforce.

### WFM Scheduling & Forecasting (I2R)
- Tools in use: Playvox
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Service Cloud Workforce Engagement
- Entitlement: not-licensed
- Salesforce SE view: Agree Native for the WFM/forecasting job via Workforce Engagement. Solid consolidation candidate within the support stack.

### Incident Alerting · Customer Status Page (I2R)
- Tools in use: Opsgenie, Status.IO
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Service Cloud Incident Management
- Entitlement: not-licensed
- Salesforce SE view: Partial. Incident Management covers customer-facing incident comms + case association; engineer on-call paging (Opsgenie) and public status pages (Status.IO) are distinct. Keep those; integrate the incident record.

## Customer Intelligence

### Churn Risk Analysis (I2R)
- Tools in use: Staircase AI
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: CRM Analytics, Einstein Studio, Data 360, Revenue Intelligence
- Entitlement: not-licensed
- Salesforce SE view: Partial. Salesforce can build churn/engagement models (Einstein Studio + Data 360), but Staircase’s conversational-signal churn analysis across comms is specialized. Build-vs-buy; tie to the Gainsight CS conversation.

### Renewal Reporting & Analytics (I2R)
- Tools in use: Qlik
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Tableau Next, Tableau, Data 360
- Entitlement: owned-expiring (expires ~Jan 2027)
- Could retire: Qlik
- Salesforce SE view: Native for renewal reporting on CRM data. Entitlement nuance: CRM Analytics is NOT separately licensed (no Plus SKU found), but Tableau Next now covers this natively within the Data 360 context — and Tableau (owned) expires ~Jan 2027. Qlik is often an enterprise BI standard spanning non-CRM data — confirm whether it is renewal-specific (Tableau Next fits) or the enterprise BI platform (a broader standalone-Tableau-vs-Qlik decision).

### Product Ideas / Idea Bank (I2R)
- Tools in use: Aha!
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Ideas / IdeaExchange on Experience Cloud
- Entitlement: not-licensed
- Salesforce SE view: Partial. The customer-facing idea-capture/voting job can live in Experience Cloud Ideas; Aha!’s product-roadmap/strategy planning is a separate PM discipline Salesforce does not cover. Split: idea capture = partial, roadmap planning = gap.

### Product Analytics (I2R)
- Tools in use: MixPanel / Heap
- Alignment: **Data 360** — Keep the tool; unify and activate its data through Data 360 (Data Cloud) so the signal lands on the customer record and in agents.
- Salesforce products: Data 360, CRM Analytics
- Entitlement: not-licensed
- Salesforce SE view: Data 360. Product-usage events can be ingested into Data 360 and joined to the customer record (powerful for CS/renewals/health), but Salesforce is not a product-analytics autocapture tool. Keep MixPanel/Heap; pipe the signal into Data 360.

## Digital Customer Experience

### Customer Onboarding / Adoption Portals (I2R)
- Tools in use: EverAfter
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Experience Cloud
- Entitlement: not-licensed
- Salesforce SE view: Partial. Experience Cloud can build onboarding/customer hubs; EverAfter’s pre-built CS-collaboration-portal templates and ease-of-standup are its differentiator. Buildable natively, but confirm the lift vs. EverAfter’s turnkey model.

### Partner Relationship Management (I2R)
- Tools in use: Zift (Partner Portal)
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Partner Relationship Management (Experience Cloud)
- Entitlement: not-licensed
- Salesforce SE view: Native for PRM core (deal reg, lead distribution, partner portal). Nuance: Zift adds through-channel marketing automation (TCMA) that Salesforce PRM does not fully cover — confirm whether TCMA is in use.

### Meeting Scheduling (CS) (I2R)
- Tools in use: Calendly
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Salesforce Scheduler, Einstein 1 Inbox
- Entitlement: not-licensed
- Salesforce SE view: Native. Same as the A2R scheduling cluster; consolidating scheduling across A2R + I2R is one clean story.

## Internal Enablement

### LMS / Training · Course Authoring (I2R)
- Tools in use: Docebo, Articulate
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Enablement, Trailhead / myTrailhead (now Enablement)
- Entitlement: not-licensed
- Salesforce SE view: Partial, and the draft already splits it correctly. Guided CRM-centric enablement is native; a general-purpose LMS (Docebo) + SCORM course authoring (Articulate) are not Salesforce. Keep the LMS/authoring; native fits CRM enablement specifically.

### Screen Recording · Video / Audio Editing (I2R)
- Tools in use: Camtasia, Descript
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap. Clean non-overlap.

### Documentation (I2R)
- Tools in use: Confluence
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Quip, Salesforce Knowledge
- Entitlement: not-licensed
- Salesforce SE view: Partial, not Covered. Quip + Knowledge cover CRM-adjacent docs/runbooks and customer-facing knowledge well (the DISW Knowledge pattern we built proves this). Confluence as the engineering-wide wiki/knowledge base is broader; realistic story is CRM/support docs native, engineering wiki stays.

### Work Management (I2R)
- Tools in use: Smartsheet
- Alignment: **Gap** — Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.
- Entitlement: na
- Salesforce SE view: Agree Gap for the collaborative-grid/PM job. Quip spreadsheets exist but are not Smartsheet parity for programme management. Honest gap.

## Retention & Growth

### Sales Commission (I2R)
- Tools in use: Xactly
- Alignment: **Native** — Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.
- Salesforce products: Spiff (Incentive Compensation Management)
- Entitlement: not-licensed
- Salesforce SE view: Native via Spiff / Incentive Compensation Management — product naming is transitional ("Spiff" → Incentive Compensation Management), say both. Honest nuance: Xactly is an enterprise-grade ICM incumbent; parity for complex comp plans should be validated, but this is a legitimate native play.

### E-Signature (I2R)
- Tools in use: Adobe Sign (EchoSign)
- Alignment: **Integrates** — Salesforce does not replace the tool, but surfaces it inside the platform (packaged app / API) so the work happens in one place.
- Salesforce products: AppExchange e-signature (Adobe Sign / DocuSign), Revenue Cloud
- Entitlement: not-licensed
- Salesforce SE view: Reframed from "Not Covered" to Integrates. Salesforce does not build an e-signature engine, but Adobe Sign/DocuSign integrate deeply via AppExchange and drive signature directly from Opportunity/Contract/Revenue Cloud records. The signing stays Adobe; the workflow is native. "Gap" overstates it.

## Platform

### Privacy / Consent Management (I2R)
- Tools in use: OneTrust
- Alignment: **Partial** — Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.
- Salesforce products: Privacy Center, Data 360 Consent Management
- Entitlement: not-licensed
- Salesforce SE view: Partial, not Covered. Privacy Center + Data 360 consent cover Salesforce-resident data retention/RTBF/consent well; OneTrust is an enterprise-wide privacy/consent GRC platform spanning far beyond Salesforce. Native covers the Salesforce footprint; OneTrust stays as the enterprise system. Important to be precise here given the health-data sensitivity the Claudeforce call flagged.

