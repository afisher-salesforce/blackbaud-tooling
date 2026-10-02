import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getRecommendations } from './trailhead.js';
import * as notesDb from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

// ─── Future-agent seam (RESERVED, disabled) ─────────────────────────────────
// When Blackbaud provisions Salesforce org access, a Headless 360 / Aiforce
// "rationalization agent" drops in here exactly like the DISW_Support_Assistant
// path: set SF_AGENT_ID + client-credentials vars and wire the Agent API proxy.
// Until then the route returns 501 and /api/health reports agentConfigured:false,
// so the roadmap tile renders honestly without any org wiring.
const SF_AGENT_ID = process.env.SF_AGENT_ID || null;
const AGENT_CONFIGURED = !!(SF_AGENT_ID && process.env.SF_CLIENT_ID);

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    agentConfigured: AGENT_CONFIGURED,
    // The site is a discussion canvas; the only backend dependency today is the
    // Trailhead catalog (always available). Reported so the header indicator can
    // show "live" vs "agent pending".
    trailheadReady: true,
    // 'postgres' when shared review notes are backed by Heroku Postgres;
    // 'local' when no DATABASE_URL is set and the client falls back to
    // per-browser localStorage.
    notesStore: notesDb.isEnabled() ? 'postgres' : 'local',
  });
});

// ─── Shared review notes (Heroku Postgres) ──────────────────────────────────
// Pool reviewers' commentary before Friday. When no DATABASE_URL is set the
// routes report store:'local' so the client keeps its localStorage behavior and
// nothing breaks.
app.get('/api/notes', async (_req, res) => {
  if (!notesDb.isEnabled()) return res.json({ store: 'local', notes: [] });
  try {
    res.set('Cache-Control', 'no-store');
    res.json({ store: 'postgres', notes: await notesDb.listAllNotes() });
  } catch (err) {
    console.error('[notes] list all failed:', err.message);
    res.status(502).json({ error: 'notes store error', message: err.message });
  }
});

app.get('/api/notes/:capability', async (req, res) => {
  if (!notesDb.isEnabled()) return res.json({ store: 'local', notes: [] });
  try {
    res.set('Cache-Control', 'no-store');
    res.json({ store: 'postgres', notes: await notesDb.listNotes(req.params.capability) });
  } catch (err) {
    console.error('[notes] list failed:', err.message);
    res.status(502).json({ error: 'notes store error', message: err.message });
  }
});

app.post('/api/notes', async (req, res) => {
  if (!notesDb.isEnabled()) {
    return res.status(501).json({ store: 'local', error: 'No shared notes store configured' });
  }
  const { capability, author, body } = req.body || {};
  if (!capability || !body || !String(body).trim()) {
    return res.status(400).json({ error: 'capability and body are required' });
  }
  try {
    const note = await notesDb.addNote({ capability, author, body: String(body).trim() });
    res.status(201).json({ store: 'postgres', note });
  } catch (err) {
    console.error('[notes] add failed:', err.message);
    res.status(502).json({ error: 'notes store error', message: err.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  if (!notesDb.isEnabled()) return res.status(501).json({ error: 'No shared notes store configured' });
  try {
    const ok = await notesDb.deleteNote(req.params.id);
    if (!ok) return res.status(404).json({ error: 'note not found' });
    res.status(204).end();
  } catch (err) {
    console.error('[notes] delete failed:', err.message);
    res.status(502).json({ error: 'notes store error', message: err.message });
  }
});

// GET /api/agent/config — whether the future rationalization agent is wired.
app.get('/api/agent/config', (_req, res) => {
  res.json({ agentId: SF_AGENT_ID, configured: AGENT_CONFIGURED, status: AGENT_CONFIGURED ? 'ready' : 'roadmap' });
});

// Reserved agent routes — disabled until org access is provisioned.
app.all('/api/agent/sessions*', (_req, res) => {
  res.status(501).json({
    error: 'Agent not configured',
    status: 'roadmap',
    message:
      'The Headless 360 / Aiforce rationalization agent is on the roadmap. It activates once Blackbaud provisions Salesforce org access and SF_AGENT_ID is set.',
  });
});

// ─── Trailhead recommendations ───────────────────────────────────────────────
// Served from the committed, human-reviewed catalog. No MCP on the request path.
app.get('/api/trailhead/recommendations/:slug', (req, res) => {
  const { slug } = req.params;
  try {
    const data = getRecommendations(slug);
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(data);
  } catch (err) {
    console.error('[Trailhead] recommendations error:', err.message);
    res.status(500).json({ slug, items: [], degraded: true, error: err.message });
  }
});

// ─── Serve Static Files (Production) ─────────────────────────────────────────
const distPath = join(__dirname, 'dist');

app.use('/assets', express.static(join(distPath, 'assets'), { maxAge: '1y', immutable: true }));
app.use('/assets', (_req, res) => res.status(404).send('Not found'));
app.use(express.static(distPath, { index: false, etag: false }));

// SPA fallback — serve index.html for any non-API route with no caching.
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Blackbaud × Salesforce · Capability Alignment`);
  console.log(`  ─────────────────────────────────────────────`);
  console.log(`  Port:            ${PORT}`);
  console.log(`  Agent:           ${AGENT_CONFIGURED ? SF_AGENT_ID : 'roadmap (not configured)'}`);
  console.log(`  Trailhead:       staged catalog (deterministic)`);
  console.log(`  Notes store:     ${notesDb.isEnabled() ? 'Heroku Postgres (shared)' : 'local (per-browser, no DATABASE_URL)'}\n`);
  // Warm the table at boot so the first reviewer doesn't pay the create cost.
  // Non-fatal: a DB hiccup must not take the site down.
  if (notesDb.isEnabled()) {
    notesDb.init().catch((err) => console.error('[db] boot init failed (will retry on first write):', err.message));
  }
});
