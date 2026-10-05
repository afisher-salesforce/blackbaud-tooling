#!/usr/bin/env node
/**
 * One-off migration: copy the shared review notes from Heroku Postgres
 * (review_notes) into Salesforce BB_Alignment_Note__c, so the agent and the site
 * share one system of record. Idempotent-ish: skips notes whose (capability,
 * author, body) already exist in Salesforce.
 *
 *   DATABASE_URL=... node scripts/migrate-notes-to-sf.mjs <org-alias>
 *
 * Reads Postgres via `pg` (DATABASE_URL) and Salesforce via the CLI's stored auth
 * (sf org display), same as seed-salesforce.mjs. Capabilities must already be
 * seeded (notes link by capability External_Id__c).
 */

import { execFileSync } from 'node:child_process';
import pg from 'pg';

const API = 'v64.0';

function orgAuth(orgArg) {
  const target = orgArg || process.env.SF_TARGET_ORG;
  const args = ['org', 'display', '--json'];
  if (target) args.push('--target-org', target);
  const res = JSON.parse(execFileSync('sf', args, { encoding: 'utf8' })).result;
  if (!res?.accessToken) throw new Error('Could not get org auth from sf org display');
  return { token: res.accessToken, instance: res.instanceUrl.replace(/\/+$/, '') };
}

async function sf(auth, method, path, body) {
  const res = await fetch(`${auth.instance}${path}`, {
    method,
    headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${path} failed (${res.status}): ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL to the Heroku Postgres connection string.');
  const auth = orgAuth(process.argv[2]);

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false },
  });
  const { rows } = await pool.query('SELECT capability, author, body, created_at FROM review_notes ORDER BY created_at ASC');
  console.log(`→ ${rows.length} note(s) in Postgres`);

  let created = 0;
  for (const r of rows) {
    // Composite upsert won't dedupe on free text, so query first.
    const soql = `SELECT Id FROM BB_Alignment_Note__c WHERE Capability__r.External_Id__c = '${r.capability.replace(/'/g, "\\'")}' AND Captured_By__c = '${(r.author || '').replace(/'/g, "\\'")}' AND Note__c = '${r.body.replace(/'/g, "\\'").slice(0, 255)}' LIMIT 1`;
    const q = await sf(auth, 'GET', `/services/data/${API}/query/?q=${encodeURIComponent(soql)}`);
    if (q.totalSize > 0) continue;

    // Find the capability Id by external id.
    const capQ = await sf(auth, 'GET', `/services/data/${API}/query/?q=${encodeURIComponent(`SELECT Id FROM BB_Capability__c WHERE External_Id__c = '${r.capability.replace(/'/g, "\\'")}' LIMIT 1`)}`);
    if (!capQ.records.length) {
      console.warn(`  ! no capability for "${r.capability}" — skipping note`);
      continue;
    }
    await sf(auth, 'POST', `/services/data/${API}/sobjects/BB_Alignment_Note__c`, {
      Capability__c: capQ.records[0].Id,
      Note__c: r.body.slice(0, 8000),
      Captured_By__c: (r.author || 'Reviewer').slice(0, 120),
      Captured_At__c: new Date(r.created_at).toISOString(),
      Source__c: 'Reviewer',
    });
    created += 1;
  }
  await pool.end();
  console.log(`Migrated ${created} new note(s) into BB_Alignment_Note__c.`);
}

main().catch((err) => {
  console.error('migration failed:', err.message);
  process.exit(1);
});
