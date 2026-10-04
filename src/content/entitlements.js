/**
 * Blackbaud's Salesforce entitlements — what they already OWN.
 *
 * SOURCE: "Blackbaud Asset Line Items" export (2026-10-04), Charleston management
 * org 00130000016hsaj. Vocabulary aligns with the August 2026 capabilities site's
 * evidence matrix (afisher-salesforce/blackbaud-capabilities, feature/heroku-clerk-auth):
 * "Confirmed by Asset Line Items" / "Separate Agreement" / "Not currently licensed".
 *
 * WHY THIS MATTERS: the exec framing (Chris Lindner, Russ Tallon) is that teams run
 * RFPs for capabilities Blackbaud ALREADY owns. Showing entitlement status turns the
 * conversation from "Salesforce could do this" into "you already pay for this — and
 * the third-party tool it overlaps is a candidate to retire." Russ's phrase:
 * "start inward first."
 *
 * STATUS values:
 *   owned            — active entitlement confirmed in the asset line items
 *   owned-expiring   — owned but the term ends in the near window (flag the date)
 *   separate-agreement — owned under a separate agreement (Slack, Tableau, MCE)
 *   not-licensed     — no SKU found; would be a net-new purchase
 *   na               — Salesforce doesn't play here (a genuine Gap); entitlement n/a
 *
 * NOTE: this is a point-in-time read for discussion, not a contract. The procurement
 * contract-by-contract review (Marissa / Allie) is the authoritative source; dates
 * here are the near-term ones surfaced in the entitlement export + exec transcript.
 */

export const ENTITLEMENT = {
  owned: {
    key: 'owned',
    label: 'Licensed',
    short: 'Licensed',
    description: 'Confirmed in Blackbaud’s active Salesforce entitlements — already paid for.',
    chip: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    chipDark: 'dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  'owned-expiring': {
    key: 'owned-expiring',
    label: 'Licensed · expiring',
    short: 'Expiring',
    description: 'Owned today, but the term ends soon — a renewal/migration decision point.',
    chip: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    chipDark: 'dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  'separate-agreement': {
    key: 'separate-agreement',
    label: 'Licensed · separate',
    short: 'Separate',
    description: 'Owned under a separate agreement (e.g. Slack, Tableau, Marketing Cloud).',
    chip: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
    chipDark: 'dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  'not-licensed': {
    key: 'not-licensed',
    label: 'Not licensed',
    short: 'Not licensed',
    description: 'No entitlement found — would be a net-new Salesforce purchase.',
    chip: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
    chipDark: 'dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  na: {
    key: 'na',
    label: '—',
    short: '—',
    description: 'Salesforce does not provide this capability; entitlement not applicable.',
    chip: 'bg-transparent text-th-faint border-surface-border',
    chipDark: '',
    dot: 'bg-th-faint',
  },
};

export function entitlementMeta(key) {
  return ENTITLEMENT[key] || ENTITLEMENT.na;
}

// The entitlement export's as-of date, and the standing caveat. Entitlements are
// a point-in-time read from the asset line items; the authoritative source is the
// procurement contract-by-contract review. Surfaced on every entitlement chip
// (tooltip) and as a footnote wherever entitlement status is summarized.
export const ENTITLEMENT_AS_OF = '4 Oct 2026';
export const ENTITLEMENT_DISCLAIMER =
  `Entitlement status is a point-in-time read of Blackbaud’s Salesforce asset line items as of ${ENTITLEMENT_AS_OF} ` +
  '(Charleston management org) — not a contract. Terms and dates are being validated in the procurement review; treat as directional.';

/**
 * The owned products behind each entitlement, from the asset line items. Keyed by
 * a short id referenced from capabilities.js `ownedKey`. `expiry` is the near-term
 * term end surfaced in the export / transcript (null when not near-term).
 */
export const OWNED_PRODUCTS = {
  'core-crm': {
    products: ['Sales & Service Cloud – Unlimited Edition (2,374 seats)', 'Salesforce Foundations'],
    status: 'owned',
    expiry: null,
  },
  agentforce: {
    products: ['Agentforce for Sales Add-on – Unlimited (750)', 'Agentforce for Service Add-on – Unlimited (550)'],
    status: 'owned',
    expiry: null,
  },
  'data-cloud': {
    products: ['Customer Data Cloud – Data Services (100K Credits)', 'Data Cloud Provisioning', 'Flex Credits (100k)'],
    status: 'owned',
    expiry: null,
  },
  cxi: {
    products: ['Customer Experience Intelligence – Unlimited Edition', 'Additional CXI Signals (100)'],
    status: 'owned',
    expiry: null,
  },
  'revenue-cloud': {
    products: ['Revenue Cloud Advanced – Unlimited (CPQ Upgrade)', 'Revenue Events Starter Pack', 'Revenue Events (50,000)'],
    status: 'owned',
    expiry: null,
  },
  cpq: {
    products: ['CPQ Plus – Unlimited Edition (SteelBrick)'],
    status: 'owned',
    expiry: null,
  },
  'service-voice': {
    products: ['Partner Contact Center with Amazon Connect – Unlimited (420)', 'Partner Contact Center – Additional AWS Services'],
    status: 'owned',
    expiry: null,
  },
  qualified: {
    products: ['Qualified Agentic Marketing Platform', 'Qualified SFDC Connector', 'Qualified Calendar & Email (260)'],
    status: 'owned',
    expiry: null,
  },
  tableau: {
    products: ['Tableau Cloud (Creator/Viewer)', 'Tableau Server (Creator/Explorer/Viewer)'],
    status: 'owned-expiring',
    expiry: '~Jan 2027',
  },
  mce: {
    products: ['Marketing Cloud Engagement – Corporate Edition'],
    status: 'owned-expiring',
    expiry: 'Dec 2026',
  },
  slack: {
    products: ['Slack Enterprise Grid (1,198)'],
    status: 'separate-agreement',
    expiry: null,
  },
  'mulesoft-dataloader': {
    products: ['MuleSoft – Dataloader.io Enterprise'],
    status: 'owned',
    expiry: null,
  },
  shield: {
    products: ['Salesforce Shield (LP1)', 'Sandbox (Full Copy)'],
    status: 'owned',
    expiry: null,
  },
};

export function ownedInfo(ownedKey) {
  return ownedKey ? OWNED_PRODUCTS[ownedKey] || null : null;
}
