#!/usr/bin/env node
/**
 * Seed the three grounding objects in the IDO org from the site's own content
 * files — the single source of truth. Idempotent: upserts by External_Id__c, so
 * re-run any time capabilities.js / entitlements.js change.
 *
 * Auth: reuses the Salesforce CLI's stored auth (no secrets here). Pass the org
 * alias/username as the first arg or via SF_TARGET_ORG. The script shells out to
 * `sf org display --json` to get an access token + instance URL, then calls the
 * Composite + Composite-Graph REST APIs.
 *
 *   node scripts/seed-salesforce.mjs <org-alias>
 *
 * Order: entitlements first (so capabilities can link to them), then capabilities,
 * then tools (which link to capabilities).
 */

import { execFileSync } from 'node:child_process';
import { CAPABILITIES, capabilityEntitlement } from '../src/content/capabilities.js';
import { OWNED_PRODUCTS, ENTITLEMENT_AS_OF } from '../src/content/entitlements.js';

const API = 'v64.0';
const ALIGN_LABEL = { native: 'Native', integrates: 'Integrates', data360: 'Data 360', partial: 'Partial', gap: 'Gap', discuss: 'Discuss' };

function orgAuth(orgArg) {
  const target = orgArg || process.env.SF_TARGET_ORG;
  const args = ['org', 'display', '--json'];
  if (target) args.push('--target-org', target);
  const out = execFileSync('sf', args, { encoding: 'utf8' });
  const res = JSON.parse(out).result;
  if (!res?.accessToken || !res?.instanceUrl) throw new Error('Could not get org auth from sf org display');
  return { token: res.accessToken, instance: res.instanceUrl.replace(/\/+$/, '') };
}

async function post(auth, path, body) {
  const res = await fetch(`${auth.instance}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(`${path} failed (${res.status}): ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  return data;
}

// Composite upsert by external id: PATCH-style via composite subrequests.
function upsertSubrequest(object, extField, extValue, fields, refId) {
  return {
    method: 'PATCH',
    url: `/services/data/${API}/sobjects/${object}/${extField}/${encodeURIComponent(extValue)}`,
    referenceId: refId,
    body: fields,
  };
}

async function compositeUpsert(auth, subrequests) {
  // Composite caps at 25 subrequests; chunk.
  const results = [];
  for (let i = 0; i < subrequests.length; i += 25) {
    const chunk = subrequests.slice(i, i + 25);
    const data = await post(auth, `/services/data/${API}/composite`, { allOrNone: false, compositeRequest: chunk });
    results.push(...data.compositeResponse);
  }
  return results;
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
}

async function main() {
  const auth = orgAuth(process.argv[2]);
  console.log(`→ org ${auth.instance}`);

  // 1. Entitlements
  const entReqs = Object.entries(OWNED_PRODUCTS).map(([key, info]) =>
    upsertSubrequest('BB_Entitlement__c', 'External_Id__c', key, {
      Name: key.slice(0, 80),
      Products__c: info.products.join('; '),
      Status__c: info.status,
      Expiry__c: info.expiry || null,
      As_Of__c: ENTITLEMENT_AS_OF,
      Source__c: 'Asset line items, Charleston org 00130000016hsaj',
    }, `ent_${key}`)
  );
  const entRes = await compositeUpsert(auth, entReqs);
  console.log(`  entitlements: ${entRes.filter((r) => r.httpStatusCode < 300).length}/${entReqs.length} upserted`);

  // 2. Capabilities (link to entitlement by its external id via a second pass —
  //    composite can't resolve a lookup by external id inline, so set the
  //    relationship field Primary_Entitlement__r by external id in the body).
  const capReqs = CAPABILITIES.map((c) => {
    const ent = capabilityEntitlement(c);
    const body = {
      Name: c.subCapability.slice(0, 80),
      Value_Stream__c: c.valueStream,
      Domain__c: c.domain,
      Primary_Users__c: (c.primaryUsers || '').slice(0, 255),
      Alignment__c: ALIGN_LABEL[c.alignment] || null,
      SF_Products__c: (c.sfProducts || []).join(', ') || null,
      Draft_Note__c: (c.draftNote || '').slice(0, 2000),
      SE_Review__c: (c.seReview || '').slice(0, 4000),
      Entitlement_Status__c: ent.status,
      Retire_Candidates__c: (c.retires || []).join(', ') || null,
    };
    // Lookup by external id: Salesforce accepts the __r relationship with an
    // External_Id__c key in the body for upsert.
    if (c.ownedKey && OWNED_PRODUCTS[c.ownedKey]) {
      body.Primary_Entitlement__r = { External_Id__c: c.ownedKey };
    }
    return upsertSubrequest('BB_Capability__c', 'External_Id__c', c.id, body, `cap_${slug(c.id)}`);
  });
  const capRes = await compositeUpsert(auth, capReqs);
  console.log(`  capabilities: ${capRes.filter((r) => r.httpStatusCode < 300).length}/${capReqs.length} upserted`);

  // 3. Tools (flatten capabilities[].tools, link to capability by external id)
  const toolReqs = [];
  for (const c of CAPABILITIES) {
    const overlaps = ['native', 'integrates', 'data360', 'partial'].includes(c.alignment);
    for (const t of c.tools) {
      const ext = `${slug(t)}--${c.id}`;
      toolReqs.push(
        upsertSubrequest('BB_Tool__c', 'External_Id__c', ext, {
          Name: t.slice(0, 80),
          Value_Stream__c: c.valueStream,
          Sub_Capability__c: c.subCapability.slice(0, 120),
          Capability__r: { External_Id__c: c.id },
          Overlaps_SF__c: overlaps,
          Retire_Candidate__c: Array.isArray(c.retires) && c.retires.includes(t),
        }, `tool_${slug(ext)}`)
      );
    }
  }
  const toolRes = await compositeUpsert(auth, toolReqs);
  console.log(`  tools: ${toolRes.filter((r) => r.httpStatusCode < 300).length}/${toolReqs.length} upserted`);

  // Report any failures explicitly.
  const fails = [...entRes, ...capRes, ...toolRes].filter((r) => r.httpStatusCode >= 300);
  if (fails.length) {
    console.error(`\n${fails.length} subrequest(s) failed:`);
    fails.slice(0, 10).forEach((f) => console.error('  ', JSON.stringify(f.body)));
    process.exit(1);
  }
  console.log('\nSeed complete.');
}

main().catch((err) => {
  console.error('seed failed:', err.message);
  process.exit(1);
});
