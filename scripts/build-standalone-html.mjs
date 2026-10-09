/**
 * build-standalone-html.mjs — emit a single, fully self-contained HTML file of the
 * Blackbaud × Salesforce capability-alignment canvas for sharing with Enterprise
 * Architecture.
 *
 * Self-contained by design: NO external scripts or stylesheets (no CDN, no fonts
 * fetched), NO Postgres/Salesforce write-back, NO live Agent, NO live Trailhead
 * MCP. All capability / alignment / entitlement data is baked in from the site's
 * own content modules (capabilities.js, alignment.js, entitlements.js) so it stays
 * faithful to the live site. Interactivity (view tabs, table filters, the
 * tools∩coverage Venn, dot tooltips, capability expand/collapse, light/dark) is
 * hand-written vanilla JS embedded inline.
 *
 * NOTE for this shared copy: "Christa's draft analysis" is relabeled
 * "Google Gemini notes" (the draft was Gemini-assisted; this file goes to EA).
 *
 * Run:  node scripts/build-standalone-html.mjs
 * Reqs: regenerate the data snapshot first if content changed —
 *   node --input-type=module -e "...dump capabilities to $TMPDIR/bb_data.json..."
 *   (see the committed snapshot path logic below; falls back to re-deriving).
 * Out:  standalone/blackbaud-capability-alignment.html
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CAPABILITIES, capabilityEntitlement, TOOL_COUNT, licensedCount, consolidationCandidates, entitlementsOwnedCount, toolsCoveredCount } from '../src/content/capabilities.js';
import { ALIGNMENT, ALIGNMENT_ORDER, ALIGNMENT_DISCLAIMER } from '../src/content/alignment.js';
import { ENTITLEMENT, ENTITLEMENT_AS_OF, ENTITLEMENT_DISCLAIMER } from '../src/content/entitlements.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── Lifecycle stage map (kept in sync with src/pages/Lifecycle.jsx) ──
const CLM_STAGE = {
  'prospecting-sales-intelligence': 'acquire', 'website-chat-conversational': 'acquire',
  'lead-routing-matching': 'acquire', 'meeting-scheduling': 'acquire', 'sales-engagement-dialer': 'acquire',
  'crm-system-of-record': 'onboard', 'revenue-cloud-cpq': 'onboard', 'e-signature': 'onboard',
  'ipaas-integration': 'onboard', 'workflow-automation-grid': 'onboard', 'ai-agent-chatbot-builder': 'onboard',
  'contact-center-telephony': 'serve', 'wfm-scheduling': 'serve', 'prm-partner-portal': 'serve',
  'dcx-scheduling': 'serve', 'online-community': 'serve',
  'revenue-forecasting': 'grow', 'renewal-reporting': 'grow', 'product-analytics': 'grow', 'sales-commission': 'grow',
};
const STAGES = [
  { key: 'acquire', label: 'Acquire', blurb: 'Find, attract, and win' },
  { key: 'onboard', label: 'Onboard', blurb: 'Quote, close, and stand up' },
  { key: 'serve', label: 'Serve', blurb: 'Support and operate' },
  { key: 'grow', label: 'Grow', blurb: 'Renew, expand, and reward' },
];

// This shared copy relabels the draft analysis "Google Gemini" (it was
// Gemini-assisted; the file goes to EA). Replace the "Christa:" attribution that
// prefixes each draftNote, and defensively any other mention of the name, so no
// individual is named anywhere in the shared artifact.
const degemini = (s) =>
  String(s || '')
    .replace(/^\s*Christa\s*:\s*/i, 'Google Gemini: ')
    .replace(/\bChrista\b/g, 'Google Gemini');

// Build the compact data payload the inline JS will consume.
const caps = CAPABILITIES.map((c) => {
  const ent = capabilityEntitlement(c);
  return {
    id: c.id, vs: c.valueStream, domain: c.domain, name: c.subCapability,
    tools: c.tools, users: c.primaryUsers, alignment: c.alignment,
    sf: c.sfProducts || [], gemini: degemini(c.draftNote), seReview: degemini(c.seReview),
    prompts: (c.discussionPrompts || []).map(degemini), overlaps: c.overlaps || [],
    ent: ent.status, entExpiry: ent.info?.expiry || null, entProducts: ent.info?.products || [],
    clm: CLM_STAGE[c.id] || null,
  };
});

const DATA = {
  caps,
  alignment: ALIGNMENT,            // key -> {label, dot(tailwind, unused), order, description, ...}
  alignmentOrder: ALIGNMENT_ORDER,
  alignmentDisclaimer: degemini(ALIGNMENT_DISCLAIMER),
  entitlement: ENTITLEMENT,
  entAsOf: ENTITLEMENT_AS_OF,
  entDisclaimer: degemini(ENTITLEMENT_DISCLAIMER),
  stages: STAGES,
  stats: {
    tools: TOOL_COUNT, caps: CAPABILITIES.length, owned: entitlementsOwnedCount(),
    licensed: licensedCount(), consolidation: consolidationCandidates().length, covered: toolsCoveredCount(),
  },
  domains: [...new Set(CAPABILITIES.map((c) => c.domain))],
};

// Alignment → hex (standalone can't use Tailwind). Mirrors the app palette.
const ALIGN_HEX = {
  native: '#10b981', integrates: '#0ea5e9', data360: '#8b5cf6',
  partial: '#f59e0b', gap: '#94a3b8', discuss: '#f43f5e',
};
const ENT_HEX = {
  owned: '#10b981', 'owned-expiring': '#f59e0b', 'separate-agreement': '#0ea5e9',
  'not-licensed': '#94a3b8', na: '#94a3b8',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blackbaud × Salesforce — Capability Alignment</title>
<style>
:root{
  --bg:#0a0f1a; --card:#111827; --cardh:#1a2234; --border:#1e293b; --borderl:#334155;
  --accent:#8da2e8; --header:#0d1321;
  --t1:#e5e9f2; --t2:#aab4c7; --t3:#7a8699; --t4:#5b6678;
}
html[data-theme="light"]{
  --bg:#f8fafc; --card:#ffffff; --cardh:#f1f5f9; --border:#e2e8f0; --borderl:#cbd5e1;
  --accent:#2c3e8c; --header:#f1f5f9;
  --t1:#0f172a; --t2:#334155; --t3:#64748b; --t4:#94a3b8;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--t2);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}
h1,h2,h3{color:var(--t1);margin:0}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px 60px}
header{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--header) 90%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.hrow{max-width:1180px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;gap:16px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px}
.logo{width:30px;height:30px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px}
.brand b{color:var(--t1);font-size:13px;display:block;line-height:1.2}
.brand span{color:var(--t3);font-size:10px}
.tabs{display:flex;gap:4px;flex-wrap:wrap}
.tab{padding:6px 12px;border-radius:7px;font-size:13px;color:var(--t3);background:none;border:1px solid transparent;cursor:pointer}
.tab:hover{color:var(--t2);background:var(--cardh)}
.tab.active{color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,transparent);font-weight:600}
.hbtn{background:none;border:1px solid var(--border);color:var(--t3);border-radius:7px;padding:6px 10px;cursor:pointer;font-size:13px}
.hbtn:hover{color:var(--t2);border-color:var(--borderl)}
.view{display:none;padding-top:22px}
.view.active{display:block}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px}
.card .hd{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.card .bd{padding:18px}
.muted{color:var(--t3)} .faint{color:var(--t4)}
.chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;border:1px solid;padding:2px 9px;font-size:11px;font-weight:600;line-height:1.6}
.dot{width:9px;height:9px;border-radius:999px;display:inline-block;flex:none}
.pill{font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t4);border:1px solid var(--border);border-radius:4px;padding:2px 6px}
.hero{position:relative;overflow:hidden;border-radius:14px;border:1px solid var(--border);background:var(--card);padding:30px}
.kicker{font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.hero h1{font-size:24px;line-height:1.25;max-width:760px;margin-bottom:12px}
.hero p{color:var(--t2);max-width:760px}
.banner{display:flex;gap:12px;border-radius:10px;padding:12px 14px;margin-top:16px}
.banner.amber{border:1px solid #f59e0b40;background:#f59e0b1a}
.banner.green{border:1px solid #10b98140;background:#10b9811a}
.disc{color:var(--t3);font-size:11px;font-style:italic;margin-top:8px}
.row{display:flex;gap:16px;align-items:stretch;flex-wrap:wrap}
.rail{display:flex;flex-direction:column;gap:12px;width:210px;flex:none}
@media(max-width:820px){.rail{flex-direction:row;flex-wrap:wrap;width:100%}}
.stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px}
.stat .n{font-size:30px;font-weight:800;color:var(--accent);line-height:1}
.stat .l{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--t4);margin-top:6px}
.grid-heat{display:grid;grid-template-columns:200px 1fr 1fr;gap:8px;align-items:stretch;min-width:560px}
.lane-h{border-radius:7px;padding:4px 12px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--t4)}
.cell{display:flex;flex-wrap:wrap;gap:8px;padding:8px 12px;border-radius:7px;min-height:38px;align-content:flex-start}
.hdot{width:14px;height:14px;border-radius:999px;border:1px solid rgba(0,0,0,.1);cursor:pointer;position:relative;transition:transform .1s}
.hdot:hover{transform:scale(1.25)}
.tip{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:6px;z-index:40;display:none;width:max-content;max-width:230px}
.hdot:hover .tip,.vdot:hover .tip{display:block}
.tip .box{background:var(--card);border:1px solid var(--border);border-radius:7px;padding:8px 10px;box-shadow:0 8px 24px rgba(0,0,0,.3);text-align:left}
.tip b{color:var(--t1);font-size:11px}
.selrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
select,input[type=search]{background:var(--card);border:1px solid var(--border);color:var(--t2);border-radius:7px;padding:6px 9px;font-size:12px}
table{width:100%;border-collapse:collapse}
thead th{text-align:left;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--t4);padding:10px 12px;border-bottom:1px solid var(--border);background:var(--header);position:sticky;top:52px}
tbody td{padding:11px 12px;border-bottom:1px solid var(--border);vertical-align:top;font-size:13px}
tbody tr{cursor:pointer}
tbody tr:hover{background:var(--cardh)}
tr.detail>td{background:var(--cardh);cursor:default}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:720px){.detail-grid{grid-template-columns:1fr}.detail-table thead{display:none}}
.note{background:var(--card);border:1px solid var(--border);border-radius:9px;padding:14px}
.note .t{font-size:12px;font-weight:700;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:6px}
.venn-wrap{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
.legend{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:11px;color:var(--t3);border:1px solid var(--border);background:var(--card);border-radius:10px;padding:10px 16px;margin-bottom:16px}
.stage-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:1100px){.stage-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:620px){.stage-grid{grid-template-columns:1fr}}
.capcard{width:100%;text-align:left;border:1px solid var(--border);background:var(--cardh);border-radius:9px;padding:12px;cursor:pointer}
.capcard.native{border-color:#10b98166;background:#10b9810f}
.capcard:hover{border-color:color-mix(in srgb,var(--accent) 50%,transparent)}
.capcard .nm{font-size:13px;font-weight:700;color:var(--t1);line-height:1.3}
.toolline{display:flex;gap:6px;align-items:flex-start;font-size:11px;color:var(--t3);margin-top:8px}
.footer{margin-top:30px;padding-top:16px;border-top:1px solid var(--border);font-size:11px;color:var(--t4);text-align:center}
.secttitle{margin:4px 0 2px;font-size:19px}
.sechd{margin-bottom:4px}
details.cap>summary{display:none}
.flex{display:flex} .wrap-f{flex-wrap:wrap} .gap8{gap:8px} .gap12{gap:12px} .mt8{margin-top:8px} .mt16{margin-top:16px} .mb16{margin-bottom:16px}
.center{display:flex;align-items:center}
</style>
</head>
<body>
<header>
  <div class="hrow">
    <div class="brand">
      <div class="logo">◆</div>
      <div><b>Blackbaud × Salesforce</b><span>Capability Alignment · Discussion Canvas</span></div>
    </div>
    <nav class="tabs" id="tabs">
      <button class="tab active" data-view="overview">Overview</button>
      <button class="tab" data-view="map">Capability Map</button>
      <button class="tab" data-view="lifecycle">Lifecycle Map</button>
      <button class="tab" data-view="a2r">Awareness → Revenue</button>
      <button class="tab" data-view="i2r">Implement → Renew</button>
    </nav>
    <button class="hbtn" id="theme">◐ Theme</button>
  </div>
</header>
<div class="wrap">
  <section class="view active" id="view-overview"></section>
  <section class="view" id="view-map"></section>
  <section class="view" id="view-lifecycle"></section>
  <section class="view" id="view-a2r"></section>
  <section class="view" id="view-i2r"></section>
  <div class="footer" id="footer"></div>
</div>
<script>
const DATA = ${JSON.stringify(DATA)};
const ALIGN_HEX = ${JSON.stringify(ALIGN_HEX)};
const ENT_HEX = ${JSON.stringify(ENT_HEX)};
// Venn "Salesforce covers" = native/integrates/data360/PARTIAL (matches the live
// site's toolsCoveredCount so the Venn reconciles with the Overview's 65 tile).
const COVERED = new Set(['native','integrates','data360','partial']);
// Lifecycle scope is tighter — only the capabilities drawn on the CLM map.
const LIFECYCLE_SCOPE = new Set(['native','integrates','data360']);
const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const alignMeta = k => DATA.alignment[k] || DATA.alignment.discuss;
const entMeta = k => DATA.entitlement[k] || null;
function alignChip(k){const m=alignMeta(k);return '<span class="chip" style="color:'+ALIGN_HEX[k]+';border-color:'+ALIGN_HEX[k]+'55;background:'+ALIGN_HEX[k]+'1a" title="'+esc(m.description||'')+'"><span class="dot" style="background:'+ALIGN_HEX[k]+'"></span>'+esc(m.label)+'</span>';}
function entChip(st,expiry){if(!st||st==='na')return '';const m=entMeta(st);if(!m)return '';let lbl=m.label;if(st==='owned-expiring'&&expiry)lbl='Licensed · exp. '+expiry;return '<span class="chip" style="color:'+ENT_HEX[st]+';border-color:'+ENT_HEX[st]+'55;background:'+ENT_HEX[st]+'1a">'+esc(lbl)+'</span>';}
function vsTag(vs){return '<span class="pill" title="'+(vs==='A2R'?'Awareness → Revenue':'Implement → Renew')+'">'+vs+'</span>';}

/* ---------- OVERVIEW ---------- */
function renderOverview(){
  const s=DATA.stats;
  const byDomain={};
  DATA.caps.forEach(c=>{(byDomain[c.domain]=byDomain[c.domain]||{A2R:[],I2R:[]})[c.vs].push(c);});
  const order=DATA.alignmentOrder;
  const sortDots=a=>[...a].sort((x,y)=>order.indexOf(x.alignment)-order.indexOf(y.alignment));
  const cell=(caps,tint)=>{if(!caps.length)return '<div class="cell" style="background:'+tint+'"></div>';
    return '<div class="cell" style="background:'+tint+'">'+sortDots(caps).map(c=>{
      const m=alignMeta(c.alignment);
      return '<span class="hdot" style="background:'+ALIGN_HEX[c.alignment]+'" onclick="openCap(\\''+c.id+'\\')"><span class="tip"><span class="box"><b>'+esc(c.name)+'</b><br><span style="font-size:10px;color:var(--t2)">'+esc(m.label)+'</span><br><span style="font-size:10px;color:var(--t3)">'+esc(c.tools.join(', '))+'</span></span></span></span>';
    }).join('')+'</div>';};
  const rows=DATA.domains.map(d=>'<div class="grid-heat" style="margin-bottom:6px"><div class="center" style="font-size:12px;font-weight:600;color:var(--t2);padding-right:4px">'+esc(d)+'</div>'+cell(byDomain[d].A2R,'color-mix(in srgb,var(--cardh) 70%,transparent)')+cell(byDomain[d].I2R,'color-mix(in srgb,var(--accent) 4%,transparent)')+'</div>').join('');
  const dist=DATA.alignmentOrder.map(k=>{const m=alignMeta(k);const n=DATA.caps.filter(c=>c.alignment===k).length;return '<div class="chip" style="border-color:var(--border);color:var(--t2)"><span class="dot" style="background:'+ALIGN_HEX[k]+'"></span><b style="color:var(--t1)">'+n+'</b> '+esc(m.label)+'</div>';}).join(' ');
  return \`
  <div class="hero">
    <div class="kicker">◆ Application Rationalization · Discussion Canvas</div>
    <h1>Where does Salesforce already cover what Blackbaud runs today?</h1>
    <p>Blackbaud operates <b>\${s.tools} tools</b> across the Awareness-to-Revenue and Implement-to-Renew value streams — and Salesforce already overlaps <b>\${s.covered} of them</b>, the consolidation surface for taking the inventory from \${s.tools} toward a smaller number. This canvas maps each capability against the Salesforce platform Blackbaud already invests in — a structured place for Enterprise Architecture and the Value Stream Leads to react, correct, and decide what to explore. The anchor question: <i>which of these do you already own?</i></p>
    <div class="banner amber"><div>⚠</div><div><b style="color:#f59e0b">Read this first — talking points, not conclusions.</b><br><span class="muted" style="font-size:13px">\${esc(DATA.alignmentDisclaimer)}</span></div></div>
    <div class="banner green"><div>✔</div><div><b style="color:#10b981">Start inward first — build the platform you already own.</b><br><span class="muted" style="font-size:13px">Blackbaud already owns <b>\${s.owned}</b> Salesforce entitlements, covering <b>\${s.licensed}</b> of the capabilities on this map — and <b>\${s.consolidation}</b> overlap a third-party tool Blackbaud also runs, so the work could be consolidated onto the platform you already own and cut context-switching. Consolidation is a platform-strategy discussion, not a directive to retire tools — contract terms and prior investment decide what actually moves.</span><div class="disc">\${esc(DATA.entDisclaimer)}</div></div></div>
  </div>
  <div class="row mt16" style="align-items:stretch">
    <div style="flex:1;min-width:0">
      <div class="card">
        <div class="hd"><div><h2 style="font-size:14px">Alignment at a glance</h2><div class="muted" style="font-size:12px;margin-top:2px">Each row is a capability domain; each dot is one capability, colored by its draft alignment. The two lanes split the value streams — hover a dot for detail, click to open its discussion.</div></div></div>
        <div class="bd" style="overflow-x:auto">
          <div style="min-width:560px;max-width:760px">
            <div class="grid-heat" style="margin-bottom:8px"><div></div><div class="lane-h" style="background:color-mix(in srgb,var(--cardh) 80%,transparent)">Awareness → Revenue</div><div class="lane-h" style="background:color-mix(in srgb,var(--accent) 7%,transparent)">Implement → Renew</div></div>
            \${rows}
          </div>
        </div>
      </div>
    </div>
    <div class="rail">
      <div class="stat"><div class="n">\${s.tools}</div><div class="l">Tools in scope</div></div>
      <div class="stat"><div class="n">\${s.covered}</div><div class="l">Tools Salesforce overlaps</div></div>
      <div class="stat"><div class="n">\${s.caps}</div><div class="l">Capability areas assessed</div></div>
      <div class="stat"><div class="n">\${s.owned}</div><div class="l">Salesforce entitlements owned</div></div>
      <div class="stat"><div class="n">\${s.licensed}</div><div class="l">Capabilities already covered</div></div>
      <div class="stat"><div class="n">\${s.consolidation}</div><div class="l">Overlap · consolidation candidates</div></div>
    </div>
  </div>
  <div class="card mt16"><div class="hd"><h2 style="font-size:14px">Draft alignment distribution</h2><span class="faint" style="font-size:11px">preliminary — for discussion</span></div><div class="bd"><div class="flex wrap-f gap8">\${dist}</div></div></div>
  \`;
}

/* ---------- CAPABILITY TABLE (shared by map / a2r / i2r) ---------- */
function capRowHtml(c){
  return '<tr data-id="'+c.id+'" onclick="toggleDetail(this,\\''+c.id+'\\')">'
    +'<td><div style="font-weight:600;color:var(--t1)">'+esc(c.name)+'</div><div class="faint" style="font-size:11px">'+esc(c.domain)+'</div></td>'
    +'<td class="muted">'+esc(c.tools.join(', '))+'</td>'
    +'<td>'+vsTag(c.vs)+'</td>'
    +'<td>'+alignChip(c.alignment)+'</td>'
    +'<td>'+(c.ent==='na'?'<span class="faint">—</span>':entChip(c.ent,c.entExpiry))+'</td>'
    +'<td class="muted" style="font-size:12px;max-width:220px">'+esc(c.sf.slice(0,2).join(', ')||'—')+(c.sf.length>2?' <span class="faint">+'+(c.sf.length-2)+'</span>':'')+'</td>'
    +'<td class="faint">▸</td></tr>';
}
function detailHtml(c){
  const prompts=c.prompts.length?'<div class="note mt8"><div class="t">Questions to put to the room</div><ul style="margin:0;padding-left:18px;color:var(--t3)">'+c.prompts.map(p=>'<li style="margin:4px 0">'+esc(p)+'</li>').join('')+'</ul></div>':'';
  const entLine=c.entProducts&&c.entProducts.length?'<div class="muted" style="font-size:12px;margin-top:10px"><b style="color:var(--t2)">Licensed via:</b> '+esc(c.entProducts.join(', '))+(c.entExpiry?' <span style="color:#f59e0b">· term ends '+esc(c.entExpiry)+'</span>':'')+'</div>':'';
  return '<tr class="detail"><td colspan="7"><div style="padding:4px 2px 8px">'
    +'<div class="flex wrap-f gap12 mb16" style="font-size:12px"><div><span class="faint" style="font-size:10px;text-transform:uppercase;letter-spacing:.05em">Primary users</span><br><span class="muted">'+esc(c.users)+'</span></div>'
    +'<div><span class="faint" style="font-size:10px;text-transform:uppercase;letter-spacing:.05em">Salesforce</span><br><span class="muted">'+esc(c.sf.join(', ')||'— (no direct SF product)')+'</span></div>'
    +'<div><span class="faint" style="font-size:10px;text-transform:uppercase;letter-spacing:.05em">Alignment means</span><br><span class="muted">'+esc(alignMeta(c.alignment).description||'')+'</span></div></div>'
    +entLine
    +'<div class="detail-grid mt16">'
    +'<div class="note"><div class="t">📝 Google Gemini notes</div><div class="muted" style="font-size:13px">'+esc(c.gemini)+'</div><div class="disc">Shared quickly (Gemini-assisted); a starting point, not a validated conclusion.</div></div>'
    +'<div class="note" style="border-color:color-mix(in srgb,var(--accent) 30%,var(--border))"><div class="t" style="color:var(--accent)">✓ Salesforce SE review</div><div class="muted" style="font-size:13px">'+esc(c.seReview)+'</div></div>'
    +'</div>'+prompts+'</div></td></tr>';
}
function renderTable(targetId,rowsData,opts){
  opts=opts||{};
  const lockStream=opts.lockStream||null;
  const id='tbl_'+targetId;
  const streamSel=lockStream?'':'<select id="'+id+'_s"><option value="all">All value streams</option><option value="A2R">Awareness → Revenue</option><option value="I2R">Implement → Renew</option></select>';
  const alignOpts=DATA.alignmentOrder.map(k=>'<option value="'+k+'">'+esc(alignMeta(k).label)+'</option>').join('');
  const domOpts=DATA.domains.map(d=>'<option value="'+esc(d)+'">'+esc(d)+'</option>').join('');
  const venn=opts.venn?'<div class="card mb16" id="'+id+'_venn"><div class="hd"><div><h2 style="font-size:14px">Tools you run ∩ Salesforce covers</h2><div class="muted" style="font-size:12px;margin-top:2px">Recomputes as you filter the table below — the overlap is where the consolidation story lives.</div></div></div><div class="bd" id="'+id+'_vennbody"></div></div>':'';
  return venn+'<div class="card"><div class="hd"><div class="selrow">'+streamSel
    +'<select id="'+id+'_a"><option value="all">All alignment</option>'+alignOpts+'</select>'
    +'<select id="'+id+'_d"><option value="all">All domains</option>'+domOpts+'</select>'
    +'<select id="'+id+'_e"><option value="all">All entitlements</option><option value="licensed">Already licensed</option><option value="overlap">Owned · overlaps a tool</option></select>'
    +'<input type="search" id="'+id+'_q" placeholder="Search tools, capabilities…" style="width:220px">'
    +'</div></div><div style="overflow-x:auto"><table><thead><tr><th>Capability</th><th>Tool(s)</th><th>Stream</th><th>Alignment</th><th>Entitlement</th><th>Salesforce</th><th></th></tr></thead><tbody id="'+id+'_body"></tbody></table></div><div style="padding:10px 14px;border-top:1px solid var(--border);font-size:11px" class="faint" id="'+id+'_count"></div></div>';
}
function wireTable(targetId,rowsData,opts){
  opts=opts||{};const lockStream=opts.lockStream||null;const id='tbl_'+targetId;
  const $=x=>document.getElementById(id+x);
  function filtered(){
    const q=($('_q').value||'').trim().toLowerCase();
    const st=lockStream||($('_s')?$('_s').value:'all');
    const a=$('_a').value,d=$('_d').value,e=$('_e').value;
    return rowsData.filter(c=>(lockStream?true:st==='all'||c.vs===st))
      .filter(c=>a==='all'||c.alignment===a).filter(c=>d==='all'||c.domain===d)
      .filter(c=>{if(e==='all')return true;if(e==='licensed')return ['owned','owned-expiring','separate-agreement'].includes(c.ent);if(e==='overlap')return ['owned','owned-expiring'].includes(c.ent)&&c.overlaps.length;return true;})
      .filter(c=>{if(!q)return true;return [c.name,c.domain,...c.tools,...c.sf].join(' ').toLowerCase().includes(q);})
      .sort((x,y)=>x.domain!==y.domain?x.domain.localeCompare(y.domain):DATA.alignmentOrder.indexOf(x.alignment)-DATA.alignmentOrder.indexOf(y.alignment));
  }
  function draw(){
    const f=filtered();
    $('_body').innerHTML=f.length?f.map(capRowHtml).join(''):'<tr><td colspan="7" style="text-align:center;padding:34px" class="muted">No capabilities match these filters.</td></tr>';
    $('_count').textContent=f.length+' capabilit'+(f.length===1?'y':'ies')+' shown';
    if(opts.venn)drawVenn(id,f);
  }
  ['_s','_a','_d','_e','_q'].forEach(k=>{const el=$(k);if(el)el.addEventListener('input',draw);});
  draw();
}
function drawVenn(id,rows){
  const seen=new Map();
  rows.forEach(c=>{const cov=COVERED.has(c.alignment);const owned=c.ent==='owned'||c.ent==='owned-expiring';const os=new Set(c.overlaps);
    c.tools.forEach(t=>{const p=seen.get(t)||{cov:false,cand:false};p.cov=p.cov||cov;p.cand=p.cand||(owned&&os.has(t));seen.set(t,p);});});
  let covered=0,cand=0;seen.forEach(v=>{if(v.cov)covered++;if(v.cand)cand++;});
  const total=seen.size,aOnly=total-covered;
  const W=420,H=190,maxR=74,minR=14;
  const rFor=n=>total===0?minR:Math.max(minR,Math.min(maxR,maxR*Math.sqrt(n/total)));
  const rA=rFor(total),rB=covered===0?3:rFor(covered);
  const share=total===0?0:covered/total;const cxA=150,cy=H/2;
  const dist=(rA+rB)*(1-0.72*share);const cxB=cxA+Math.max(dist,Math.abs(rA-rB)+6);
  let svg='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:420px">';
  if(total===0){svg+='<text x="'+(W/2)+'" y="'+(H/2)+'" text-anchor="middle" fill="var(--t4)" font-size="13">No tools match these filters.</text>';}
  else{
    svg+='<circle cx="'+cxA+'" cy="'+cy+'" r="'+rA+'" fill="rgba(148,163,184,.18)" stroke="rgba(100,116,139,.55)" stroke-width="1.5"/>';
    if(covered>0)svg+='<circle cx="'+cxB+'" cy="'+cy+'" r="'+rB+'" fill="rgba(16,185,129,.22)" stroke="rgba(16,185,129,.7)" stroke-width="1.5"/>';
    svg+='<text x="'+(cxA-rA*0.45)+'" y="'+(cy+5)+'" text-anchor="middle" fill="var(--t2)" font-size="18" font-weight="700">'+aOnly+'</text>';
    if(covered>0)svg+='<text x="'+(cxB+rB*0.35)+'" y="'+(cy+5)+'" text-anchor="middle" fill="#10b981" font-size="18" font-weight="700">'+covered+'</text>';
  }
  svg+='</svg>';
  const legend='<div style="min-width:0"><ul style="list-style:none;margin:0;padding:0;font-size:13px">'
    +'<li class="center gap8" style="margin:5px 0"><span class="dot" style="background:rgba(148,163,184,.6)"></span><span class="muted"><b style="color:var(--t2)">'+total+'</b> tools you run (in view)</span></li>'
    +'<li class="center gap8" style="margin:5px 0"><span class="dot" style="background:rgba(16,185,129,.6)"></span><span class="muted"><b style="color:var(--t2)">'+covered+'</b> Salesforce already covers</span></li>'
    +'<li class="muted" style="margin:5px 0 0 21px;font-size:12px">of which <b style="color:var(--t2)">'+cand+'</b> are owned consolidation candidates</li>'
    +'</ul><p class="faint" style="font-size:11px;margin-top:12px">'+total+' tool'+(total===1?'':'s')+' in view · '+covered+' overlap Salesforce · '+cand+' owned consolidation candidate'+(cand===1?'':'s')+'.</p></div>';
  document.getElementById(id+'_vennbody').innerHTML='<div class="venn-wrap">'+svg+legend+'</div>';
}
function toggleDetail(tr,capId){
  const existing=tr.nextElementSibling;
  if(existing&&existing.classList.contains('detail')){existing.remove();return;}
  // close any open detail in the same tbody
  tr.parentNode.querySelectorAll('tr.detail').forEach(d=>d.remove());
  const c=DATA.caps.find(x=>x.id===capId);
  tr.insertAdjacentHTML('afterend',detailHtml(c));
}
function openCap(capId){
  // jump to the map view and open that row's detail
  switchView('map');
  setTimeout(()=>{const tr=document.querySelector('#tbl_map_body tr[data-id="'+capId+'"]');if(tr){toggleDetail(tr,capId);tr.scrollIntoView({block:'center'});}},60);
}

/* ---------- LIFECYCLE ---------- */
function renderLifecycle(){
  const inScope=DATA.caps.filter(c=>LIFECYCLE_SCOPE.has(c.alignment));
  const nat=inScope.filter(c=>c.alignment==='native');
  const natOwned=nat.filter(c=>['owned','owned-expiring'].includes(c.ent)).length;
  const natNot=nat.filter(c=>c.ent==='not-licensed').length;
  const order={native:0,integrates:1,data360:2};
  const byStage={};DATA.stages.forEach(s=>byStage[s.key]=[]);const unplaced=[];
  inScope.forEach(c=>{if(c.clm&&byStage[c.clm])byStage[c.clm].push(c);else unplaced.push(c);});
  Object.keys(byStage).forEach(k=>byStage[k].sort((a,b)=>(order[a.alignment]-order[b.alignment])||a.name.localeCompare(b.name)));
  const card=c=>'<button class="capcard'+(c.alignment==='native'?' native':'')+'" onclick="openCap(\\''+c.id+'\\')"><div class="flex" style="justify-content:space-between;gap:8px"><span class="nm">'+esc(c.name)+'</span><span class="faint">▸</span></div><div class="flex wrap-f gap8 mt8">'+alignChip(c.alignment)+(c.ent==='na'?'':entChip(c.ent,c.entExpiry))+vsTag(c.vs)+'</div><div class="toolline">⬡ '+esc(c.tools.join(', '))+'</div></button>';
  const cols=DATA.stages.map((s,i)=>{const caps=byStage[s.key];return '<div class="card" style="display:flex;flex-direction:column"><div class="hd"><div class="center gap8"><div style="width:28px;height:28px;border-radius:8px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">'+(i+1)+'</div><div><h2 style="font-size:14px">'+esc(s.label)+'</h2><div class="muted" style="font-size:11px">'+esc(s.blurb)+'</div></div></div></div><div class="bd" style="flex:1;display:flex;flex-direction:column;gap:10px">'+(caps.length?caps.map(card).join(''):'<span class="faint" style="font-size:11px;font-style:italic">No in-scope capabilities.</span>')+'</div></div>';}).join('');
  const unp=unplaced.length?'<div class="card mt16"><div class="hd"><h2 style="font-size:14px">Unplaced</h2><span class="faint" style="font-size:11px">'+unplaced.length+'</span></div><div class="bd stage-grid">'+unplaced.map(card).join('')+'</div></div>':'';
  return \`
  <div class="sechd"><h1 class="secttitle">Customer lifecycle — where Salesforce already plays</h1>
  <p class="muted" style="max-width:820px;margin-top:6px">The capabilities where Salesforce genuinely covers a tool Blackbaud runs today, laid across the customer lifecycle: <b>Acquire → Onboard → Serve → Grow</b>. <b>Native</b> capabilities (Salesforce out-of-the-box) are drawn boldest; each card shows whether Blackbaud already <i>licenses</i> the Salesforce side and the tool it maps to.</p></div>
  <div class="legend mt16"><span class="center gap8"><span style="width:11px;height:11px;border-radius:3px;border:1px solid #10b98180;background:#10b9811f;display:inline-block"></span><b style="color:var(--t2)">Native</b> drawn boldest — SF out-of-box (\${nat.length})</span><span class="center gap8"><span style="width:11px;height:11px;border-radius:3px;border:1px solid var(--border);background:var(--cardh);display:inline-block"></span>Integrates / Data 360 — SF plays, lighter</span><span>Of the \${nat.length} native: <b style="color:#10b981">\${natOwned} already licensed</b>, <b style="color:var(--t2)">\${natNot} not yet licensed</b> — all owned-or-ownable.</span></div>
  <div class="stage-grid">\${cols}</div>\${unp}\`;
}

/* ---------- VALUE STREAM ---------- */
function renderStream(vs){
  const label=vs==='A2R'?'Awareness → Revenue':'Implement → Renew';
  const rows=DATA.caps.filter(c=>c.vs===vs);
  const n=rows.length;
  return '<div class="sechd"><h1 class="secttitle">'+label+'</h1><p class="muted" style="margin-top:6px">'+n+' capabilities in Blackbaud’s '+label+' value stream against their draft Salesforce alignment. Filter, then click a row to open the discussion.</p></div><div class="mt16" id="stream_'+vs+'"></div>';
}

/* ---------- NAV / BOOT ---------- */
function switchView(v){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===v));
  document.querySelectorAll('.view').forEach(s=>s.classList.toggle('active',s.id==='view-'+v));
  window.scrollTo(0,0);
}
document.getElementById('tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(b)switchView(b.dataset.view);});
document.getElementById('theme').addEventListener('click',()=>{const h=document.documentElement;h.dataset.theme=h.dataset.theme==='dark'?'light':'dark';});

// Render all views once (static content; filters re-draw their own tables)
document.getElementById('view-overview').innerHTML=renderOverview();
document.getElementById('view-map').innerHTML=renderTable('map',DATA.caps,{venn:true});
document.getElementById('view-lifecycle').innerHTML=renderLifecycle();
document.getElementById('view-a2r').innerHTML=renderStream('A2R');
document.getElementById('view-i2r').innerHTML=renderStream('I2R');
document.getElementById('view-a2r').querySelector('#stream_A2R').innerHTML=renderTable('a2r',DATA.caps.filter(c=>c.vs==='A2R'),{lockStream:'A2R'});
document.getElementById('view-i2r').querySelector('#stream_I2R').innerHTML=renderTable('i2r',DATA.caps.filter(c=>c.vs==='I2R'),{lockStream:'I2R'});
wireTable('map',DATA.caps,{venn:true});
wireTable('a2r',DATA.caps.filter(c=>c.vs==='A2R'),{lockStream:'A2R'});
wireTable('i2r',DATA.caps.filter(c=>c.vs==='I2R'),{lockStream:'I2R'});
document.getElementById('footer').innerHTML='Self-contained discussion canvas · entitlement data as of '+esc(DATA.entAsOf)+' — point-in-time, not a contract · alignment is a preliminary Salesforce view for discussion, not validated with Blackbaud.';
</script>
</body>
</html>`;

const outDir = path.join(ROOT, 'standalone');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'blackbaud-capability-alignment.html');
fs.writeFileSync(outPath, html);
console.log('Wrote', outPath, '—', (html.length / 1024).toFixed(1), 'KB');
console.log('Caps:', caps.length, '| stats:', JSON.stringify(DATA.stats));
