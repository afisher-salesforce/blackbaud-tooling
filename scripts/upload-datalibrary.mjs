#!/usr/bin/env node
/**
 * Upload the curated corpus files to Salesforce as ContentVersion records, so an
 * Agentforce Data Library can index them for unstructured grounding (RAG).
 *
 *   node scripts/upload-datalibrary.mjs <org-alias>
 *
 * Transport: `sf api request rest` (the CLI's own auth — the pattern that works
 * for this project; a hand-built Bearer header returned INVALID_AUTH_HEADER).
 * Each .md file in datacloud/corpus/ becomes a ContentVersion titled
 * "BB Rationalization — <name>". Re-running creates NEW versions; dedupe by
 * title is noted below (left simple on purpose — delete old ones in the UI if
 * you re-upload).
 *
 * NOTE: creating the Data Library itself and attaching it to the agent is a
 * Data Cloud / Agentforce UI step (see docs/PHASE2B_DATA360.md). This script
 * gets the files into Salesforce as the library's source content.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API = 'v64.0';
const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS = join(HERE, '..', 'datacloud', 'corpus');
const TMP = mkdtempSync(join(tmpdir(), 'bb-dl-'));

function target() {
  const t = process.argv[2] || process.env.SF_TARGET_ORG;
  if (!t) throw new Error('Pass the org alias/username as the first arg or set SF_TARGET_ORG.');
  return t;
}

let seq = 0;
function post(org, path, bodyObj) {
  const f = join(TMP, `req-${++seq}.json`);
  writeFileSync(f, JSON.stringify(bodyObj));
  let out;
  try {
    out = execFileSync('sf', ['api', 'request', 'rest', path, '--method', 'POST', '--body', `@${f}`, '--target-org', org], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (e) {
    out = e.stdout || e.message;
  }
  let data;
  try { data = JSON.parse(out); } catch { throw new Error(`${path}: non-JSON response: ${String(out).slice(0, 300)}`); }
  if (Array.isArray(data) && data[0]?.errorCode) throw new Error(`${path}: ${data[0].errorCode} ${data[0].message || ''}`);
  if (data?.success === false) throw new Error(`${path}: ${JSON.stringify(data.errors || data)}`);
  return data;
}

function main() {
  const org = target();
  const files = readdirSync(CORPUS).filter((f) => f.endsWith('.md'));
  if (!files.length) throw new Error(`No .md files in ${CORPUS}`);
  console.log(`→ org ${org} · ${files.length} corpus file(s)`);

  const created = [];
  for (const f of files) {
    const text = readFileSync(join(CORPUS, f), 'utf8');
    if (/Content pending/.test(text)) {
      console.log(`  skip ${f} (placeholder not yet populated)`);
      continue;
    }
    const title = `BB Rationalization — ${f.replace(/\.md$/, '')}`;
    const body = {
      Title: title,
      PathOnClient: f,
      VersionData: Buffer.from(text, 'utf8').toString('base64'),
    };
    const res = post(org, `/services/data/${API}/sobjects/ContentVersion`, body);
    created.push({ file: f, id: res.id });
    console.log(`  uploaded ${f} → ContentVersion ${res.id}`);
  }

  console.log(`\nUploaded ${created.length} file(s).`);
  console.log('Next: in Setup → Data Cloud → Data Libraries, create a library from these files');
  console.log('(or add them to an existing library), let indexing complete, then attach the');
  console.log('library to BB_Rationalization_Agent as a grounding source. See docs/PHASE2B_DATA360.md.');
}

main();
