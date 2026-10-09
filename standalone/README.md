# Standalone share — `blackbaud-capability-alignment.html`

A single, **fully self-contained** HTML file of the Blackbaud × Salesforce capability-alignment
canvas, built for sharing with Blackbaud Enterprise Architecture.

## What it is
- One `.html` file. **No external scripts or stylesheets** (no CDN, no web fonts, no network calls) —
  open it directly in any modern browser, online or offline.
- All data (capabilities, alignment, entitlements, lifecycle, tool mappings) is baked in from the
  site's own content modules, so it stays faithful to the live app.
- Interactive via inline vanilla JS: view tabs (Overview / Capability Map / Lifecycle / A2R / I2R),
  table filters, the live tools∩coverage Venn, dot tooltips, capability expand/collapse, light/dark.

## What it deliberately does NOT have
- No write-back to Postgres or Salesforce (read-only snapshot).
- No live Agentforce agent.
- No live Trailhead MCP connection (curated content only).

## Note for this shared copy
The draft analysis is labeled **"Google Gemini notes"** (the draft was Gemini-assisted); no individual
is named anywhere in the file.

## Regenerate
From the repo root, after any change to `src/content/*.js`:

```bash
npm run build:standalone
```

Output: `standalone/blackbaud-capability-alignment.html`. The generator is
`scripts/build-standalone-html.mjs`; the lifecycle stage map there is kept in sync with
`src/pages/Lifecycle.jsx`.
