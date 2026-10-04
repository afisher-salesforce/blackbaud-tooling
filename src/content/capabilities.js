/**
 * Blackbaud capability inventory → Salesforce alignment.
 *
 * SOURCE OF TRUTH, in order of authority:
 *   1. BB-Tool-Inventory.xlsx — 86 tools across the A2R and I2R value streams
 *      (value stream, capability, sub-capability, primary users). Authoritative
 *      for WHAT exists.
 *   2. Oct FY27 - BLKB Tech Stack Inventory.xlsx, "User & Capability View" —
 *      Christa's first-pass Salesforce mapping (Covered / Not Covered /
 *      Inconclusive + prose). Its verdicts are captured verbatim-ish in
 *      `draftNote`.
 *
 * The `alignment` key is the SE-reviewed 6-way placement (see alignment.js). It
 * STARTS from Christa's draft but is corrected where the draft is wrong or too
 * black-and-white; the correction/nuance is written in `seReview`. Both are
 * explicitly provisional and for discussion — nothing here is a Salesforce
 * commitment, and the renewal/ACV/user/utilization data from the spreadsheet is
 * deliberately NOT included (that is a post-meeting data ask from Russ).
 *
 * Rows are grouped by capability where Christa's view sheet grouped them (e.g.
 * the 4 Support telephony/WFO tools are one row), to keep the discussion at the
 * capability altitude rather than tool-by-tool.
 */

// trailheadSlug values map to scripts/refresh-trailhead.js CAPABILITY_QUERIES.
// A slug is set only where Salesforce genuinely aligns (native/integrates/
// data360/partial) and a learning path is useful — never on a pure gap.

export const CAPABILITIES = [
  // ─────────────────────────── CRM & Core Platform ───────────────────────────
  {
    id: 'crm-system-of-record',
    valueStream: 'A2R',
    domain: 'CRM & Core Platform',
    subCapability: 'CRM System of Record',
    tools: ['Blackbaud Salesforce', 'JG Salesforce'],
    primaryUsers: 'Sales, Service & GTM (enterprise); JustGiving Sales & Marketing',
    alignment: 'native',
    sfProducts: ['Sales Cloud', 'Service Cloud'],
    ownedKey: 'core-crm',
    draftNote:
      'Christa: Covered — core Sales Cloud & Service Cloud is the enterprise system of record; JustGiving CRM also fully covered.',
    seReview:
      'This is the anchor of the whole conversation: Blackbaud already runs two Salesforce orgs as systems of record. Everything else on this map is about consolidating around an investment they already own.',
    trailheadSlug: 'crm-core',
    discussionPrompts: [
      'Are the Blackbaud and JustGiving orgs on a path to converge, or stay separate? That shapes every downstream consolidation.',
      'Which teams treat Salesforce as the source of truth today vs. working out of a point tool?',
    ],
  },

  // ─────────────────────────── Revenue Intelligence ──────────────────────────
  {
    id: 'revenue-forecasting',
    valueStream: 'A2R',
    domain: 'Revenue Intelligence',
    subCapability: 'Forecasting & Pipeline',
    tools: ['Clari'],
    primaryUsers: 'Sales / Revenue Operations',
    alignment: 'native',
    sfProducts: ['Collaborative Forecasting', 'Pipeline Inspection', 'Territory Management', 'Agentforce for Sales'],
    ownedKey: 'core-crm',
    retires: ['Clari'],
    draftNote:
      'Christa: Covered — Revenue Intelligence, Collaborative Forecasting, Pipeline Inspection, Einstein deal health.',
    seReview:
      'This is the live one: Blackbaud is running a forecasting RFP (Clari / Gong Forecast) for a capability it ALREADY owns — Collaborative Forecasting + Territory Management are included in Sales & Service Cloud Unlimited, and Agentforce for Sales (owned) adds conversational access to the forecast. Chris Lindner’s reaction captured it: "$300K saved right out of the box." This is an IMPLEMENTATION play, not a procurement play. The one parity item to validate live: forward-looking conversion analytics (not just current-quarter rollup).',
    trailheadSlug: 'forecasting',
    discussionPrompts: [
      'What does Clari give RevOps today that collaborative forecasting + Pipeline Inspection would need to match before a switch?',
      'Is the Clari renewal timing the forcing function for sequencing this first?',
    ],
  },
  {
    id: 'conversation-intelligence',
    valueStream: 'A2R',
    domain: 'Revenue Intelligence',
    subCapability: 'Conversation Intelligence',
    tools: ['Gong'],
    primaryUsers: 'Sales, Marketing & Customer Success',
    alignment: 'partial',
    sfProducts: ['Customer Experience Intelligence (CXI)', 'Einstein Conversation Insights'],
    ownedKey: 'cxi',
    retires: ['Gong'],
    draftNote:
      'Christa: Covered — Einstein Conversation Insights (call/meeting recording analysis, transcription, competitor mentions, coaching).',
    seReview:
      'Important entitlement note: Blackbaud ALREADY owns Customer Experience Intelligence (Unlimited) — the conversation-intelligence capability that overlaps Gong is a paid, active entitlement, not a net-new buy. Still Partial on the business side: the prep call flagged that unwinding Gong is NOT a clean swap — it is woven into the sales process across Sales, Marketing and CS. So the honest message is "you already own the replacement capability; whether/when to retire Gong is a sales-process conversation, not a licensing one."',
    trailheadSlug: 'conversation-insights',
    discussionPrompts: [
      'Which teams depend on Gong today, and for what exactly — coaching, deal intelligence, or forecasting signal?',
      'Would a phased ECI pilot alongside Gong de-risk this more than a cutover?',
    ],
  },
  {
    id: 'marketing-attribution',
    valueStream: 'A2R',
    domain: 'Revenue Intelligence',
    subCapability: 'Marketing Attribution',
    tools: ['Marketo Measure (Bizible)'],
    primaryUsers: 'Marketing',
    alignment: 'partial',
    sfProducts: ['Marketing Cloud Account Engagement', 'CRM Analytics', 'Data 360'],
    draftNote:
      'Christa: Covered — Account Engagement + CRM Analytics / Data Cloud for multi-touch campaign influence and revenue attribution.',
    seReview:
      'Partial. Multi-touch attribution modeling is a genuine strength of Marketo Measure; Salesforce can land campaign influence + revenue attribution natively, but parity on the attribution modeling depends on the marketing-automation decision (see Marketo) and how much is already in Data 360.',
    trailheadSlug: 'marketing-attribution',
    discussionPrompts: [
      'Is attribution tied to keeping Marketo, or could it move with a marketing-platform decision?',
    ],
  },
  {
    id: 'sales-engagement-dialer',
    valueStream: 'A2R',
    domain: 'Revenue Intelligence',
    subCapability: 'Sales Engagement / Dialer',
    tools: ['Nooks'],
    primaryUsers: 'Sales / Revenue',
    alignment: 'native',
    sfProducts: ['Sales Engagement', 'Sales Dialer'],
    draftNote:
      'Christa: Covered — Sales Engagement (High Velocity Sales): native dialer, call scripts, automated cadences.',
    seReview:
      'Agree Native for the cadence/dialer jobs. Nooks adds an AI parallel-dialer/virtual-floor angle worth confirming is in scope.',
    trailheadSlug: 'sales-engagement',
    discussionPrompts: ['Is the Nooks value the dialer, the cadences, or the AI calling floor specifically?'],
  },

  // ─────────────────────────── Marketing Automation ──────────────────────────
  {
    id: 'marketing-automation-platform',
    valueStream: 'A2R',
    domain: 'Marketing Automation',
    subCapability: 'Marketing Automation Platform',
    tools: ['Marketo (Engage)'],
    primaryUsers: 'Marketing',
    alignment: 'discuss',
    sfProducts: ['Marketing Cloud Account Engagement', 'Marketing Cloud Growth / Advanced'],
    draftNote:
      'Christa grouped Marketo with Demandbase + Qualified as Covered via Account Engagement + Agentforce chat.',
    seReview:
      'Flagged Discuss, not Covered. The prep call was explicit: Blackbaud doesn’t love Marketo, but Marketing Cloud is NOT a clean replacement — it lacks the identity/personalization connection they need and would require web work to bridge. This is the weakest consolidation story today; raise it as discovery, not a recommendation.',
    trailheadSlug: 'marketing-automation',
    discussionPrompts: [
      'What specifically is missing from Marketo today — and is the gap identity/personalization or the automation engine?',
      'Where does the identity/personalization requirement actually live (web, CDP, CRM)?',
    ],
  },
  {
    id: 'abm-orchestration',
    valueStream: 'A2R',
    domain: 'Marketing Automation',
    subCapability: 'ABM Orchestration',
    tools: ['Demandbase'],
    primaryUsers: 'Marketing',
    alignment: 'partial',
    sfProducts: ['Marketing Cloud Account Engagement', 'Data 360'],
    draftNote: 'Christa: Covered (grouped with Marketo/Qualified).',
    seReview:
      'Partial. Account-based nurture + scoring can land in Salesforce, but Demandbase’s intent/advertising orchestration overlaps with the ABM & Data Intelligence tools below and is better discussed as a cluster.',
    trailheadSlug: null,
    discussionPrompts: ['Is Demandbase used for intent, advertising orchestration, or account scoring primarily?'],
  },
  {
    id: 'website-chat-conversational',
    valueStream: 'A2R',
    domain: 'Marketing Automation',
    subCapability: 'Website Chat / Conversational',
    tools: ['Qualified'],
    primaryUsers: 'Marketing',
    alignment: 'native',
    sfProducts: ['Qualified (now part of Salesforce)', 'Agentforce', 'Messaging for Web'],
    ownedKey: 'qualified',
    draftNote: 'Christa: Covered — Agentforce chat / conversational bots.',
    seReview:
      'Entitlement update: Qualified is now part of Salesforce AND Blackbaud already owns it (Qualified Agentic Marketing Platform + SFDC connector, 260 seats) — the website chat on Blackbaud.com IS Qualified today. So this isn’t "could adopt" — it’s already in use. The opportunity is to link Qualified into the broader marketing + SDR architecture now that it is Salesforce-native, rather than treating it as a standalone point tool.',
    trailheadSlug: 'agentforce-service',
    discussionPrompts: ['Would an Agentforce web-chat proof against a Blackbaud use case help make this concrete?'],
  },
  {
    id: 'lead-routing-matching',
    valueStream: 'A2R',
    domain: 'Marketing Automation',
    subCapability: 'Lead Routing / Matching',
    tools: ['LeanData'],
    primaryUsers: 'Marketing / Revenue Operations',
    alignment: 'native',
    sfProducts: ['Lead Assignment Rules', 'Omni-Channel Routing', 'Flow Orchestration'],
    draftNote:
      'Christa: Covered — Assignment Rules, Omni-Channel Routing, Flow Orchestration, Lead-to-Account matching.',
    seReview:
      'Agree Native for standard routing. The honest nuance: LeanData’s more complex matching/round-robin graphs are where teams sometimes keep it — worth confirming their routing complexity.',
    trailheadSlug: 'lead-routing',
    discussionPrompts: ['How complex is the current routing logic — simple rules, or multi-object round-robin graphs?'],
  },
  {
    id: 'meeting-scheduling',
    valueStream: 'A2R',
    domain: 'Scheduling',
    subCapability: 'Meeting Scheduling',
    tools: ['Chili Piper (Gong contract)', 'OnceHub'],
    primaryUsers: 'Sales / Revenue; IT Core / End User',
    alignment: 'native',
    sfProducts: ['Salesforce Scheduler', 'Einstein 1 Inbox'],
    draftNote:
      'Christa: Covered — Salesforce Scheduler + Inbox calendar links; round-robin scheduling.',
    seReview:
      'Agree Native. Note Chili Piper rides the Gong contract, so it is entangled with the Gong decision; OnceHub is a cleaner standalone consolidation. (Calendly sits in the I2R scheduling row.)',
    trailheadSlug: 'scheduler',
    discussionPrompts: ['Three scheduling tools across teams — is there appetite to standardize on one native option?'],
  },

  // ─────────────────────────── Sales Enablement ──────────────────────────────
  {
    id: 'enablement-content',
    valueStream: 'A2R',
    domain: 'Sales Enablement',
    subCapability: 'Content Mgmt, Enablement & Buyer Room',
    tools: ['Spekit'],
    primaryUsers: 'Sales / Marketing Enablement (ETG)',
    alignment: 'partial',
    sfProducts: ['Enablement (formerly Sales Enablement)', 'In-App Guidance'],
    draftNote:
      'Christa: Covered — Salesforce Enablement (In-App Guidance & Sales Cloud Guidance): embedded microlearning, contextual help.',
    seReview:
      'Partial. In-App Guidance + Enablement cover the embedded-help and program jobs. Note the product is now "Enablement" (the former myTrailhead branding is retired) — don’t say myTrailhead. Spekit’s just-in-time knowledge-overlay style is the piece to validate.',
    trailheadSlug: 'enablement',
    discussionPrompts: ['Is Spekit used for rep onboarding programs, or just-in-time field-level help, or both?'],
  },
  {
    id: 'demo-automation',
    valueStream: 'A2R',
    domain: 'Sales Enablement',
    subCapability: 'Demo Automation',
    tools: ['Consensus'],
    primaryUsers: 'Sales / Revenue',
    alignment: 'gap',
    sfProducts: [],
    draftNote:
      'Christa: Not Covered — Salesforce has no interactive branching video product-demo platform like Consensus.',
    seReview: 'Agree genuine Gap. Leave it; naming gaps honestly protects the credibility of the Native calls.',
    trailheadSlug: null,
    discussionPrompts: [],
  },
  {
    id: 'rfp-proposal',
    valueStream: 'A2R',
    domain: 'Sales Enablement',
    subCapability: 'RFP / Proposal Automation',
    tools: ['Responsive.io (RFPIO)'],
    primaryUsers: 'Sales / Sales Engineering',
    alignment: 'gap',
    sfProducts: [],
    draftNote:
      'Christa: Not Covered — no dedicated AI RFP/tender response content database.',
    seReview:
      'Mostly a Gap for the dedicated RFP-response database. The one forward-looking nuance to mention, not claim: an Agentforce + knowledge-grounded agent could assist drafting responses — but that is roadmap, not parity with Responsive today.',
    trailheadSlug: null,
    discussionPrompts: ['Is there interest in an AI-assisted drafting angle later, or is Responsive firmly owned?'],
  },
  {
    id: 'prospecting-sales-intelligence',
    valueStream: 'A2R',
    domain: 'Sales Enablement',
    subCapability: 'Prospecting / Sales Intelligence',
    tools: ['LinkedIn Sales Navigator (MSFT D365 Relationship Sales Plus)'],
    primaryUsers: 'Sales / Revenue (Microsoft EA)',
    alignment: 'integrates',
    sfProducts: ['Sales Navigator for Salesforce', 'Data 360', 'Einstein Activity Capture'],
    draftNote:
      'Christa: Inconclusive — Einstein Activity Capture + Data Cloud offer relationship insights, but LinkedIn’s proprietary B2B graph requires Sales Navigator.',
    seReview:
      'THE canonical shades-of-gray example. This is not Covered and not a Gap: Salesforce surfaces Sales Navigator INSIDE the record (the Sales Navigator app for Salesforce), and Data 360 can unify its signal — so the honest placement is Integrates. You keep the LinkedIn graph (it rides a Microsoft EA) and still get it in-platform. Classic "both/and," which is why binary verdicts mislead here.',
    trailheadSlug: 'sales-navigator',
    discussionPrompts: [
      'Sales Navigator rides a Microsoft EA — is the goal to replace it, or to surface it inside Salesforce so reps stop context-switching?',
      'Would unifying LinkedIn signal via Data 360 onto the account record be valuable even if the license stays?',
    ],
  },

  // ─────────────────────────── ABM & Data Intelligence ───────────────────────
  {
    id: 'data-enrichment-prospecting',
    valueStream: 'A2R',
    domain: 'ABM & Data Intelligence',
    subCapability: 'Data Enrichment / Prospecting',
    tools: ['Clay Labs'],
    primaryUsers: 'Marketing / Revenue Operations',
    alignment: 'partial',
    sfProducts: ['Data 360', 'Data Cloud enrichment'],
    draftNote:
      'Christa: Inconclusive — Data Cloud unifies/enriches, but Clay’s multi-source waterfall scraping is external.',
    seReview:
      'Partial is right. Data 360 unifies and can enrich profiles; Clay’s automated waterfall-enrichment workflows are a distinct capability. Keep-and-unify (Data 360) is the realistic story, not replace.',
    trailheadSlug: 'data360',
    discussionPrompts: ['Is Clay’s value the waterfall-enrichment automation, or the enriched data itself (which could land in Data 360)?'],
  },
  {
    id: 'competitive-intelligence',
    valueStream: 'A2R',
    domain: 'ABM & Data Intelligence',
    subCapability: 'Competitive Intelligence',
    tools: ['Klue Intelligence'],
    primaryUsers: 'Marketing / Revenue',
    alignment: 'partial',
    sfProducts: ['Quip / Files (battlecards)', 'Enablement'],
    draftNote:
      'Christa: Inconclusive — Sales Cloud stores competitor info/battlecards, but automated web scraping is Klue.',
    seReview:
      'Partial. Battlecard storage/distribution can live in Salesforce; the automated competitive-intel gathering/scraping is Klue’s distinct value. Likely keep Klue, surface its output.',
    trailheadSlug: null,
    discussionPrompts: ['Would battlecards delivered in-flow (Enablement) reduce the need for a second surface?'],
  },
  {
    id: 'lead-to-account-media',
    valueStream: 'A2R',
    domain: 'ABM & Data Intelligence',
    subCapability: 'Lead-to-Account / Media · Intent / Demand · Social Listening',
    tools: ['Integrate.com', 'DemandFactor', 'Brandwatch'],
    primaryUsers: 'Marketing',
    alignment: 'partial',
    sfProducts: ['Data 360', 'Marketing Cloud'],
    draftNote:
      'Christa: Inconclusive — Data Cloud unifies customer graphs, but 3rd-party intent feeds + media syndication + social listening need partners.',
    seReview:
      'Partial / Data 360. These are data-feed and listening tools; the pattern is unify-and-activate the signal in Data 360, keep the specialized sources. Not a replacement story.',
    trailheadSlug: 'data360',
    discussionPrompts: ['Which of these feeds would be most valuable unified onto the customer record?'],
  },

  // ─────────────────────────── Analytics & Measurement ───────────────────────
  {
    id: 'web-product-analytics',
    valueStream: 'A2R',
    domain: 'Analytics & Measurement',
    subCapability: 'Web / Product Analytics · Session Replay · Survey/Forms · Data Pipeline',
    tools: ['Adobe Analytics', 'Mouseflow', 'PointerPro', 'Windsor.AI'],
    primaryUsers: 'Marketing',
    alignment: 'partial',
    sfProducts: ['Data 360', 'Tableau', 'Tableau Next'],
    ownedKey: 'tableau',
    draftNote:
      'Christa: Inconclusive — Data Cloud + Tableau analyze web data, but qualitative heatmaps/DOM session replay (Mouseflow) are outside core CRM.',
    seReview:
      'Partial, with an entitlement flag: Tableau is OWNED but EXPIRES ~Jan 2027 (Q4 FY2027) — a near-term decision point. Tableau Next (embedded, now part of the entitlement) covers the Salesforce-resident analytics natively and works best when data is in Salesforce or zero-copied into Data 360; standalone Tableau to replace Qlik is a separate renewal conversation. Session-replay/heatmap (Mouseflow) is a genuine gap within this cluster — analytics = strong, replay = keep.',
    trailheadSlug: 'tableau-analytics',
    discussionPrompts: ['Is the goal unified measurement (Tableau/Data 360) or the behavioral-replay tooling specifically?'],
  },
  {
    id: 'voc-survey',
    valueStream: 'A2R',
    domain: 'Analytics & Measurement',
    subCapability: 'Survey / Experience (VoC)',
    tools: ['Qualtrics Labs'],
    primaryUsers: 'Customer Operations / Research',
    alignment: 'partial',
    sfProducts: ['Feedback Management', 'Salesforce Surveys'],
    draftNote:
      'Christa: Covered — Feedback Management & Surveys embed CSAT/NPS into Case/Contact lifecycles.',
    seReview:
      'Partial, not Covered. Salesforce Surveys/Feedback Management covers embedded CSAT/NPS tied to records; Qualtrics is a far deeper experience-management platform (advanced research, stats, XM). For transactional CSAT in-CRM, native fits; for enterprise XM, keep Qualtrics.',
    trailheadSlug: 'feedback-management',
    discussionPrompts: ['Is Qualtrics doing transactional CSAT, or deep experience-management research? The answer decides the fit.'],
  },
  {
    id: 'seo-tools',
    valueStream: 'A2R',
    domain: 'Analytics & Measurement',
    subCapability: 'SEO / Search Console / Competitive Research',
    tools: ['Google Search Console', 'Semrush'],
    primaryUsers: 'Marketing (SEO)',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — no web-crawler/keyword search-performance databases for SEO.',
    seReview: 'Agree Gap. Clean example of where Salesforce correctly does not play.',
    trailheadSlug: null,
    discussionPrompts: [],
  },

  // ─────────────────────────── Content & Creative ────────────────────────────
  {
    id: 'web-experimentation-cms',
    valueStream: 'A2R',
    domain: 'Content & Creative',
    subCapability: 'Web Experimentation / CMS',
    tools: ['Optimizely (JG + US)'],
    primaryUsers: 'JustGiving & US Digital',
    alignment: 'partial',
    sfProducts: ['Salesforce CMS', 'Experience Cloud', 'Personalization (Data 360)'],
    draftNote:
      'Christa: Covered — CMS + Experience Cloud/Commerce with Personalization for dynamic web experimentation.',
    seReview:
      'Partial. Experience Cloud + Personalization can cover a portion of the experimentation/personalization story, but Optimizely is a dedicated A/B experimentation engine — parity on experimentation is weak. Keep for experimentation; consolidate the CMS/personalization pieces.',
    trailheadSlug: null,
    discussionPrompts: ['Is Optimizely primarily A/B experimentation or CMS? Native fits the CMS/personalization half, not the experimentation half.'],
  },
  {
    id: 'dam-social-copy-landing',
    valueStream: 'A2R',
    domain: 'Content & Creative',
    subCapability: 'DAM · Social Mgmt · AI Copywriting · Landing Pages',
    tools: ['Bynder', 'Sprinklr', 'AnyWord', 'Instapage', 'Sprout Social'],
    primaryUsers: 'Marketing',
    alignment: 'partial',
    sfProducts: ['Marketing Cloud (CloudPages)', 'Salesforce CMS'],
    draftNote:
      'Christa: Inconclusive — Marketing Cloud has landing pages/CMS, but enterprise omnichannel social + standalone DAM are external.',
    seReview:
      'Partial. Landing pages + basic content land in Marketing Cloud; enterprise social publishing (Sprinklr/Sprout) and DAM (Bynder) are genuinely distinct. Realistic: consolidate landing pages, keep DAM + enterprise social.',
    trailheadSlug: null,
    discussionPrompts: ['Which of these five is the most painful/expensive — that is where to focus the consolidation question.'],
  },
  {
    id: 'personalized-decks',
    valueStream: 'A2R',
    domain: 'Content & Creative',
    subCapability: 'Personalized Content / Decks',
    tools: ['Matik'],
    primaryUsers: 'Customer Operations / Marketing',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — no dynamic slide-deck generation from live CRM data.',
    seReview: 'Agree Gap for native deck generation (doc-gen AppExchange partners exist, but that is not Salesforce).',
    trailheadSlug: null,
    discussionPrompts: [],
  },
  {
    id: 'creative-suite',
    valueStream: 'A2R',
    domain: 'Content & Creative',
    subCapability: 'Creative Suite · Stock Imagery',
    tools: ['Adobe Creative Cloud', 'Getty Images'],
    primaryUsers: 'Marketing & IT Core (End User)',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — no graphic design suites or stock-photo libraries.',
    seReview: 'Agree Gap. Obvious non-overlap; keep on the map so the inventory is complete and honest.',
    trailheadSlug: null,
    discussionPrompts: [],
  },

  // ─────────────────────────── Video ─────────────────────────────────────────
  {
    id: 'video-webinar-hosting',
    valueStream: 'A2R',
    domain: 'Video',
    subCapability: 'Webinar / Virtual Events · Video Hosting · Testimonials',
    tools: ['Goldcast', 'Wistia', 'Vocal Video'],
    primaryUsers: 'Marketing',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — no live webinar infrastructure, video hosting, or testimonial collection.',
    seReview:
      'Agree Gap. One nuance to mention: event/attendee RECORDS and campaign ROI can live in Salesforce even though the broadcast infrastructure does not — the data integrates, the platform does not.',
    trailheadSlug: null,
    discussionPrompts: ['Would capturing webinar attendance/engagement as campaign data in Salesforce be useful, even keeping Goldcast?'],
  },

  // ─────────────────────────── Events & Field ────────────────────────────────
  {
    id: 'event-management',
    valueStream: 'A2R',
    domain: 'Events & Field',
    subCapability: 'Event Management',
    tools: ['Swoogo'],
    primaryUsers: 'Marketing / Events',
    alignment: 'partial',
    sfProducts: ['Campaigns', 'Experience Cloud'],
    draftNote:
      'Christa: Inconclusive — Salesforce manages event campaigns/attendee records, but turnkey multi-track agenda/badge mgmt needs Swoogo.',
    seReview: 'Partial is right. Campaign + attendee data is native; conference logistics (agendas, badges) is Swoogo. Keep Swoogo, integrate the data.',
    trailheadSlug: null,
    discussionPrompts: ['Is the pain the logistics tooling or getting event ROI back into the CRM?'],
  },
  {
    id: 'event-lead-capture',
    valueStream: 'A2R',
    domain: 'Events & Field',
    subCapability: 'Event Lead Capture',
    tools: ['iCapture'],
    primaryUsers: 'Marketing / Events (Sales)',
    alignment: 'partial',
    sfProducts: ['Web-to-Lead', 'Salesforce mobile'],
    draftNote:
      'Christa: Inconclusive — Web-to-lead captures event leads, but offline badge scanning/OCR uses iCapture.',
    seReview: 'Partial. Lead capture lands natively; offline tradeshow badge-scan/OCR is iCapture’s specialized hardware/software. Integrate.',
    trailheadSlug: null,
    discussionPrompts: [],
  },
  {
    id: 'direct-mail-gifting',
    valueStream: 'A2R',
    domain: 'Events & Field',
    subCapability: 'Direct Mail / Gifting',
    tools: ['Postal'],
    primaryUsers: 'Marketing',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — no gifting fulfillment, direct-mail printing, or warehouse logistics.',
    seReview: 'Agree Gap. Triggering a gift from a Flow is possible via integration, but fulfillment is Postal.',
    trailheadSlug: null,
    discussionPrompts: [],
  },

  // ─────────────────────────── Automation & Workflow ─────────────────────────
  {
    id: 'ai-agent-chatbot-builder',
    valueStream: 'A2R',
    domain: 'Automation & Workflow',
    subCapability: 'AI Agent / Chatbot Builder',
    tools: ['CoPilot Studio'],
    primaryUsers: 'ETG / IT (Microsoft EA)',
    alignment: 'native',
    sfProducts: ['Agentforce', 'Agent Builder'],
    ownedKey: 'agentforce',
    retires: ['CoPilot Studio'],
    draftNote:
      'Christa: Covered — Agentforce (Einstein Copilot Studio / Bots): low-code autonomous AI agents + conversational workflows.',
    seReview:
      'Native AND owned: Agentforce for Sales (750) and for Service (550) are active entitlements. CoPilot Studio rides the Microsoft EA; Agentforce is the owned, Salesforce-native equivalent that grounds in the CRM data and honors the permission model. The Agentforce Coworker pilot is already in the org and can be enabled by permission (Teams embedding targeted ~Oct). This is also the hook for the future Headless 360 / Aiforce roadmap tile on this site.',
    trailheadSlug: 'agentforce',
    discussionPrompts: [
      'Where are AI agents being built today — CoPilot Studio, elsewhere, or not yet in GTM?',
      'This is the natural place to show a grounded Agentforce agent against Blackbaud data when org access is provisioned.',
    ],
  },
  {
    id: 'ipaas-integration',
    valueStream: 'A2R',
    domain: 'Automation & Workflow',
    subCapability: 'iPaaS / Integration',
    tools: ['Zapier'],
    primaryUsers: 'Marketing / Operations',
    alignment: 'native',
    sfProducts: ['MuleSoft (Anypoint / Composer)', 'Flow Integration'],
    draftNote:
      'Christa: Covered — MuleSoft + Flow Integration provide enterprise iPaaS and API connectivity.',
    seReview:
      'Native at the enterprise tier (MuleSoft). The honest nuance: Zapier’s long-tail SMB connector breadth is different from MuleSoft’s enterprise integration — for lightweight marketing automations, Flow/Composer fit; for the breadth of ad-hoc Zaps, confirm scope.',
    trailheadSlug: 'mulesoft',
    discussionPrompts: ['Is Zapier doing enterprise integration or long-tail "glue" automations? MuleSoft fits the former cleanly.'],
  },
  {
    id: 'workflow-automation-grid',
    valueStream: 'A2R',
    domain: 'Automation & Workflow',
    subCapability: 'Workflow Automation (inline grid)',
    tools: ['Gridmate'],
    primaryUsers: 'Sales / Revenue',
    alignment: 'native',
    sfProducts: ['Flow', 'Dynamic Forms', 'Enhanced List Views'],
    draftNote:
      'Christa: Covered — Flow, Dynamic Forms, Enhanced List Views deliver native inline data updates without a 3rd-party grid.',
    seReview: 'Agree Native. Enhanced list views + inline edit cover the grid-editing job well.',
    trailheadSlug: null,
    discussionPrompts: [],
  },
  {
    id: 'project-work-mgmt',
    valueStream: 'A2R',
    domain: 'Automation & Workflow',
    subCapability: 'Project / Work Mgmt',
    tools: ['Asana'],
    primaryUsers: 'Marketing',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — no dedicated team project/task management app like Asana.',
    seReview: 'Agree Gap for dedicated project management (Slack can orchestrate work, but it is not Asana parity).',
    trailheadSlug: null,
    discussionPrompts: [],
  },
  {
    id: 'issue-tracking',
    valueStream: 'A2R',
    domain: 'Automation & Workflow',
    subCapability: 'Issue Tracking / Work Mgmt',
    tools: ['Jira'],
    primaryUsers: 'ETG / Engineering',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — Salesforce is not an agile dev issue tracker / engineering backlog.',
    seReview:
      'Agree Gap. The one adjacency to mention: Service↔Jira sync for support-engineering escalation exists via integration, but Jira itself is not replaced.',
    trailheadSlug: null,
    discussionPrompts: [],
  },

  // ─────────────────────────── Community & Advocacy ──────────────────────────
  {
    id: 'online-community',
    valueStream: 'A2R',
    domain: 'Community & Advocacy',
    subCapability: 'Online Community Platform',
    tools: ['Higher Logic Vanilla'],
    primaryUsers: 'Customer / Community (Marketing & Success)',
    alignment: 'native',
    sfProducts: ['Experience Cloud'],
    draftNote:
      'Christa: Covered — Experience Cloud (Customer & Partner Communities): branded self-service portals, peer forums, discussion.',
    seReview:
      'Native for branded community/portal + forums. The nuance: Higher Logic’s engagement-automation/email-to-community features are deeper — confirm whether those specific features are in use.',
    trailheadSlug: 'experience-cloud',
    discussionPrompts: ['Is the community used mainly for self-service, peer forums, or engagement automation?'],
  },
  {
    id: 'customer-advocacy',
    valueStream: 'A2R',
    domain: 'Community & Advocacy',
    subCapability: 'Customer Advocacy · Reference Mgmt · Peer Referral',
    tools: ['Influitive', 'ReferenceEdge', 'PeerBound'],
    primaryUsers: 'Marketing / Sales',
    alignment: 'partial',
    sfProducts: ['Experience Cloud', 'Gamification'],
    draftNote:
      'Christa: Mixed — Experience Cloud supports communities/gamified badges (Influitive), but dedicated reference-management workflows (ReferenceEdge, PeerBound) are a gap.',
    seReview:
      'Partial. Advocacy community + gamification can land in Experience Cloud; the specialized reference-management workflows (tracking reference burnout, matching, rewards) are a genuine gap. Split: advocacy = partial, reference-management = gap.',
    trailheadSlug: null,
    discussionPrompts: ['Is the priority the advocacy community or the structured reference-request workflow?'],
  },

  // ─────────────────────────── Website & SEO ─────────────────────────────────
  {
    id: 'web-hosting-cms-cdp',
    valueStream: 'A2R',
    domain: 'Website & SEO',
    subCapability: 'Web Hosting / CMS · SEO Optimization · Tag Mgmt / CDP',
    tools: ['Pantheon', 'ORM Technologies', 'Tealium'],
    primaryUsers: 'Marketing',
    alignment: 'partial',
    sfProducts: ['Data 360 (CDP)', 'Salesforce CMS'],
    draftNote:
      'Christa: Inconclusive — Data Cloud provides CDP capabilities, but Salesforce is not a general CMS web host (Pantheon) or SEO engine.',
    seReview:
      'Partial / Data 360. The CDP/tag-management job (Tealium) is where Data 360 genuinely competes — that is the one to lean on. Web hosting (Pantheon) and SEO optimization are gaps. Precise framing: Tealium→Data 360 is a real conversation; Pantheon is not.',
    trailheadSlug: 'data360',
    discussionPrompts: ['Of these three, Tealium (CDP/tag) is the Data 360 overlap — is a CDP consolidation of interest?'],
  },

  // ─────────────────────────── Review & Peer Sites ───────────────────────────
  {
    id: 'review-peer-sites',
    valueStream: 'A2R',
    domain: 'Review & Peer Sites',
    subCapability: 'Review / Peer Listing',
    tools: ['G2', 'Capterra', 'Software Advice'],
    primaryUsers: 'Marketing',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — Salesforce does not operate B2B review directories.',
    seReview: 'Agree Gap. Intent data FROM these (e.g. G2 buyer intent) could flow into Data 360, but the directories themselves are not replaced.',
    trailheadSlug: null,
    discussionPrompts: [],
  },

  // ─────────────────────────── DevOps / SF Release Mgmt ──────────────────────
  {
    id: 'sf-release-devops',
    valueStream: 'A2R',
    domain: 'DevOps / SF Release Mgmt',
    subCapability: 'Salesforce Release / DevOps',
    tools: ['Prodly'],
    primaryUsers: 'Sales / Revenue (SF DevOps)',
    alignment: 'partial',
    sfProducts: ['DevOps Center'],
    draftNote:
      'Christa: Covered — DevOps Center manages release pipelines, GitHub branching, user stories, metadata deployments.',
    seReview:
      'Partial, not Covered. DevOps Center covers metadata release pipelines; Prodly’s specialty is relational REFERENCE/CONFIG DATA deployment (e.g. CPQ data), which DevOps Center does not do. For code/metadata = native; for config-data seeding = keep Prodly.',
    trailheadSlug: 'devops-center',
    discussionPrompts: ['Is Prodly deploying metadata or relational configuration data? DevOps Center covers the former, not the latter.'],
  },

  // ─────────────────────────── Customer Success ──────────────────────────────
  {
    id: 'customer-health-retention',
    valueStream: 'A2R',
    domain: 'Customer Success',
    subCapability: 'Customer Health / Retention',
    tools: ['Gainsight'],
    primaryUsers: 'Customer Success / Sales (renewals & expansion)',
    alignment: 'partial',
    sfProducts: ['Service Cloud', 'CRM Analytics', 'Data 360', 'Agentforce'],
    draftNote:
      'Christa: Inconclusive — Service Cloud, CRM Analytics & health scoring exist, but no turnkey CS platform with built-in journey playbooks like Gainsight.',
    seReview:
      'Partial is honest and important. Salesforce can assemble health scoring + success plans, but Gainsight’s turnkey CS playbooks/journey orchestration is mature. This is a build-vs-buy conversation; do not overclaim parity to EA. Note the Claudeforce call named "customer health" as a priority use case — relevant for the Agentforce angle.',
    trailheadSlug: 'customer-success',
    discussionPrompts: [
      'How deeply are Gainsight playbooks/journeys embedded in CS process today?',
      'Would an Agentforce customer-health agent (pulling from Snowflake/Data 360, not just Salesforce) be an interesting first step?',
    ],
  },

  // ─────────────────────────── CPQ / Quoting · PSA ───────────────────────────
  {
    id: 'revenue-cloud-cpq',
    valueStream: 'A2R',
    domain: 'CPQ / Quoting',
    subCapability: 'Configure-Price-Quote & Revenue Lifecycle',
    tools: ['PSQuote'],
    primaryUsers: 'Sales (new logos) · Customer Success (renewals) · Professional Services',
    alignment: 'native',
    sfProducts: ['Revenue Cloud Advanced', 'Agentforce Revenue Management (ARM)', 'CPQ Plus (legacy)'],
    ownedKey: 'revenue-cloud',
    retires: ['SteelBrick CPQ', 'PSQuote'],
    isFocus: true,
    draftNote:
      'Christa: Covered — Salesforce CPQ / Revenue Cloud: PS rate cards, SOW quoting, approval matrices, contracts.',
    seReview:
      'The sharpest entitlement finding on the whole map: Blackbaud is paying for BOTH the legacy CPQ Plus (SteelBrick) AND its replacement, Revenue Cloud Advanced (the "CPQ Upgrade"), simultaneously — the migration stalled, so the old and new sit side by side on the entitlement. Restarting that migration is a Professional Services engagement, not a licensing question. Crucially it is NOT a standalone CPQ swap: configure-price-quote is inseparable from opportunity management (new-logo deals the sales team runs) and from renewals (which Customer Success runs) — so a Revenue Cloud deployment is really a sales-and-renewal PROCESS change. Pairing it with CLM and Agentforce Revenue Management (ARM) is the right shape: ARM unlocks product-catalog, pricing and bundling, all API-enabled unlike CPQ. (OSF is the likely implementation partner.)',
    trailheadSlug: 'revenue-cloud',
    discussionPrompts: [
      'The migration from CPQ Plus to Revenue Cloud Advanced stalled — what blocked it, and what would it take to restart (a Professional Services engagement scoped around it)?',
      'Who owns the quote-to-cash process end to end today — sales for new logos, CS for renewals? A Revenue Cloud deployment changes both, so both need to be at the table.',
      'Should CLM and Agentforce Revenue Management (ARM) be deployed together with the Revenue Cloud migration, rather than as separate projects?',
    ],
  },
  {
    id: 'psa-services-erp',
    valueStream: 'A2R',
    domain: 'PSA / Services ERP',
    subCapability: 'PSA / Services Financials',
    tools: ['Certinia (FinancialForce)'],
    primaryUsers: 'Professional Services / Finance',
    alignment: 'gap',
    sfProducts: [],
    draftNote:
      'Christa: Not Covered — no native ERP/GL financials or deep services resource-utilization accounting.',
    seReview:
      'Agree Gap for the ERP/GL and PSA financials. Certinia is native-on-platform (built on Salesforce) but is a third party — Salesforce does not provide the PSA/ERP itself. Honest gap.',
    trailheadSlug: null,
    discussionPrompts: [],
  },

  // ─────────────────────────── Search & Relevance ────────────────────────────
  {
    id: 'enterprise-search',
    valueStream: 'A2R',
    domain: 'Search & Relevance',
    subCapability: 'Enterprise Search / Relevance',
    tools: ['Coveo for Salesforce'],
    primaryUsers: 'Customer Support / Marketing (search)',
    alignment: 'partial',
    sfProducts: ['Einstein Search', 'Data 360 federated search', 'Agentforce'],
    draftNote:
      'Christa: Covered — Einstein Search, Agentforce, and Data Cloud federated search across Knowledge and external repositories.',
    seReview:
      'Partial. Einstein Search + Agentforce grounding cover in-Salesforce relevance well; Coveo’s cross-repository enterprise search + ML relevance tuning is deeper. For Knowledge-grounded agent answers, native/Agentforce is strong (this is exactly the DISW pattern we proved); for broad enterprise search, Coveo may stay.',
    trailheadSlug: 'einstein-search',
    discussionPrompts: ['Is Coveo powering in-CRM/community search or true cross-repository enterprise search?'],
  },

  // ═══════════════════════════════ I2R-led ═══════════════════════════════════

  // ─────────────────────────── Support ───────────────────────────────────────
  {
    id: 'contact-center-telephony',
    valueStream: 'I2R',
    domain: 'Support',
    subCapability: 'Contact Center / Telephony · WFO · Noise Cancellation',
    tools: ['Five9', 'Amazon Connect', 'Calabrio / Controlio', 'Krisp'],
    primaryUsers: 'Customer Support — Collaboration Services',
    alignment: 'integrates',
    sfProducts: ['Service Cloud Voice (Partner Contact Center + Amazon Connect)', 'Omni-Channel'],
    ownedKey: 'service-voice',
    draftNote:
      'Christa: Covered — Service Cloud Voice (Amazon Connect / partner telephony), Omni-Channel supervisor routing, Einstein Conversation Insights.',
    seReview:
      'Entitlement note: Blackbaud already owns Partner Contact Center with Amazon Connect (Unlimited, 420) — so Service Cloud Voice is a paid entitlement, not a net-new buy. Integrates is still the precise placement: it brings Amazon Connect (and partner telephony) INTO the console — you keep the carrier and unify it in Service Cloud. Deliberately NOT marking Five9 as a retire candidate: the prep call left open whether Amazon Connect is a direct AWS relationship or runs through a voice partner, and Five9 may BE the carrier rather than a tool to replace. That carrier question is the thing to resolve before any consolidation claim — hence a discussion, not a retire. Noise cancellation (Krisp) is out of scope for Salesforce.',
    trailheadSlug: 'service-cloud-voice',
    discussionPrompts: [
      'Is Amazon Connect a direct AWS relationship or through a voice partner? That changes the Service Cloud Voice integration path.',
      'Would unifying telephony into the Service console reduce agent context-switching enough to justify the integration work?',
    ],
  },
  {
    id: 'wfm-scheduling',
    valueStream: 'I2R',
    domain: 'Support',
    subCapability: 'WFM Scheduling & Forecasting',
    tools: ['Playvox'],
    primaryUsers: 'Customer Support — Platform & AI',
    alignment: 'native',
    sfProducts: ['Service Cloud Workforce Engagement'],
    draftNote:
      'Christa: Covered — Service Cloud Workforce Engagement (SWE): AI demand forecasting, agent shift scheduling, intraday capacity mgmt.',
    seReview:
      'Agree Native for the WFM/forecasting job via Workforce Engagement. Solid consolidation candidate within the support stack.',
    trailheadSlug: 'workforce-engagement',
    discussionPrompts: ['Is Playvox WFM the whole value, or is it bundled with QM/agent-coaching that needs separate treatment?'],
  },
  {
    id: 'incident-status',
    valueStream: 'I2R',
    domain: 'Support',
    subCapability: 'Incident Alerting · Customer Status Page',
    tools: ['Opsgenie', 'Status.IO'],
    primaryUsers: 'Technical Operations — Unified Ops',
    alignment: 'partial',
    sfProducts: ['Service Cloud Incident Management'],
    draftNote:
      'Christa: Inconclusive — Service Cloud Incident Management handles incident communications, but engineer on-call alerting + status pages are external.',
    seReview:
      'Partial. Incident Management covers customer-facing incident comms + case association; engineer on-call paging (Opsgenie) and public status pages (Status.IO) are distinct. Keep those; integrate the incident record.',
    trailheadSlug: null,
    discussionPrompts: ['Is the overlap the customer-facing incident communication, or the engineering on-call paging?'],
  },

  // ─────────────────────────── Customer Intelligence ─────────────────────────
  {
    id: 'churn-risk',
    valueStream: 'I2R',
    domain: 'Customer Intelligence',
    subCapability: 'Churn Risk Analysis',
    tools: ['Staircase AI'],
    primaryUsers: 'Customer Success Operations',
    alignment: 'partial',
    sfProducts: ['CRM Analytics', 'Einstein Studio', 'Data 360', 'Revenue Intelligence'],
    draftNote:
      'Christa: Covered — CRM Analytics, Einstein Studio & Revenue Intelligence provide predictive churn signals and engagement trends.',
    seReview:
      'Partial. Salesforce can build churn/engagement models (Einstein Studio + Data 360), but Staircase’s conversational-signal churn analysis across comms is specialized. Build-vs-buy; tie to the Gainsight CS conversation.',
    trailheadSlug: 'data360',
    discussionPrompts: ['Does churn signal come from CRM engagement, or from analyzing comms/conversations specifically?'],
  },
  {
    id: 'renewal-reporting',
    valueStream: 'I2R',
    domain: 'Customer Intelligence',
    subCapability: 'Renewal Reporting & Analytics',
    tools: ['Qlik'],
    primaryUsers: 'Data Insights / Renewals',
    alignment: 'native',
    sfProducts: ['Tableau Next', 'Tableau', 'Data 360'],
    ownedKey: 'tableau',
    retires: ['Qlik'],
    draftNote:
      'Christa: Covered — CRM Analytics (Tableau CRM) + Tableau: renewal cohort analytics, retention forecasting, ARR pipeline.',
    seReview:
      'Native for renewal reporting on CRM data. Entitlement nuance: CRM Analytics is NOT separately licensed (no Plus SKU found), but Tableau Next now covers this natively within the Data 360 context — and Tableau (owned) expires ~Jan 2027. Qlik is often an enterprise BI standard spanning non-CRM data — confirm whether it is renewal-specific (Tableau Next fits) or the enterprise BI platform (a broader standalone-Tableau-vs-Qlik decision).',
    trailheadSlug: 'tableau-analytics',
    discussionPrompts: ['Is Qlik the renewals-reporting tool specifically, or Blackbaud’s enterprise BI standard?'],
  },
  {
    id: 'product-ideas',
    valueStream: 'I2R',
    domain: 'Customer Intelligence',
    subCapability: 'Product Ideas / Idea Bank',
    tools: ['Aha!'],
    primaryUsers: 'Product Enablement',
    alignment: 'partial',
    sfProducts: ['Ideas / IdeaExchange on Experience Cloud'],
    draftNote:
      'Christa: Covered — Salesforce Ideas / IdeaExchange on Experience Cloud: user voting, feedback grooming, prioritization.',
    seReview:
      'Partial. The customer-facing idea-capture/voting job can live in Experience Cloud Ideas; Aha!’s product-roadmap/strategy planning is a separate PM discipline Salesforce does not cover. Split: idea capture = partial, roadmap planning = gap.',
    trailheadSlug: null,
    discussionPrompts: ['Is Aha! used for customer idea capture or internal product roadmap planning? Only the former overlaps.'],
  },
  {
    id: 'product-analytics',
    valueStream: 'I2R',
    domain: 'Customer Intelligence',
    subCapability: 'Product Analytics',
    tools: ['MixPanel / Heap'],
    primaryUsers: 'Product / Platform',
    alignment: 'data360',
    sfProducts: ['Data 360', 'CRM Analytics'],
    draftNote:
      'Christa: Inconclusive — Data Cloud + CRM Analytics track product engagement events, but granular autocapture telemetry is product-analytics tooling.',
    seReview:
      'Data 360. Product-usage events can be ingested into Data 360 and joined to the customer record (powerful for CS/renewals/health), but Salesforce is not a product-analytics autocapture tool. Keep MixPanel/Heap; pipe the signal into Data 360.',
    trailheadSlug: 'data360',
    discussionPrompts: ['Would product-usage data unified onto the account record (via Data 360) improve health/renewal signals?'],
  },

  // ─────────────────────────── Digital Customer Experience ───────────────────
  {
    id: 'onboarding-adoption-portals',
    valueStream: 'I2R',
    domain: 'Digital Customer Experience',
    subCapability: 'Customer Onboarding / Adoption Portals',
    tools: ['EverAfter'],
    primaryUsers: 'Customer Success Operations',
    alignment: 'partial',
    sfProducts: ['Experience Cloud'],
    draftNote:
      'Christa: Covered — Experience Cloud portals: onboarding hubs, shared milestones, account visibility.',
    seReview:
      'Partial. Experience Cloud can build onboarding/customer hubs; EverAfter’s pre-built CS-collaboration-portal templates and ease-of-standup are its differentiator. Buildable natively, but confirm the lift vs. EverAfter’s turnkey model.',
    trailheadSlug: 'experience-cloud',
    discussionPrompts: ['Is the value EverAfter’s turnkey templates, or the customer-collaboration concept (buildable in Experience Cloud)?'],
  },
  {
    id: 'prm-partner-portal',
    valueStream: 'I2R',
    domain: 'Digital Customer Experience',
    subCapability: 'Partner Relationship Management',
    tools: ['Zift (Partner Portal)'],
    primaryUsers: 'Partner Programs',
    alignment: 'native',
    sfProducts: ['Partner Relationship Management (Experience Cloud)'],
    draftNote:
      'Christa: Covered — Salesforce PRM on Experience Cloud: deal registration, lead distribution, partner portals.',
    seReview:
      'Native for PRM core (deal reg, lead distribution, partner portal). Nuance: Zift adds through-channel marketing automation (TCMA) that Salesforce PRM does not fully cover — confirm whether TCMA is in use.',
    trailheadSlug: 'experience-cloud',
    discussionPrompts: ['Is Zift used for PRM core or through-channel marketing automation? The latter is a partial, not native.'],
  },
  {
    id: 'dcx-scheduling',
    valueStream: 'I2R',
    domain: 'Digital Customer Experience',
    subCapability: 'Meeting Scheduling (CS)',
    tools: ['Calendly'],
    primaryUsers: 'Customer Success / Sales',
    alignment: 'native',
    sfProducts: ['Salesforce Scheduler', 'Einstein 1 Inbox'],
    draftNote: 'Christa: Covered — Salesforce Scheduler + Inbox calendar links.',
    seReview: 'Native. Same as the A2R scheduling cluster; consolidating scheduling across A2R + I2R is one clean story.',
    trailheadSlug: 'scheduler',
    discussionPrompts: [],
  },

  // ─────────────────────────── Internal Enablement ───────────────────────────
  {
    id: 'lms-training',
    valueStream: 'I2R',
    domain: 'Internal Enablement',
    subCapability: 'LMS / Training · Course Authoring',
    tools: ['Docebo', 'Articulate'],
    primaryUsers: 'ETG / Education — Internal Enablement',
    alignment: 'partial',
    sfProducts: ['Enablement', 'Trailhead / myTrailhead (now Enablement)'],
    draftNote:
      'Christa: Covered — Salesforce Enablement for guided CRM learning; gap in advanced SCORM authoring (Articulate).',
    seReview:
      'Partial, and Christa’s own note already splits it correctly. Guided CRM-centric enablement is native; a general-purpose LMS (Docebo) + SCORM course authoring (Articulate) are not Salesforce. Keep the LMS/authoring; native fits CRM enablement specifically.',
    trailheadSlug: 'enablement',
    discussionPrompts: ['Is Docebo delivering CRM/role enablement (native overlap) or general corporate L&D (keep Docebo)?'],
  },
  {
    id: 'screen-recording-video-edit',
    valueStream: 'I2R',
    domain: 'Internal Enablement',
    subCapability: 'Screen Recording · Video / Audio Editing',
    tools: ['Camtasia', 'Descript'],
    primaryUsers: 'Internal Enablement',
    alignment: 'gap',
    sfProducts: [],
    draftNote: 'Christa: Not Covered — no desktop audio/video recording, screen capture, or multimedia editing.',
    seReview: 'Agree Gap. Clean non-overlap.',
    trailheadSlug: null,
    discussionPrompts: [],
  },
  {
    id: 'documentation',
    valueStream: 'I2R',
    domain: 'Internal Enablement',
    subCapability: 'Documentation',
    tools: ['Confluence'],
    primaryUsers: 'ETG / Engineering',
    alignment: 'partial',
    sfProducts: ['Quip', 'Salesforce Knowledge'],
    draftNote:
      'Christa: Covered — Quip + Salesforce Knowledge: living docs, SOP runbooks, internal documentation tied to CRM.',
    seReview:
      'Partial, not Covered. Quip + Knowledge cover CRM-adjacent docs/runbooks and customer-facing knowledge well (the DISW Knowledge pattern we built proves this). Confluence as the engineering-wide wiki/knowledge base is broader; realistic story is CRM/support docs native, engineering wiki stays.',
    trailheadSlug: 'knowledge',
    discussionPrompts: ['Is Confluence the engineering wiki (keep) or the customer/support knowledge base (native Knowledge fits)?'],
  },
  {
    id: 'work-management-grid',
    valueStream: 'I2R',
    domain: 'Internal Enablement',
    subCapability: 'Work Management',
    tools: ['Smartsheet'],
    primaryUsers: 'Cross-functional — Programme teams',
    alignment: 'gap',
    sfProducts: [],
    draftNote:
      'Christa: Not Covered — Salesforce lacks a native collaborative spreadsheet/work-management grid like Smartsheet; limited to Tasks or custom objects.',
    seReview:
      'Agree Gap for the collaborative-grid/PM job. Quip spreadsheets exist but are not Smartsheet parity for programme management. Honest gap.',
    trailheadSlug: null,
    discussionPrompts: [],
  },

  // ─────────────────────────── Retention & Growth ────────────────────────────
  {
    id: 'sales-commission',
    valueStream: 'I2R',
    domain: 'Retention & Growth',
    subCapability: 'Sales Commission',
    tools: ['Xactly'],
    primaryUsers: 'Sales Operations',
    alignment: 'native',
    sfProducts: ['Spiff (Incentive Compensation Management)'],
    draftNote:
      'Christa: Covered — Salesforce Spiff (Incentive Compensation Management): real-time commission calculation and rep visibility.',
    seReview:
      'Native via Spiff / Incentive Compensation Management — product naming is transitional ("Spiff" → Incentive Compensation Management), say both. Honest nuance: Xactly is an enterprise-grade ICM incumbent; parity for complex comp plans should be validated, but this is a legitimate native play.',
    trailheadSlug: 'incentive-compensation',
    discussionPrompts: ['How complex are the comp plans? That determines how clean the Spiff/ICM migration is.'],
  },
  {
    id: 'e-signature',
    valueStream: 'I2R',
    domain: 'Retention & Growth',
    subCapability: 'E-Signature',
    tools: ['Adobe Sign (EchoSign)'],
    primaryUsers: 'Renewals Operations — Invoice & Billing',
    alignment: 'integrates',
    sfProducts: ['AppExchange e-signature (Adobe Sign / DocuSign)', 'Revenue Cloud'],
    draftNote:
      'Christa: Not Covered — no native e-signature; relies on 3rd-party integrations (Adobe Sign / DocuSign) via AppExchange.',
    seReview:
      'Reframed from "Not Covered" to Integrates. Salesforce does not build an e-signature engine, but Adobe Sign/DocuSign integrate deeply via AppExchange and drive signature directly from Opportunity/Contract/Revenue Cloud records. The signing stays Adobe; the workflow is native. "Gap" overstates it.',
    trailheadSlug: null,
    discussionPrompts: ['Is Adobe Sign already integrated to Salesforce records, or run standalone? Native workflow + Adobe signing is the pattern.'],
  },

  // ─────────────────────────── Platform ──────────────────────────────────────
  {
    id: 'privacy-consent',
    valueStream: 'I2R',
    domain: 'Platform',
    subCapability: 'Privacy / Consent Management',
    tools: ['OneTrust'],
    primaryUsers: 'Privacy / Legal',
    alignment: 'partial',
    sfProducts: ['Privacy Center', 'Data 360 Consent Management'],
    draftNote:
      'Christa: Covered — Salesforce Privacy Center + Data Cloud Consent Management: retention policies, RTBF, consent.',
    seReview:
      'Partial, not Covered. Privacy Center + Data 360 consent cover Salesforce-resident data retention/RTBF/consent well; OneTrust is an enterprise-wide privacy/consent GRC platform spanning far beyond Salesforce. Native covers the Salesforce footprint; OneTrust stays as the enterprise system. Important to be precise here given the health-data sensitivity the Claudeforce call flagged.',
    trailheadSlug: 'privacy-center',
    discussionPrompts: ['Does OneTrust govern enterprise-wide privacy (keep) or primarily Salesforce-resident data (native overlap)?'],
  },
];

// ─── Derived helpers ────────────────────────────────────────────────────────

export function getCapability(id) {
  return CAPABILITIES.find((c) => c.id === id) || null;
}

export function capabilitiesByStream(stream) {
  return CAPABILITIES.filter((c) => c.valueStream === stream);
}

// Distinct capability domains, in first-seen order.
export const DOMAINS = [...new Set(CAPABILITIES.map((c) => c.domain))];

// Count of underlying tools across all rows (should reconcile to ~86).
export const TOOL_COUNT = CAPABILITIES.reduce((n, c) => n + c.tools.length, 0);

// Alignment tallies for the Overview counts.
export function alignmentCounts(rows = CAPABILITIES) {
  return rows.reduce((acc, c) => {
    acc[c.alignment] = (acc[c.alignment] || 0) + 1;
    return acc;
  }, {});
}

// ─── Entitlement helpers ──────────────────────────────────────────────────────
// A capability's entitlement status is derived from the owned product it maps to
// (ownedKey → OWNED_PRODUCTS[...].status). Capabilities with no ownedKey are
// treated as not-licensed when Salesforce aligns (native/integrates/data360/
// partial) and n/a when it is a genuine gap/discuss.
import { OWNED_PRODUCTS } from './entitlements.js';

export function capabilityEntitlement(cap) {
  if (cap.ownedKey && OWNED_PRODUCTS[cap.ownedKey]) {
    return { status: OWNED_PRODUCTS[cap.ownedKey].status, info: OWNED_PRODUCTS[cap.ownedKey] };
  }
  if (cap.alignment === 'gap' || cap.alignment === 'discuss') return { status: 'na', info: null };
  return { status: 'not-licensed', info: null };
}

// Count capabilities whose capability is an active Salesforce entitlement
// (owned / owned-expiring / separate-agreement) — the "already licensed" story.
export function licensedCount(rows = CAPABILITIES) {
  return rows.filter((c) => ['owned', 'owned-expiring', 'separate-agreement'].includes(capabilityEntitlement(c).status)).length;
}

// Capabilities that are BOTH owned AND overlap a third-party tool that could be
// retired — the sharpest "you already pay for this" rows.
export function retireCandidates(rows = CAPABILITIES) {
  return rows.filter((c) => {
    const ent = capabilityEntitlement(c).status;
    return ['owned', 'owned-expiring'].includes(ent) && Array.isArray(c.retires) && c.retires.length > 0;
  });
}
