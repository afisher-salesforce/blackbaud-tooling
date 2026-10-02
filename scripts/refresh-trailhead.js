#!/usr/bin/env node
/**
 * OFFLINE Trailhead catalog refresh — run manually, never on the request path.
 *
 *   npm run refresh:trailhead            # refresh all slugs
 *   npm run refresh:trailhead -- forecasting data360   # refresh specific slugs
 *
 * Pulls the live Trailhead MCP for each capability slug, anchor-gates the pool,
 * and writes the proposed trailhead-catalog.json. Prints a per-slug diff so a
 * human reviews the cards before committing. A slug whose MCP pull fails keeps
 * its PRIOR committed items (never silently emptied).
 *
 * After refresh: review the diff, commit trailhead-catalog.json, and RESTART the
 * BFF (the catalog is read once at module load).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CAPABILITY_QUERIES, buildCatalogEntry } from '../trailhead.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, '..', 'trailhead-catalog.json');

function loadCatalog() {
  try {
    return JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  } catch {
    return { generatedAt: null, capabilities: {} };
  }
}

async function main() {
  const requested = process.argv.slice(2).filter(Boolean);
  const slugs = requested.length ? requested : Object.keys(CAPABILITY_QUERIES);

  const prior = loadCatalog();
  const next = { generatedAt: new Date().toISOString(), capabilities: { ...prior.capabilities } };

  for (const slug of slugs) {
    if (!CAPABILITY_QUERIES[slug]) {
      console.warn(`! unknown slug "${slug}" — skipping`);
      continue;
    }
    process.stdout.write(`→ ${slug} … `);
    try {
      const entry = await buildCatalogEntry(slug);
      const before = (prior.capabilities?.[slug]?.items || []).map((i) => i.title);
      const after = entry.items.map((i) => i.title);
      next.capabilities[slug] = entry;
      console.log(`${entry.items.length} card(s)`);
      const added = after.filter((t) => !before.includes(t));
      const removed = before.filter((t) => !after.includes(t));
      added.forEach((t) => console.log(`    + ${t}`));
      removed.forEach((t) => console.log(`    - ${t}`));
      if (!entry.items.length) console.log('    (none on-topic — rail will show its empty state)');
    } catch (err) {
      console.log(`FAILED (${err.message}) — keeping prior items`);
      // leave next.capabilities[slug] as the prior value (already copied)
    }
  }

  writeFileSync(CATALOG_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${CATALOG_PATH}`);
  console.log('Review the diff above, commit the catalog, and restart the BFF.');
}

main().catch((err) => {
  console.error('refresh failed:', err);
  process.exit(1);
});
