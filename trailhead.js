/**
 * Trailhead learning integration (server-side).
 *
 * Where Salesforce aligns with an existing Blackbaud tool, the capability detail
 * page shows a "Learn this on Trailhead" rail of real Salesforce Modules/Projects,
 * so "you already own this" comes with an enablement path — the same pattern used
 * on the DISW Knowledge site.
 *
 * ARCHITECTURE — staged catalog, not a live pull (proven on DISW):
 *
 *   RUNTIME (request path): getRecommendations(slug) reads a committed,
 *   human-reviewed trailhead-catalog.json. Zero network, zero MCP, deterministic
 *   — the rail renders the same cards every time, which a live demo needs.
 *
 *   OFFLINE (scripts/refresh-trailhead.js only): the MCP client + ranking below
 *   re-pull from the public Trailhead MCP, anchor-gate the pool, and propose an
 *   updated catalog for a human to diff and commit. Never runs on page view.
 *
 * Why staged: the public MCP keyword index is adversarial — generic tokens
 * hijack queries, TRAIL/LEARNINGPATH types flood the pool, results are
 * nondeterministic between identical calls. Trailhead content changes slowly, so
 * a live pull buys little freshness while adding latency + demo flakiness.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const MCP_URL = process.env.TRAILHEAD_MCP_URL || 'https://mcp.trailhead.salesforce.com/mcp';
const MCP_TIMEOUT_MS = Number(process.env.TRAILHEAD_MCP_TIMEOUT_MS || 8000);

// Modules + Projects only — the actionable "do this next" content. TRAIL is
// excluded because the MCP ranks Trails above Modules and floods the pool.
const DEFAULT_TYPES = ['MODULE', 'PROJECT'];

/**
 * Per-capability search config. Keys MUST match the `trailheadSlug` values in
 * src/content/capabilities.js. Topical gating:
 *   require (optional) — a MANDATORY anchor; a card missing it is rejected.
 *   anchors — at least one must hit (title/description) to be on-topic.
 * A card qualifies only when it hits require AND one of anchors. `level` is a
 * display label applied to the staged card (NOT sent to the MCP — a `levels`
 * filter strips Foundational modules).
 */
export const CAPABILITY_QUERIES = {
  'crm-core': { query: 'Sales Cloud Service Cloud basics', require: 'cloud', anchors: ['sales cloud', 'service cloud', 'crm'], role: 'Administrator', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  forecasting: { query: 'Collaborative Forecasting Pipeline Inspection', require: 'forecast', anchors: ['forecast', 'pipeline'], role: 'Sales Professional', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'conversation-insights': { query: 'Einstein Conversation Insights', require: 'conversation', anchors: ['conversation', 'einstein'], role: 'Sales Professional', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'marketing-attribution': { query: 'Marketing Cloud Account Engagement attribution', require: 'engagement', anchors: ['account engagement', 'attribution', 'pardot'], role: 'Marketer', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'sales-engagement': { query: 'Sales Engagement cadences dialer', require: 'sales engagement', anchors: ['sales engagement', 'cadence'], role: 'Sales Professional', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'marketing-automation': { query: 'Marketing Cloud Account Engagement nurture', require: 'engagement', anchors: ['account engagement', 'marketing cloud', 'nurture'], role: 'Marketer', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  'agentforce-service': { query: 'Agentforce Service Agent setup', require: 'agentforce', anchors: ['agentforce', 'agent'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'lead-routing': { query: 'Lead assignment routing Salesforce', require: 'lead', anchors: ['lead', 'routing', 'assignment'], role: 'Administrator', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  scheduler: { query: 'Salesforce Scheduler appointments', require: 'scheduler', anchors: ['scheduler', 'appointment'], role: 'Administrator', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  enablement: { query: 'Salesforce Enablement in-app guidance', require: 'enablement', anchors: ['enablement', 'guidance'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'sales-navigator': { query: 'LinkedIn Sales Navigator Salesforce integration', require: 'linkedin', anchors: ['linkedin', 'sales navigator'], role: 'Sales Professional', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  data360: { query: 'Data Cloud Data 360 unification', anchors: ['data cloud', 'data 360'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'tableau-analytics': { query: 'Tableau CRM Analytics dashboards', require: 'analytics', anchors: ['analytics', 'tableau', 'dashboard'], role: 'Data Analyst', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'feedback-management': { query: 'Salesforce Feedback Management surveys', require: 'survey', anchors: ['survey', 'feedback'], role: 'Administrator', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  agentforce: { query: 'Agentforce agents low code', require: 'agentforce', anchors: ['agentforce', 'agent'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  mulesoft: { query: 'MuleSoft Anypoint integration', require: 'mulesoft', anchors: ['mulesoft', 'anypoint', 'api'], role: 'Architect', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'experience-cloud': { query: 'Experience Cloud sites communities', require: 'experience', anchors: ['experience cloud', 'community', 'site'], role: 'Administrator', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  'revenue-cloud': { query: 'Revenue Cloud CPQ quoting', require: 'revenue', anchors: ['revenue cloud', 'cpq', 'quote'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'einstein-search': { query: 'Einstein Search Salesforce', require: 'search', anchors: ['search', 'einstein'], role: 'Administrator', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  'service-cloud-voice': { query: 'Service Cloud Voice telephony', require: 'voice', anchors: ['voice', 'telephony', 'service cloud'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'workforce-engagement': { query: 'Service Cloud Workforce Engagement', require: 'workforce', anchors: ['workforce', 'engagement'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'customer-success': { query: 'Service Cloud customer success', require: 'service', anchors: ['service cloud', 'customer', 'success'], role: 'Administrator', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  'devops-center': { query: 'Salesforce DevOps Center', require: 'devops', anchors: ['devops', 'release', 'deployment'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  'incentive-compensation': { query: 'Incentive Compensation Management Spiff', anchors: ['incentive', 'commission', 'compensation', 'spiff'], role: 'Sales Professional', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
  knowledge: { query: 'Salesforce Knowledge articles Service Cloud', require: 'knowledge', anchors: ['knowledge'], role: 'Administrator', level: 'Foundational', types: DEFAULT_TYPES, max: 3 },
  'privacy-center': { query: 'Salesforce Privacy Center consent', require: 'privacy', anchors: ['privacy', 'consent'], role: 'Administrator', level: 'Intermediate', types: DEFAULT_TYPES, max: 3 },
};

// ===========================================================================
// RUNTIME SURFACE — reads the committed catalog. No network. No MCP.
// ===========================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, 'trailhead-catalog.json');

let CATALOG = { capabilities: {} };
try {
  CATALOG = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
} catch (err) {
  console.warn(`[Trailhead] could not load ${CATALOG_PATH} (rail will be empty):`, err.message);
}

export const TRAILHEAD_SLUGS = Object.keys(CAPABILITY_QUERIES);

export function getRecommendations(slug) {
  if (!CAPABILITY_QUERIES[slug]) {
    return { slug, items: [], source: 'staged', degraded: false, reason: 'unknown-capability' };
  }
  const entry = (CATALOG.capabilities && CATALOG.capabilities[slug]) || {};
  const items = Array.isArray(entry.items) ? entry.items : [];
  return { slug, items, source: 'staged', degraded: items.length === 0 };
}

// ===========================================================================
// OFFLINE SURFACE — live MCP client + ranking. Imported ONLY by
// scripts/refresh-trailhead.js. node-fetch is imported lazily so loading this
// module (which the BFF does) never opens a socket.
// ===========================================================================

let rpcId = 0;

async function mcpRpc(method, params, sessionId) {
  const { default: fetch } = await import('node-fetch');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MCP_TIMEOUT_MS);
  try {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (sessionId) headers['Mcp-Session-Id'] = sessionId;

    const resp = await fetch(MCP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
      signal: controller.signal,
    });

    const newSession = resp.headers.get('mcp-session-id') || sessionId;
    const ct = resp.headers.get('content-type') || '';
    const raw = await resp.text();

    if (!resp.ok) {
      throw new Error(`MCP ${method} HTTP ${resp.status}: ${raw.slice(0, 200)}`);
    }

    let envelope;
    if (ct.includes('text/event-stream')) {
      const dataLines = raw
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim())
        .filter(Boolean);
      envelope = JSON.parse(dataLines[dataLines.length - 1] || '');
    } else {
      envelope = JSON.parse(raw);
    }

    if (envelope.error) {
      throw new Error(`MCP ${method} error: ${envelope.error.message || JSON.stringify(envelope.error)}`);
    }
    return { result: envelope.result, sessionId: newSession };
  } finally {
    clearTimeout(timer);
  }
}

async function contentSearch({ query, role, types }) {
  const init = await mcpRpc(
    'initialize',
    { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'bb-tooling-site', version: '1.0.0' } },
    null
  );
  const sessionId = init.sessionId;
  try {
    await mcpRpc('notifications/initialized', {}, sessionId);
  } catch {
    /* non-fatal */
  }

  const args = { query, first: 12 };
  if (role) args.roles = [role];
  if (types && types.length) args.types = types;

  const call = await mcpRpc('tools/call', { name: 'content_search', arguments: args }, sessionId);
  return call.result;
}

const TYPE_LABELS = {
  LEARNINGPATH: 'Trail',
  TRAIL: 'Trail',
  MODULE: 'Module',
  PROJECT: 'Project',
  SUPERBADGE: 'Superbadge',
  CREDENTIAL: 'Credential',
};

function labelForType(rawType, url) {
  const key = String(rawType || '').toUpperCase();
  if (TYPE_LABELS[key]) return TYPE_LABELS[key];
  if (/\/trails?\//.test(url || '')) return 'Trail';
  if (/\/modules?\//.test(url || '')) return 'Module';
  if (/\/projects?\//.test(url || '')) return 'Project';
  return 'Trailhead';
}

function rankStructured(results, cfg, max) {
  const terms = String(cfg.query || '').toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const anchors = (cfg.anchors || []).map((a) => a.toLowerCase());
  const require = cfg.require ? String(cfg.require).toLowerCase() : null;

  const scored = results.map((r) => {
    const title = String(r.title || '').toLowerCase();
    const desc = String(r.description || '').toLowerCase();
    const hay = `${title} ${desc}`;
    const termHits = terms.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
    const label = labelForType(r.type, r.url);
    const minutes = Number(r.minuteTotal) || 0;
    const brevity = minutes > 0 ? Math.max(0, 1 - minutes / 240) : 0.3;
    const typeBoost = label === 'Module' || label === 'Project' ? 0.5 : 0;

    const meetsRequire = !require || hay.includes(require);
    const anchorInTitle = anchors.some((a) => title.includes(a));
    const anchorInHay = anchors.some((a) => hay.includes(a));
    const relevance = !meetsRequire ? 0 : anchorInTitle ? 10 : anchorInHay ? 5 : 0;

    return { r, label, minutes, relevance, score: relevance + termHits * 2 + brevity + typeBoost };
  });

  scored.sort((a, b) => b.score - a.score);

  const toCard = ({ r, label, minutes }) => ({
    title: (r.title || '').trim(),
    url: (r.url || '').trim(),
    synopsis: (r.description || `Trailhead learning for ${cfg.query}.`).slice(0, 200),
    type: label,
    level: cfg.level,
    minutes: minutes || null,
  });

  const usable = (s) => {
    const url = (s.r.url || '').trim();
    return url && /trailhead\.salesforce\.com/.test(url) && (s.r.title || '').trim();
  };

  const relevant = scored.filter((s) => s.relevance > 0 && usable(s));

  const cards = [];
  const seen = new Set();
  for (const s of relevant) {
    if (cards.length >= max) break;
    const url = (s.r.url || '').trim();
    if (seen.has(url)) continue;
    seen.add(url);
    cards.push(toCard(s));
  }
  return cards;
}

function parseCards(mcpResult, cfg, max) {
  const structured = mcpResult && mcpResult.structuredContent;
  if (structured && Array.isArray(structured.results) && structured.results.length) {
    return rankStructured(structured.results, cfg, max);
  }
  return [];
}

export async function buildCatalogEntry(slug) {
  const cfg = CAPABILITY_QUERIES[slug];
  if (!cfg) throw new Error(`unknown capability: ${slug}`);
  const result = await contentSearch(cfg);
  const items = parseCards(result, cfg, cfg.max);
  return { query: cfg.query, items };
}
