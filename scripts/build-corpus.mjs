#!/usr/bin/env node
/**
 * Generate the data-derived corpus files for the Data 360 Data Library from the
 * site's own content modules — so the unstructured grounding stays in lockstep
 * with the structured records and the UI. Re-run whenever capabilities.js /
 * entitlements.js change.
 *
 *   node scripts/build-corpus.mjs
 *
 * Writes three files under datacloud/corpus/. The sanitized transcript summary
 * (rationalization-context-summary.md) is hand-authored, NOT generated here.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CAPABILITIES, capabilityEntitlement } from '../src/content/capabilities.js';
import { OWNED_PRODUCTS, ENTITLEMENT_AS_OF } from '../src/content/entitlements.js';
import { alignmentMeta } from '../src/content/alignment.js';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'datacloud', 'corpus');

// Sanitize text that goes into the agent-retrievable corpus: strip named
// individuals and candid internal asides from the SE-review / draft-note prose,
// so the agent can't surface them to Blackbaud. The site UI still shows the
// original text; only the Data Library copy is sanitized. Deterministic and
// auditable — extend NAMES if new ones appear in the source notes.
const NAMES = [
  /Chris Lindner/gi, /Christa Fulenwider/gi, /Christa/gi, /Russ Tallon/gi, /Russ/gi,
  /Ashley Berkowitz/gi, /Ashley/gi, /Drew Fisher/gi, /Drew/gi, /Bill Ford/gi,
  /Marissa/gi, /Allie/gi, /Chris Fuller/gi,
];
function sanitize(text) {
  if (!text) return text;
  let t = text;
  // Drop a possessive/attribution clause tied to a name, then the bare name.
  t = t.replace(/\b(Chris Lindner|Christa|Russ|Ashley|Drew)[’'`]s\b/gi, 'the account team’s');
  for (const re of NAMES) t = t.replace(re, 'the account team');
  // Soften candid quotes/asides that are internal-only.
  // Rewrite the whole attribution sentence so it reads cleanly without the name/quote.
  t = t.replace(
    /the account team[’'`]s reaction captured it:\s*"?\$300K saved right out of the box\.?"?/gi,
    'the saving is meaningful because the capability is already owned.'
  );
  t = t.replace(/"\$300K saved right out of the box\.?"/gi, 'a meaningful saving on already-owned capability');
  t = t.replace(/\bthe account team’s own note already splits it correctly\b/gi, 'the draft already splits it correctly');
  // Collapse any doubled "the account team the account team".
  t = t.replace(/(the account team)(\s+the account team)+/gi, '$1');
  return t;
}

// ─── 1. Tool inventory ────────────────────────────────────────────────────────
function toolInventory() {
  const byStream = { A2R: [], I2R: [] };
  for (const c of CAPABILITIES) for (const t of c.tools) byStream[c.valueStream].push({ tool: t, cap: c });
  let md = `# Blackbaud Tool Inventory (A2R + I2R)\n\n`;
  md += `Blackbaud's application inventory across the Awareness-to-Revenue (A2R) and Implement-to-Renew (I2R) value `;
  md += `streams, each tool mapped to the capability it serves and that capability's Salesforce alignment.\n\n`;
  for (const stream of ['A2R', 'I2R']) {
    md += `## ${stream === 'A2R' ? 'Awareness to Revenue (A2R)' : 'Implement to Renew (I2R)'}\n\n`;
    for (const { tool, cap } of byStream[stream]) {
      const a = alignmentMeta(cap.alignment);
      const retire = (cap.retires || []).includes(tool) ? ' Candidate to retire by activating owned Salesforce capability.' : '';
      md += `- **${tool}** — serves ${cap.domain} / ${cap.subCapability}. Salesforce alignment: ${a.label}.${retire}\n`;
    }
    md += '\n';
  }
  return md;
}

// ─── 2. Owned Salesforce entitlements ─────────────────────────────────────────
function entitlements() {
  let md = `# Blackbaud's Owned Salesforce Entitlements\n\n`;
  md += `Point-in-time read of Blackbaud's active Salesforce entitlements as of ${ENTITLEMENT_AS_OF} (Charleston `;
  md += `management org). For discussion, not a contract.\n\n`;
  const STATUS = { owned: 'Licensed (active)', 'owned-expiring': 'Licensed — expiring soon', 'separate-agreement': 'Licensed under a separate agreement' };
  for (const [key, info] of Object.entries(OWNED_PRODUCTS)) {
    md += `## ${key}\n`;
    md += `- Status: ${STATUS[info.status] || info.status}${info.expiry ? ` (term ends ${info.expiry})` : ''}\n`;
    md += `- Products / line items: ${info.products.join('; ')}\n\n`;
  }
  return md;
}

// ─── 3. Capability alignment narrative ────────────────────────────────────────
function capabilityMap() {
  let md = `# Salesforce Capability Alignment — Narrative\n\n`;
  md += `How Salesforce aligns to each capability in Blackbaud's inventory, on the six-way spectrum (Native, `;
  md += `Integrates, Data 360, Partial, Gap, Discuss). Alignment is a preliminary Salesforce point of view for `;
  md += `discussion, not a commitment, and may be too black-and-white.\n\n`;
  // group by domain
  const domains = [...new Set(CAPABILITIES.map((c) => c.domain))];
  for (const d of domains) {
    md += `## ${d}\n\n`;
    for (const c of CAPABILITIES.filter((x) => x.domain === d)) {
      const a = alignmentMeta(c.alignment);
      const ent = capabilityEntitlement(c);
      md += `### ${c.subCapability} (${c.valueStream})\n`;
      md += `- Tools in use: ${c.tools.join(', ')}\n`;
      md += `- Alignment: **${a.label}** — ${a.description}\n`;
      if (c.sfProducts?.length) md += `- Salesforce products: ${c.sfProducts.join(', ')}\n`;
      md += `- Entitlement: ${ent.status}${ent.info?.expiry ? ` (expires ${ent.info.expiry})` : ''}\n`;
      if (c.retires?.length) md += `- Could retire: ${c.retires.join(', ')}\n`;
      if (c.seReview) md += `- Salesforce SE view: ${sanitize(c.seReview)}\n`;
      md += '\n';
    }
  }
  return md;
}

writeFileSync(join(DIR, 'blackbaud-tool-inventory.md'), toolInventory());
writeFileSync(join(DIR, 'salesforce-entitlements.md'), entitlements());
writeFileSync(join(DIR, 'salesforce-capability-map.md'), capabilityMap());
console.log('Wrote 3 data-derived corpus files to datacloud/corpus/');
