import React from 'react';
import { PiggyBank } from 'lucide-react';

/**
 * RetireCallout — the "you already own this" money line. Shown on a capability
 * detail page when the capability is an active Salesforce entitlement AND it
 * overlaps a third-party tool Blackbaud could retire by activating what they own.
 * This is the application-rationalization payoff, stated plainly.
 *
 * Props:
 *   products — array of owned Salesforce product names (from the entitlement)
 *   retires  — array of third-party tool names this capability could replace
 *   expiring — optional expiry string (adds urgency)
 */
export default function RetireCallout({ products = [], retires = [], expiring = null }) {
  if (!retires.length) return null;
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-emerald-500/15 p-2 shrink-0">
          <PiggyBank size={18} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
            You already license this capability
          </div>
          <p className="text-sm text-th-secondary leading-relaxed">
            Blackbaud’s active Salesforce entitlement covers this
            {products.length ? (
              <>
                {' '}via <span className="font-medium">{products.join(', ')}</span>
              </>
            ) : null}
            . Activating what’s owned makes{' '}
            <span className="font-medium">{retires.join(', ')}</span>{' '}
            {retires.length > 1 ? 'candidates' : 'a candidate'} to retire — an application-rationalization
            saving, not a net-new purchase.
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
