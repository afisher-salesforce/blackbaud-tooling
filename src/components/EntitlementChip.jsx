import React from 'react';
import { BadgeCheck, Clock, Link2, Circle } from 'lucide-react';
import { entitlementMeta, ENTITLEMENT_AS_OF } from '../content/entitlements';

/**
 * EntitlementChip — shows whether Blackbaud already LICENSES the Salesforce
 * capability (Licensed / Licensed·expiring / Licensed·separate / Not licensed).
 * This is the "start inward first" signal: a green chip means the capability is
 * already paid for, so an RFP for it is spending on something owned.
 *
 * Props: status — entitlement key; size 'sm'|'xs'; expiry (optional string).
 */
const ICON = {
  owned: BadgeCheck,
  'owned-expiring': Clock,
  'separate-agreement': Link2,
  'not-licensed': Circle,
  na: Circle,
};

export default function EntitlementChip({ status, size = 'sm', expiry = null }) {
  const meta = entitlementMeta(status);
  if (status === 'na') return null; // don't clutter genuine gaps
  const Icon = ICON[status] || Circle;
  const pad = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';
  const label = status === 'owned-expiring' && expiry ? `Licensed · exp. ${expiry}` : meta.label;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${pad} ${meta.chip} ${meta.chipDark}`}
      title={`${meta.description}${expiry ? ` (term ends ${expiry})` : ''} — as of ${ENTITLEMENT_AS_OF}; point-in-time, not a contract.`}
    >
      <Icon size={size === 'xs' ? 10 : 12} />
      {label}
    </span>
  );
}
