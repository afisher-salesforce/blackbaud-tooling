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

// ─── Rationalization Agent (Agentforce Agent API) ───────────────────────────
// Activates when the IDO-org config vars are set. Mirrors the DISW agent path
// and the five fixes in the Salesforce Agent API reference: api.salesforce.com
// host, /einstein/ai-agent/v1 path, JWT client-credentials token, bypassUser:false,
// and a structured message body with the My Domain in instanceConfig.endpoint.
const SF_AGENT_ID = (process.env.SF_AGENT_ID || '').trim() || null;
// .trim() every env-derived value: config vars set via the Heroku CLI can pick
// up a trailing newline/space, which makes `new URL()`/fetch throw "Failed to
// parse URL" (seen on first live call) or silently break OAuth on the secret.
const SF_CLIENT_ID = (process.env.SF_CLIENT_ID || '').trim();
const SF_CLIENT_SECRET = (process.env.SF_CLIENT_SECRET || '').trim();
const SF_INSTANCE_URL = (process.env.SF_INSTANCE_URL || '').trim().replace(/\/+$/, '');
const SF_LOGIN_URL = (process.env.SF_LOGIN_URL || SF_INSTANCE_URL).trim().replace(/\/+$/, '');
const AGENT_API_HOST = process.env.SF_AGENT_API_HOST || 'https://api.salesforce.com';
const AGENT_API_BASE = '/einstein/ai-agent/v1';
const ALLOW_WRITES = process.env.ALLOW_WRITES === 'true';
const AGENT_CONFIGURED = !!(SF_AGENT_ID && SF_CLIENT_ID && SF_CLIENT_SECRET && SF_INSTANCE_URL);

let agentTokenCache = { accessToken: null, expiresAt: 0 };
async function getAgentToken() {
  const now = Date.now();
  if (agentTokenCache.accessToken && agentTokenCache.expiresAt > now + 5 * 60 * 1000) {
    return agentTokenCache.accessToken;
  }
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: SF_CLIENT_ID,
    client_secret: SF_CLIENT_SECRET,
  });
  const resp = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!resp.ok) throw new Error(`Salesforce auth failed: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  agentTokenCache = { accessToken: data.access_token, expiresAt: now + 7200000 };
  return data.access_token;
}

let agentMsgSeq = 0;
function buildSessionBody(reqBody) {
  return {
    externalSessionKey:
      globalThis.crypto?.randomUUID?.() ?? `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    instanceConfig: { endpoint: SF_INSTANCE_URL },
    streamingCapabilities: { chunkTypes: ['Text'] },
    bypassUser: false,
    ...(reqBody || {}),
  };
}
function buildMessageBody(reqBody) {
  const m = reqBody?.message;
  const text = typeof m === 'string' ? m : typeof reqBody?.text === 'string' ? reqBody.text : m?.text || '';
  return { message: { sequenceId: ++agentMsgSeq, type: 'Text', text } };
}

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

// GET /api/agent/config — whether the rationalization agent is wired.
app.get('/api/agent/config', (_req, res) => {
  res.json({
    agentId: SF_AGENT_ID,
    configured: AGENT_CONFIGURED,
    status: AGENT_CONFIGURED ? 'ready' : 'roadmap',
    writesEnabled: ALLOW_WRITES,
  });
});

// Guard: if the agent isn't configured, every agent route returns 501 so the UI
// shows the roadmap state (identical behavior to before activation).
function requireAgent(res) {
  if (!AGENT_CONFIGURED) {
    res.status(501).json({
      error: 'Agent not configured',
      status: 'roadmap',
      message:
        'The rationalization agent activates once the IDO-org config vars (SF_AGENT_ID, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_INSTANCE_URL) are set.',
    });
    return false;
  }
  return true;
}

// POST /api/agent/sessions — create an Agent API session.
app.post('/api/agent/sessions', async (req, res) => {
  if (!requireAgent(res)) return;
  try {
    const token = await getAgentToken();
    const url = `${AGENT_API_HOST}${AGENT_API_BASE}/agents/${SF_AGENT_ID}/sessions`;
    const sf = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildSessionBody(req.body)),
    });
    const text = await sf.text();
    let data;
    try { data = JSON.parse(text); } catch { return res.status(sf.status || 502).json({ error: 'Invalid Agent API response', body: text.slice(0, 200) }); }
    if (!sf.ok) { agentTokenCache = { accessToken: null, expiresAt: 0 }; return res.status(sf.status).json(data); }
    res.json(data);
  } catch (err) {
    console.error('[agent] session error:', err.message);
    res.status(502).json({ error: 'Agent API error', message: err.message });
  }
});

// POST /api/agent/sessions/:sessionId/messages — send a message, return the reply.
app.post('/api/agent/sessions/:sessionId/messages', async (req, res) => {
  if (!requireAgent(res)) return;
  try {
    const token = await getAgentToken();
    const url = `${AGENT_API_HOST}${AGENT_API_BASE}/sessions/${req.params.sessionId}/messages`;
    const sf = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildMessageBody(req.body)),
    });
    const text = await sf.text();
    let data;
    try { data = JSON.parse(text); } catch { return res.status(sf.status || 502).send(text); }
    res.status(sf.status).json(data);
  } catch (err) {
    console.error('[agent] message error:', err.message);
    res.status(502).json({ error: 'Agent API error', message: err.message });
  }
});

// DELETE /api/agent/sessions/:sessionId — end a session.
app.delete('/api/agent/sessions/:sessionId', async (req, res) => {
  if (!requireAgent(res)) return;
  try {
    const token = await getAgentToken();
    const url = `${AGENT_API_HOST}${AGENT_API_BASE}/sessions/${req.params.sessionId}`;
    const sf = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (sf.status === 204) return res.status(204).end();
    res.status(sf.status).json(await sf.json().catch(() => ({})));
  } catch (err) {
    res.status(502).json({ error: 'Agent API error', message: err.message });
  }
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
  console.log(`  Agent writes:    ${ALLOW_WRITES ? 'ENABLED' : 'disabled (read-only)'}`);
  console.log(`  Trailhead:       staged catalog (deterministic)`);
  console.log(`  Notes store:     ${notesDb.isEnabled() ? 'Heroku Postgres (shared)' : 'local (per-browser, no DATABASE_URL)'}\n`);
  // Warm the table at boot so the first reviewer doesn't pay the create cost.
  // Non-fatal: a DB hiccup must not take the site down.
  if (notesDb.isEnabled()) {
    notesDb.init().catch((err) => console.error('[db] boot init failed (will retry on first write):', err.message));
  }
});
