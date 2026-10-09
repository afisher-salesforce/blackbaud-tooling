import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Rocket, Headphones, TrendingUp, ChevronRight, Package } from 'lucide-react';
import AlignmentChip from '../components/AlignmentChip';
import EntitlementChip from '../components/EntitlementChip';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { CAPABILITIES, getCapability, capabilityEntitlement } from '../content/capabilities';

/**
 * Lifecycle — a customer-lifecycle (CLM) map of the capabilities where Salesforce
 * genuinely plays, grouped Acquire → Onboard → Serve → Grow. Each capability shows
 * whether Blackbaud already LICENSES the Salesforce side (owned / owned-expiring /
 * not-licensed) and the third-party tool it maps to, with its A2R/I2R value-stream
 * tag preserved so it ties back to the rest of the site.
 *
 * Scope: alignment ∈ {native, integrates, data360}. NATIVE is drawn boldest (it's
 * the "Salesforce delivers this out-of-box" story — the heart of the consolidation
 * case); integrates / Data 360 are shown lighter as the fuller "Salesforce plays
 * here" surface.
 *
 * SINGLE SOURCE OF TRUTH: all capability facts (label, alignment, entitlement,
 * tools, SF products) are read live from capabilities.js. The ONLY thing authored
 * here is the editorial CLM-stage assignment (CLM_STAGE below) — a lifecycle lens
 * laid over the site's A2R/I2R value-stream model, not a second copy of the data.
 */

// capability id → CLM stage. Hand-assigned by capability function; every
// native/integrates/data360 capability is placed. If a capability is added to
// capabilities.js with one of those alignments and no entry here, it surfaces in
// an "Unplaced" bucket (see below) so the map never silently drops it.
const CLM_STAGE = {
  // ── Acquire — find, attract, and win the customer ──
  'prospecting-sales-intelligence': 'acquire',
  'website-chat-conversational': 'acquire',
  'lead-routing-matching': 'acquire',
  'meeting-scheduling': 'acquire',
  'sales-engagement-dialer': 'acquire',
  // ── Onboard — quote, close, and stand the customer up ──
  'crm-system-of-record': 'onboard',
  'revenue-cloud-cpq': 'onboard',
  'e-signature': 'onboard',
  'ipaas-integration': 'onboard',
  'workflow-automation-grid': 'onboard',
  'ai-agent-chatbot-builder': 'onboard',
  // ── Serve — support and operate for the customer ──
  'contact-center-telephony': 'serve',
  'wfm-scheduling': 'serve',
  'prm-partner-portal': 'serve',
  'dcx-scheduling': 'serve',
  'online-community': 'serve',
  // ── Grow — renew, expand, and reward ──
  'revenue-forecasting': 'grow',
  'renewal-reporting': 'grow',
  'product-analytics': 'grow',
  'sales-commission': 'grow',
};

const STAGES = [
  {
    key: 'acquire',
    label: 'Acquire',
    blurb: 'Find, attract, and win',
    icon: Search,
  },
  {
    key: 'onboard',
    label: 'Onboard',
    blurb: 'Quote, close, and stand up',
    icon: Rocket,
  },
  {
    key: 'serve',
    label: 'Serve',
    blurb: 'Support and operate',
    icon: Headphones,
  },
  {
    key: 'grow',
    label: 'Grow',
    blurb: 'Renew, expand, and reward',
    icon: TrendingUp,
  },
];

const IN_SCOPE = new Set(['native', 'integrates', 'data360']);

function StreamTag({ stream }) {
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-wider text-th-faint rounded px-1.5 py-0.5 border border-surface-border"
      title={stream === 'A2R' ? 'Awareness → Revenue' : 'Implement → Renew'}
    >
      {stream}
    </span>
  );
}

function CapabilityCard({ cap }) {
  const navigate = useNavigate();
  const ent = capabilityEntitlement(cap);
  const isNative = cap.alignment === 'native';
  // Native drawn boldest; integrates / Data 360 lighter (fuller surface, lower emphasis).
  const emphasis = isNative
    ? 'border-emerald-500/40 bg-emerald-500/[0.06]'
    : 'border-surface-border bg-surface-card-hover/40';

  return (
    <button
      onClick={() => navigate(`/capability/${cap.id}`)}
      className={`w-full text-left rounded-lg border ${emphasis} p-3 transition-colors hover:border-[color:var(--bb-accent)]/50 group`}
      title={`${cap.subCapability} — open the discussion`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-semibold text-th-primary leading-snug">{cap.subCapability}</span>
        <ChevronRight size={14} className="text-th-faint shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <AlignmentChip value={cap.alignment} size="xs" />
        {ent.status !== 'na' && <EntitlementChip status={ent.status} size="xs" expiry={ent.info?.expiry} />}
        <StreamTag stream={cap.valueStream} />
      </div>

      {/* The tool this capability maps to */}
      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-th-muted leading-snug">
        <Package size={12} className="text-th-faint mt-0.5 shrink-0" />
        <span>{cap.tools.join(', ')}</span>
      </div>
    </button>
  );
}

export default function Lifecycle() {
  const { byStage, unplaced, stats } = useMemo(() => {
    const inScope = CAPABILITIES.filter((c) => IN_SCOPE.has(c.alignment));
    const byStage = Object.fromEntries(STAGES.map((s) => [s.key, []]));
    const unplaced = [];
    for (const c of inScope) {
      const stage = CLM_STAGE[c.id];
      if (stage && byStage[stage]) byStage[stage].push(c);
      else unplaced.push(c);
    }
    // Within a stage, native first (boldest), then integrates, then data360.
    const order = { native: 0, integrates: 1, data360: 2 };
    for (const k of Object.keys(byStage)) {
      byStage[k].sort((a, b) => (order[a.alignment] - order[b.alignment]) || a.subCapability.localeCompare(b.subCapability));
    }
    const nativeOwned = inScope.filter((c) => c.alignment === 'native' && ['owned', 'owned-expiring'].includes(capabilityEntitlement(c).status)).length;
    const nativeNot = inScope.filter((c) => c.alignment === 'native' && capabilityEntitlement(c).status === 'not-licensed').length;
    return {
      byStage,
      unplaced,
      stats: { total: inScope.length, native: inScope.filter((c) => c.alignment === 'native').length, nativeOwned, nativeNot },
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-th-primary">Customer lifecycle — where Salesforce already plays</h1>
        <p className="text-sm text-th-muted mt-1 max-w-3xl">
          The capabilities where Salesforce genuinely covers a tool Blackbaud runs today, laid across the customer
          lifecycle: <strong>Acquire → Onboard → Serve → Grow</strong>. <strong>Native</strong> capabilities
          (Salesforce delivers them out-of-the-box) are drawn boldest; each card shows whether Blackbaud already
          <em> licenses</em> the Salesforce side and the tool it maps to. The <span className="font-semibold">A2R</span>/
          <span className="font-semibold">I2R</span> tag ties each back to its value stream.
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* Legend / count strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-th-muted rounded-lg border border-surface-border bg-surface-card px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border border-emerald-500/50 bg-emerald-500/[0.12]" />
          <strong className="text-th-secondary">Native</strong> drawn boldest — SF out-of-box ({stats.native})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border border-surface-border bg-surface-card-hover/60" />
          Integrates / Data 360 — SF plays, lighter
        </span>
        <span className="h-3.5 w-px bg-surface-border" />
        <span>
          Of the {stats.native} native: <strong className="text-emerald-600 dark:text-emerald-400">{stats.nativeOwned} already licensed</strong>,{' '}
          <strong className="text-th-secondary">{stats.nativeNot} not yet licensed</strong> — all owned-or-ownable on the platform.
        </span>
      </div>

      {/* Lifecycle rail */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map((stage, i) => {
          const caps = byStage[stage.key];
          const Icon = stage.icon;
          return (
            <div key={stage.key} className="section-card flex flex-col">
              <div className="section-card-header">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: 'var(--bb-accent)' }}
                  >
                    <Icon size={15} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-th-faint">{String(i + 1).padStart(2, '0')}</span>
                      <h2 className="text-sm font-semibold text-th-primary">{stage.label}</h2>
                    </div>
                    <p className="text-[11px] text-th-muted leading-tight">{stage.blurb}</p>
                  </div>
                </div>
              </div>
              <div className="section-card-body flex-1 space-y-2.5">
                {caps.length === 0 ? (
                  <p className="text-[11px] text-th-faint italic">No in-scope capabilities in this stage.</p>
                ) : (
                  caps.map((cap) => <CapabilityCard key={cap.id} cap={cap} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety net: any in-scope capability we haven't placed on the lifecycle. */}
      {unplaced.length > 0 && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="text-sm font-semibold text-th-primary">Unplaced (add to the lifecycle map)</h2>
            <span className="text-[11px] text-th-faint">{unplaced.length} capabilit{unplaced.length === 1 ? 'y' : 'ies'}</span>
          </div>
          <div className="section-card-body grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {unplaced.map((cap) => (
              <CapabilityCard key={cap.id} cap={cap} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
