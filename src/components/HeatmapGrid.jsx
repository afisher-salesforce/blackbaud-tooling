import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CAPABILITIES } from '../content/capabilities';
import { alignmentMeta, ALIGNMENT_ORDER } from '../content/alignment';

/**
 * HeatmapGrid — the opening overview for the room. One row per capability domain,
 * split into the A2R and I2R value streams, each cell a stack of alignment dots
 * (one per capability in that domain/stream). It answers "where is Salesforce
 * strong vs. where do gaps cluster?" at a glance, then clicking a dot deep-links
 * to that capability's discussion page.
 *
 * This is intentionally a dot-matrix, not a color-density block: with only ~50
 * capability rows, individual dots stay honest (you can count them) and each is
 * a direct link into the conversation — better for a working session than an
 * abstract heat shade.
 */
export default function HeatmapGrid() {
  const navigate = useNavigate();

  // domain → { A2R: [caps], I2R: [caps] }
  const byDomain = {};
  for (const c of CAPABILITIES) {
    byDomain[c.domain] = byDomain[c.domain] || { A2R: [], I2R: [] };
    byDomain[c.domain][c.valueStream].push(c);
  }
  const domains = Object.keys(byDomain);

  const Cell = ({ caps, tint = 'bg-surface-card-hover/40' }) => {
    if (!caps.length) return <div className={`h-full min-h-[2.25rem] rounded-md ${tint}`} />;
    // Sort dots by alignment order so native clusters read first.
    const sorted = [...caps].sort(
      (a, b) => ALIGNMENT_ORDER.indexOf(a.alignment) - ALIGNMENT_ORDER.indexOf(b.alignment)
    );
    return (
      // Dots spread across the (wide) lane: larger gap + px so the spatial
      // relationship within a domain row reads clearly.
      <div className={`flex flex-wrap gap-2 px-3 py-2 rounded-md ${tint} min-h-[2.25rem] content-start`}>
        {sorted.map((c) => {
          const meta = alignmentMeta(c.alignment);
          return (
            <div key={c.id} className="relative group/dot">
              <button
                onClick={() => navigate(`/capability/${c.id}`)}
                aria-label={`${c.subCapability} — ${meta.label}`}
                className={`w-3.5 h-3.5 rounded-full ${meta.dot} ring-1 ring-black/5 hover:scale-125 transition-transform`}
              />
              {/* Instant styled tooltip (replaces the laggy native title). */}
              <div
                role="tooltip"
                className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-1.5 hidden w-max max-w-[220px] -translate-x-1/2 group-hover/dot:block"
              >
                <div className="rounded-md border border-surface-border bg-surface-card px-2.5 py-1.5 text-left shadow-lg">
                  <div className="text-[11px] font-semibold text-th-primary leading-snug">{c.subCapability}</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className="text-[10px] font-medium text-th-secondary">{meta.label}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-th-muted leading-snug">{c.tools.join(', ')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div>
          <h2 className="text-sm font-semibold text-th-primary">Alignment at a glance</h2>
          <p className="text-xs text-th-muted mt-0.5">
            Each row is a capability domain; each dot is one capability, colored by its draft alignment. The two
            lanes split Blackbaud’s value streams — click any dot to open its discussion.
          </p>
        </div>
      </div>
      {/* No overflow clipping here: an overflow-x container would also clip the
          dot tooltips vertically (CSS forces overflow-y:auto alongside x:auto).
          The inner min-width lets the page scroll horizontally on narrow screens. */}
      <div className="section-card-body">
        {/* Width-capped so the matrix stays legible rather than spanning the full page. */}
        <div className="min-w-[560px] max-w-3xl">
          {/* Column headers — persistent lane labels, left-aligned over their dot
              lanes (px-3 matches the cell padding so the label sits over the dots). */}
          <div className="grid grid-cols-[200px_1fr_1fr] gap-2 mb-2">
            <div />
            <div className="rounded-md bg-surface-card-hover/60 px-3 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-th-faint">
              Awareness → Revenue
            </div>
            <div className="rounded-md bg-[var(--bb-accent)]/5 px-3 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-th-faint">
              Implement → Renew
            </div>
          </div>
          {/* Rows — the two lanes carry distinct tints so a dot's stream is always clear. */}
          <div className="space-y-1.5">
            {domains.map((d) => (
              <div key={d} className="grid grid-cols-[200px_1fr_1fr] gap-2 items-stretch">
                <div className="text-xs font-medium text-th-secondary flex items-center pr-1">{d}</div>
                <Cell caps={byDomain[d].A2R} tint="bg-surface-card-hover/50" />
                <Cell caps={byDomain[d].I2R} tint="bg-[var(--bb-accent)]/[0.04]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
