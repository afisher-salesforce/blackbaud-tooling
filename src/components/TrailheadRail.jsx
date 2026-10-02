import React, { useEffect, useState } from 'react';
import { GraduationCap, ExternalLink, CircleDashed } from 'lucide-react';
import { getTrailheadRecommendations } from '../api/client';

/**
 * TrailheadRail — a row of Salesforce Trailhead learning cards for a capability,
 * served from the committed, human-reviewed catalog the BFF exposes. Where
 * Salesforce aligns with an existing Blackbaud tool, this turns "you already own
 * this" into an actionable enablement path. Deterministic — no live MCP on view.
 *
 * Props: slug — the trailheadSlug from the capability record (null → not rendered
 * by the caller).
 */
export default function TrailheadRail({ slug }) {
  const [state, setState] = useState({ loading: true, items: [], degraded: false });

  useEffect(() => {
    let active = true;
    setState({ loading: true, items: [], degraded: false });
    getTrailheadRecommendations(slug)
      .then((data) => {
        if (!active) return;
        setState({ loading: false, items: data.items || [], degraded: !!data.degraded });
      })
      .catch(() => {
        if (active) setState({ loading: false, items: [], degraded: true });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const { loading, items, degraded } = state;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap size={16} style={{ color: 'var(--bb-accent)' }} />
        <span className="text-sm font-semibold text-th-secondary">Learn this on Trailhead</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-th-faint">Curated</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-th-muted">
          <CircleDashed size={13} className="animate-spin" />
          Finding relevant Trailhead content…
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <a
              key={it.url}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-surface-border bg-surface-card-hover p-3 transition-colors flex flex-col hover:border-[color:var(--bb-accent)]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-th-faint">
                  {it.type}
                  {it.level ? ` · ${it.level}` : ''}
                </span>
                <ExternalLink size={12} className="text-th-faint" />
              </div>
              <div className="text-xs font-semibold text-th-primary leading-snug mb-1">{it.title}</div>
              <p className="text-[11px] text-th-muted leading-relaxed flex-1">{it.synopsis}</p>
            </a>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="text-xs text-th-muted leading-relaxed">
          {degraded
            ? 'No Trailhead content staged for this capability yet — run the catalog refresh to populate it.'
            : 'No matching Trailhead content for this capability right now.'}
        </p>
      )}
    </div>
  );
}
