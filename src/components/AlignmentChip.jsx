import React from 'react';
import { alignmentMeta } from '../content/alignment';

/**
 * AlignmentChip — renders one of the 6-way alignment placements as a colored
 * pill. Deliberately NOT a hard verdict: the color encodes the shade of gray
 * (Native → Gap → Discuss), and the whole column is labeled provisional. See
 * alignment.js for the taxonomy and the honest disclaimer.
 *
 * Props:
 *   value — alignment key ('native' | 'integrates' | 'data360' | 'partial' | 'gap' | 'discuss')
 *   size  — 'sm' (default) | 'xs'
 *   withDot — show the leading status dot (default true)
 */
export default function AlignmentChip({ value, size = 'sm', withDot = true }) {
  const meta = alignmentMeta(value);
  const pad = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${pad} ${meta.chip} ${meta.chipDark}`}
      title={meta.description}
    >
      {withDot && <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
      {meta.label}
    </span>
  );
}
