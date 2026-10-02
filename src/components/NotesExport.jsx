import React, { useState } from 'react';
import { Download, CircleDashed } from 'lucide-react';
import { getAllNotes } from '../api/client';
import { readAllNotes } from '../hooks/useLocalNotes';
import { getCapability } from '../content/capabilities';
import { alignmentMeta } from '../content/alignment';

/**
 * NotesExport — one-click Markdown export of ALL review notes, so the pooled
 * commentary leaves the site as a portable document. Pulls from the shared
 * Postgres store when available (store:'postgres'); falls back to this browser's
 * localStorage notes when no shared store is configured.
 */
function capTitle(id) {
  const cap = getCapability(id);
  return cap ? `${cap.domain} — ${cap.subCapability}` : id;
}

function buildMarkdownFromThread(notesByCap) {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const ids = Object.keys(notesByCap);
  let md = `# Blackbaud × Salesforce — Capability Alignment Notes\n\n`;
  md += `_Exported ${stamp} · ${ids.length} capabilit${ids.length === 1 ? 'y' : 'ies'} with notes_\n\n`;
  if (!ids.length) return `${md}_No review notes captured yet._\n`;
  for (const id of ids) {
    const cap = getCapability(id);
    md += `## ${capTitle(id)}\n`;
    if (cap) md += `**Tools:** ${cap.tools.join(', ')}  \n**Alignment (draft):** ${alignmentMeta(cap.alignment).label}\n\n`;
    for (const n of notesByCap[id]) {
      const when = n.createdAt ? new Date(n.createdAt).toLocaleString() : '';
      md += `- **${n.author || 'Anonymous'}**${when ? ` _(${when})_` : ''}: ${n.body}\n`;
    }
    md += '\n';
  }
  return md;
}

function download(md) {
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blackbaud-alignment-notes-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function NotesExport() {
  const [busy, setBusy] = useState(false);

  const onExport = async () => {
    setBusy(true);
    try {
      const data = await getAllNotes();
      let byCap = {};
      if (data.store === 'postgres') {
        for (const n of data.notes) (byCap[n.capability] = byCap[n.capability] || []).push(n);
      } else {
        // Local fallback: single note per capability.
        const local = readAllNotes();
        for (const [id, body] of Object.entries(local)) byCap[id] = [{ author: 'This browser', body, createdAt: null }];
      }
      download(buildMarkdownFromThread(byCap));
    } catch {
      // Even if the API fails, export whatever is in localStorage.
      const local = readAllNotes();
      const byCap = {};
      for (const [id, body] of Object.entries(local)) byCap[id] = [{ author: 'This browser', body, createdAt: null }];
      download(buildMarkdownFromThread(byCap));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onExport}
      disabled={busy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-surface-border text-xs font-medium text-th-secondary hover:bg-surface-card-hover transition-colors disabled:opacity-50"
      title="Export all review notes as Markdown"
    >
      {busy ? <CircleDashed size={13} className="animate-spin" /> : <Download size={13} />}
      Export notes
    </button>
  );
}
