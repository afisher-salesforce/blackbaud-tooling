import React from 'react';
import { Info } from 'lucide-react';
import { ALIGNMENT_DISCLAIMER } from '../content/alignment';

/**
 * DisclaimerBanner — the honest framing that governs the whole site. The
 * alignment column is Salesforce's PRELIMINARY point of view for discussion,
 * starting from Christa's quickly-assembled draft, explicitly not validated with
 * Blackbaud and possibly too black-and-white. Shown on Overview and echoed as a
 * compact note on every capability detail page, so no one mistakes a chip for a
 * commitment in front of Enterprise Architecture.
 *
 * Props:
 *   compact — slimmer single-line variant for detail pages.
 */
export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2">
        <Info size={13} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] leading-relaxed text-th-muted">
          Alignment is a preliminary Salesforce view for discussion — a starting point from Christa’s draft, not validated with Blackbaud.
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3">
      <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
      <div>
        <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">
          Read this first — these are talking points, not conclusions
        </div>
        <p className="text-sm leading-relaxed text-th-muted">{ALIGNMENT_DISCLAIMER}</p>
      </div>
    </div>
  );
}
