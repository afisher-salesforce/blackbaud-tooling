// Thin fetch wrappers for the BFF. All calls go through the Vite dev proxy
// (/api → :3001) or, in production, the same Express server that serves the SPA.

async function jsonFetch(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response from ${url} (${res.status})`);
  }
  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.detail = data;
    throw err;
  }
  return data;
}

// GET /api/health — BFF + (future) agent status for the header indicator.
export async function getHealth() {
  return jsonFetch('/api/health');
}

// GET /api/trailhead/recommendations/:slug — curated Trailhead learning cards
// for a capability, served from the committed catalog. Returns
// { slug, items:[{title,synopsis,url,type,level}], degraded }.
export async function getTrailheadRecommendations(slug) {
  return jsonFetch(`/api/trailhead/recommendations/${encodeURIComponent(slug)}`);
}

// ─── Shared review notes (Postgres-backed when available) ────────────────────
// Each returns { store: 'postgres' | 'local', notes:[{id,capability,author,body,createdAt}] }.
// When store==='local' the caller falls back to per-browser localStorage.

export async function getNotesFor(capability) {
  return jsonFetch(`/api/notes/${encodeURIComponent(capability)}`);
}

export async function getAllNotes() {
  return jsonFetch('/api/notes');
}

export async function addNote({ capability, author, body }) {
  return jsonFetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capability, author, body }),
  });
}

export async function deleteNote(id) {
  const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    const err = new Error(`Delete failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return true;
}

// ─── Rationalization Agent (Agentforce Agent API via the BFF) ────────────────

// GET /api/agent/config — { agentId, configured, status, writesEnabled }.
export async function getAgentConfig() {
  return jsonFetch('/api/agent/config');
}

// POST /api/agent/sessions — returns { sessionId, ... }.
export async function createAgentSession() {
  return jsonFetch('/api/agent/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

// POST /api/agent/sessions/:id/messages — returns the agent's reply payload.
export async function sendAgentMessage(sessionId, text) {
  return jsonFetch(`/api/agent/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  });
}

// DELETE /api/agent/sessions/:id — end a session (best-effort; ignores errors so
// a reset never blocks the UI).
export async function deleteAgentSession(sessionId) {
  if (!sessionId) return true;
  try {
    await fetch(`/api/agent/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
  } catch {
    /* best-effort */
  }
  return true;
}
