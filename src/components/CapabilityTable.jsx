import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import AlignmentChip from './AlignmentChip';
import EntitlementChip from './EntitlementChip';
import { ALIGNMENT, ALIGNMENT_ORDER } from '../content/alignment';
import { capabilityEntitlement } from '../content/capabilities';

/**
 * CapabilityTable — the filterable inventory. One row per capability (which may
 * bundle several tools). Filters: value stream, alignment type, capability
 * domain, and free-text across tool/sub-capability/products. Row click opens the
 * capability's discussion page.
 *
 * Deliberately shows NO renewal date / ACV / user count / utilization columns —
 * that data is a post-meeting ask from Russ and we are not mapping where
 * contracts live before Friday.
 *
 * Props:
 *   rows — capability records to show (defaults handled by caller)
 *   domains — distinct domains for the filter dropdown
 *   lockStream — when set ('A2R'|'I2R'), hides the stream filter (used by the
 *                value-stream pages)
 */
export default function CapabilityTable({ rows, domains, lockStream = null, onFilteredChange = null }) {
  const navigate = useNavigate();
  const [stream, setStream] = useState('all');
  const [alignment, setAlignment] = useState('all');
  const [domain, setDomain] = useState('all');
  const [licensed, setLicensed] = useState('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((c) => (lockStream ? true : stream === 'all' || c.valueStream === stream))
      .filter((c) => alignment === 'all' || c.alignment === alignment)
      .filter((c) => domain === 'all' || c.domain === domain)
      .filter((c) => {
        if (licensed === 'all') return true;
        const s = capabilityEntitlement(c).status;
        if (licensed === 'licensed') return ['owned', 'owned-expiring', 'separate-agreement'].includes(s);
        if (licensed === 'overlap') return ['owned', 'owned-expiring'].includes(s) && c.overlaps?.length;
        return true;
      })
      .filter((c) => {
        if (!needle) return true;
        const hay = [c.subCapability, c.domain, ...c.tools, ...(c.sfProducts || [])].join(' ').toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => {
        // Group by domain, then by alignment order within domain.
        if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
        return ALIGNMENT_ORDER.indexOf(a.alignment) - ALIGNMENT_ORDER.indexOf(b.alignment);
      });
  }, [rows, stream, alignment, domain, licensed, q, lockStream]);

  // Report the current filtered rows up so a sibling (e.g. the Venn) can react
  // to the same filters without owning the filter UI.
  useEffect(() => {
    if (onFilteredChange) onFilteredChange(filtered);
  }, [filtered, onFilteredChange]);

  return (
    <div className="section-card">
      {/* Filter bar */}
      <div className="section-card-header flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {!lockStream && (
            <select value={stream} onChange={(e) => setStream(e.target.value)} className="rounded-md border px-2.5 py-1.5 text-xs">
              <option value="all">All value streams</option>
              <option value="A2R">Awareness → Revenue</option>
              <option value="I2R">Implement → Renew</option>
            </select>
          )}
          <select value={alignment} onChange={(e) => setAlignment(e.target.value)} className="rounded-md border px-2.5 py-1.5 text-xs">
            <option value="all">All alignment</option>
            {ALIGNMENT_ORDER.map((k) => (
              <option key={k} value={k}>
                {ALIGNMENT[k].label}
              </option>
            ))}
          </select>
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="rounded-md border px-2.5 py-1.5 text-xs">
            <option value="all">All domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select value={licensed} onChange={(e) => setLicensed(e.target.value)} className="rounded-md border px-2.5 py-1.5 text-xs">
            <option value="all">All entitlements</option>
            <option value="licensed">Already licensed</option>
            <option value="overlap">Owned · overlaps a tool</option>
          </select>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-th-faint" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools, capabilities…"
            className="rounded-md border pl-8 pr-3 py-1.5 text-xs w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Capability</th>
              <th>Tool(s)</th>
              {!lockStream && <th>Stream</th>}
              <th>Primary users</th>
              <th>Alignment</th>
              <th>Entitlement</th>
              <th>Salesforce</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="cursor-pointer" onClick={() => navigate(`/capability/${c.id}`)}>
                <td>
                  <div className="font-medium text-th-primary">{c.subCapability}</div>
                  <div className="text-[11px] text-th-faint">{c.domain}</div>
                </td>
                <td className="text-th-secondary">{c.tools.join(', ')}</td>
                {!lockStream && (
                  <td>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-th-faint">
                      {c.valueStream}
                    </span>
                  </td>
                )}
                <td className="text-[11px] text-th-muted max-w-[180px]">{c.primaryUsers}</td>
                <td>
                  <AlignmentChip value={c.alignment} size="xs" />
                </td>
                <td>
                  {(() => {
                    const e = capabilityEntitlement(c);
                    return e.status === 'na' ? (
                      <span className="text-[11px] text-th-faint">—</span>
                    ) : (
                      <EntitlementChip status={e.status} size="xs" expiry={e.info?.expiry} />
                    );
                  })()}
                </td>
                <td className="text-[11px] text-th-muted max-w-[200px]">
                  {c.sfProducts && c.sfProducts.length ? c.sfProducts.slice(0, 2).join(', ') : '—'}
                  {c.sfProducts && c.sfProducts.length > 2 && (
                    <span className="text-th-faint"> +{c.sfProducts.length - 2}</span>
                  )}
                </td>
                <td>
                  <ChevronRight size={14} className="text-th-faint" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={lockStream ? 7 : 8} className="text-center py-10 text-sm text-th-muted">
                  No capabilities match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-surface-border text-[11px] text-th-faint">
        {filtered.length} capabilit{filtered.length === 1 ? 'y' : 'ies'} shown
      </div>
    </div>
  );
}
