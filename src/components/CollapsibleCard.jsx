import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * CollapsibleCard — a disclosure wrapper for the framing banners on the Overview.
 * Collapsed by default: shows a one-line summary + chevron; clicking the header
 * reveals the full `children`. Keeps the useful context ("Read this first",
 * "Start inward first") available without letting it dominate the top of the page
 * before the glance view + stats.
 *
 * Per-session state only (no persistence) — the demo always opens fresh with the
 * banners tucked away.
 *
 * Props:
 *   title     — bold label shown on the header row (always visible).
 *   summary   — one-line gist shown next to the title while collapsed.
 *   className — passthrough for the outer border/background (lets the caller tint
 *               the amber disclaimer vs. the emerald "start inward" card).
 *   accent    — optional className for the chevron/title color.
 *   icon      — optional leading icon element.
 *   defaultOpen — start expanded (default false).
 */
export default function CollapsibleCard({
  title,
  summary,
  className = 'border-surface-border bg-surface-card',
  accent = 'text-th-secondary',
  icon = null,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-lg border ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left"
      >
        <ChevronRight
          size={15}
          className={`shrink-0 transition-transform ${accent} ${open ? 'rotate-90' : ''}`}
        />
        {icon}
        <span className={`text-sm font-semibold ${accent}`}>{title}</span>
        {!open && summary && (
          <span className="text-xs text-th-muted truncate hidden sm:inline">— {summary}</span>
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}
