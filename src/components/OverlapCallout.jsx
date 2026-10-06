import React from 'react';
import { Layers } from 'lucide-react';

/**
 * OverlapCallout — the "you already own an overlapping capability" line. Shown on
 * a capability detail page when the capability is an active Salesforce entitlement
 * AND it overlaps a third-party tool Blackbaud also runs. Framed as a candidate to
 * CONSOLIDATE the work onto the platform they already own — reducing context-
 * switching — NOT a claim that the tool should be retired (contractual lock-in or
 * un-amortized implementation cost may make an actual retirement impractical).
 *
 * Props:
 *   products — array of owned Salesforce product names (from the entitlement)
 *   overlaps — array of third-party tool names this capability overlaps
 *   expiring — optional expiry string (adds urgency to the owned entitlement)
 */
export default function OverlapCallout({ products = [], overlaps = [], expiring = null }) {
  if (!overlaps.length) return null;
  return (
    <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-sky-500/15 p-2 shrink-0">
          <Layers size={18} className="text-sky-600 dark:text-sky-400" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-sky-700 dark:text-sky-300 mb-1">
            You already own an overlapping Salesforce capability
          </div>
          <p className="text-sm text-th-secondary leading-relaxed">
            Blackbaud’s active Salesforce entitlement covers this
            {products.length ? (
              <>
                {' '}via <span className="font-medium">{products.join(', ')}</span>
              </>
            ) : null}
            . It overlaps <span className="font-medium">{overlaps.join(', ')}</span> — a candidate to
            {' '}<span className="font-medium">consolidate</span> the work onto the platform you already own,
            reducing context-switching across applications. Not a recommendation to retire a tool: contract terms and
            prior implementation investment are the deciding factors, and this is a discussion starter.
          </p>
          {expiring && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
              Note: this entitlement’s term ends {expiring} — a near-term renewal/activation decision point.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
