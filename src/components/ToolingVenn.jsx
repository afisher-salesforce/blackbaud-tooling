import React, { useMemo } from 'react';
import { capabilityEntitlement } from '../content/capabilities';

/**
 * ToolingVenn — a dependency-free 2-circle Venn that recomputes as the user
 * filters the capability table beneath it. It answers the room's core question
 * visually: of the tools you run in this view, how many does Salesforce already
 * cover?
 *
 * Set math (counted in TOOLS, derived from the FILTERED capability rows so it
 * stays in lockstep with the table):
 *   A = "Tools you run"       = every tool across the filtered rows (distinct).
 *   B = "Salesforce covers"   = tools whose row alignment ∈ {native, integrates,
 *                               data360, partial}.
 *   A ∩ B                     = tools on a covered row (the overlap lens).
 *   candidates                = tools that are ALSO on an owned row AND named in
 *                               that row's `overlaps[]` — the same definition as
 *                               consolidationCandidates(), so the Venn never
 *                               disagrees with the "Owned · overlaps a tool"
 *                               filter. Shown as the emphasised inner count.
 *
 * Honest degenerate states: an all-Gap filter empties B (right circle collapses
 * to a hairline, caption reads "0 overlap Salesforce"); an empty filter result
 * shows a quiet "no tools in view" line.
 *
 * Props:
 *   rows — the filtered capability rows reported up from CapabilityTable.
 */
const COVERED = new Set(['native', 'integrates', 'data360', 'partial']);

export default function ToolingVenn({ rows = [] }) {
  const { total, covered, aOnly, candidates } = useMemo(() => {
    // Distinct tools across the filtered rows, each tagged covered / candidate.
    const seen = new Map(); // toolName -> { covered, candidate }
    for (const c of rows) {
      const isCovered = COVERED.has(c.alignment);
      const ent = capabilityEntitlement(c).status;
      const owned = ent === 'owned' || ent === 'owned-expiring';
      const overlapSet = new Set(c.overlaps || []);
      for (const t of c.tools) {
        const prev = seen.get(t) || { covered: false, candidate: false };
        prev.covered = prev.covered || isCovered;
        prev.candidate = prev.candidate || (owned && overlapSet.has(t));
        seen.set(t, prev);
      }
    }
    let coveredN = 0;
    let candidateN = 0;
    for (const v of seen.values()) {
      if (v.covered) coveredN += 1;
      if (v.candidate) candidateN += 1;
    }
    const totalN = seen.size;
    return {
      total: totalN,
      covered: coveredN,
      aOnly: totalN - coveredN,
      candidates: candidateN,
    };
  }, [rows]);

  // Geometry: area-proportional radii (r ∝ √count), capped to the viewbox.
  // A is always the full tool set, so it's the larger (or equal) circle.
  const W = 420;
  const H = 190;
  const maxR = 74;
  const minR = 14;
  const rFor = (n) => {
    if (total === 0) return minR;
    const r = maxR * Math.sqrt(n / total);
    return Math.max(minR, Math.min(maxR, r));
  };
  const rA = rFor(total);
  const rB = covered === 0 ? 3 : rFor(covered);

  // Overlap fraction drives how far the circles sit apart. B ⊆ A conceptually
  // (every covered tool is a tool you run), so B nests toward A's centre as the
  // covered share rises; fully-covered → concentric-ish, no overlap → tangent.
  const share = total === 0 ? 0 : covered / total;
  const cyA = H / 2;
  const cyB = H / 2;
  const cxA = 150;
  // Distance between centres: large (near-tangent) when share is low, small
  // (deep nesting) when share is high.
  const dist = (rA + rB) * (1 - 0.72 * share);
  const cxB = cxA + Math.max(dist, Math.abs(rA - rB) + 6);

  const empty = total === 0;

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div>
          <h2 className="text-sm font-semibold text-th-primary">Tools you run ∩ Salesforce covers</h2>
          <p className="text-xs text-th-muted mt-0.5">
            Recomputes as you filter the table below — the overlap is where the consolidation story lives.
          </p>
        </div>
      </div>
      <div className="section-card-body flex flex-col sm:flex-row items-center gap-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-[420px] shrink-0"
          role="img"
          aria-label={`${total} tools in view, ${covered} overlap Salesforce, ${candidates} owned consolidation candidates`}
        >
          {empty ? (
            <text x={W / 2} y={H / 2} textAnchor="middle" className="fill-th-faint" fontSize="13">
              No tools match these filters.
            </text>
          ) : (
            <>
              {/* A — tools you run (base) */}
              <circle
                cx={cxA}
                cy={cyA}
                r={rA}
                fill="rgb(148 163 184 / 0.18)"
                stroke="rgb(100 116 139 / 0.55)"
                strokeWidth="1.5"
              />
              {/* B — Salesforce covers */}
              {covered > 0 && (
                <circle
                  cx={cxB}
                  cy={cyB}
                  r={rB}
                  fill="rgb(16 185 129 / 0.22)"
                  stroke="rgb(16 185 129 / 0.7)"
                  strokeWidth="1.5"
                />
              )}
              {/* Centre counts */}
              <text x={cxA - rA * 0.45} y={cyA + 4} textAnchor="middle" className="fill-th-secondary" fontSize="18" fontWeight="700">
                {aOnly}
              </text>
              {covered > 0 && (
                <text
                  x={cxB + rB * 0.35}
                  y={cyB + 4}
                  textAnchor="middle"
                  className="fill-emerald-700 dark:fill-emerald-300"
                  fontSize="18"
                  fontWeight="700"
                >
                  {covered}
                </text>
              )}
            </>
          )}
        </svg>

        {/* Legend + reconciling caption */}
        <div className="min-w-0 w-full">
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400/50 ring-1 ring-slate-500/50 shrink-0" />
              <span className="text-th-secondary"><strong>{total}</strong> tools you run (in view)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500/40 ring-1 ring-emerald-500/70 shrink-0" />
              <span className="text-th-secondary"><strong>{covered}</strong> Salesforce already covers</span>
            </li>
            <li className="flex items-center gap-2 pl-5">
              <span className="text-th-muted text-xs">
                of which <strong className="text-th-secondary">{candidates}</strong> are owned consolidation candidates
              </span>
            </li>
          </ul>
          <p className="text-[11px] text-th-faint mt-3 leading-relaxed">
            {empty
              ? 'Adjust the filters to bring tools into view.'
              : `${total} tool${total === 1 ? '' : 's'} in view · ${covered} overlap Salesforce · ${candidates} owned consolidation candidate${candidates === 1 ? '' : 's'}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
