/**
 * Postgres-backed review notes store.
 *
 * Multiple reviewers comment on capabilities before the Friday session; their
 * notes must pool together (localStorage can't do that — it is per-browser), so
 * notes live in Heroku Postgres (Private-0 tier, inside the same Private Space
 * as the app). Heroku sets DATABASE_URL automatically when the add-on is
 * attached.
 *
 * GRACEFUL FALLBACK: if DATABASE_URL is absent (local dev with no Postgres, or
 * Heroku before the add-on is attached), isEnabled() returns false and the BFF
 * falls back to the client's localStorage behavior. The app never crashes for
 * lack of a database.
 */

import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || null;

// Heroku Postgres requires SSL; it uses a cert chain Node doesn't bundle, so
// rejectUnauthorized:false is the standard Heroku pattern. Local Postgres
// (DATABASE_URL without sslmode) connects without SSL.
const useSsl = !!DATABASE_URL && !/sslmode=disable/.test(DATABASE_URL) && !/localhost|127\.0\.0\.1/.test(DATABASE_URL);

let pool = null;
let ready = null; // promise that resolves once the table exists

export function isEnabled() {
  return !!DATABASE_URL;
}

function getPool() {
  if (!DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30000,
    });
    pool.on('error', (err) => console.error('[db] idle client error:', err.message));
  }
  return pool;
}

// Create the notes table once (idempotent). All callers await this first.
export function init() {
  if (!DATABASE_URL) return Promise.resolve(false);
  if (!ready) {
    ready = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS review_notes (
           id          BIGSERIAL PRIMARY KEY,
           capability  TEXT NOT NULL,
           author      TEXT NOT NULL DEFAULT 'Anonymous',
           body        TEXT NOT NULL,
           created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS review_notes_capability_idx ON review_notes (capability);`
      )
      .then(() => {
        console.log('[db] review_notes table ready');
        return true;
      })
      .catch((err) => {
        console.error('[db] init failed:', err.message);
        ready = null; // allow a later retry
        throw err;
      });
  }
  return ready;
}

function rowToNote(r) {
  return {
    id: String(r.id),
    capability: r.capability,
    author: r.author,
    body: r.body,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  };
}

// All notes for one capability, oldest first (reads like a thread).
export async function listNotes(capability) {
  await init();
  const { rows } = await getPool().query(
    'SELECT id, capability, author, body, created_at FROM review_notes WHERE capability = $1 ORDER BY created_at ASC',
    [capability]
  );
  return rows.map(rowToNote);
}

// Every note across all capabilities (for export), grouped-friendly ordering.
export async function listAllNotes() {
  await init();
  const { rows } = await getPool().query(
    'SELECT id, capability, author, body, created_at FROM review_notes ORDER BY capability ASC, created_at ASC'
  );
  return rows.map(rowToNote);
}

export async function addNote({ capability, author, body }) {
  await init();
  const { rows } = await getPool().query(
    'INSERT INTO review_notes (capability, author, body) VALUES ($1, $2, $3) RETURNING id, capability, author, body, created_at',
    [capability, (author || 'Anonymous').slice(0, 120), body.slice(0, 8000)]
  );
  return rowToNote(rows[0]);
}

export async function deleteNote(id) {
  await init();
  const { rowCount } = await getPool().query('DELETE FROM review_notes WHERE id = $1', [id]);
  return rowCount > 0;
}
