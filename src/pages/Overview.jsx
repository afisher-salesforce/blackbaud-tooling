import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import HeatmapGrid from '../components/HeatmapGrid';
import RoadmapTile from '../components/RoadmapTile';
import AlignmentChip from '../components/AlignmentChip';
import { CAPABILITIES, TOOL_COUNT, alignmentCounts, capabilitiesByStream, licensedCount, consolidationCandidates, entitlementsOwnedCount } from '../content/capabilities';
import { ALIGNMENT_ORDER, alignmentMeta } from '../content/alignment';
import { ENTITLEMENT_DISCLAIMER } from '../content/entitlements';
import { BadgeCheck } from 'lucide-react';

function Stat({ value, label }) {
  return (
    <div className="metric-card text-center">
      <div className="hero-metric">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-th-faint mt-1">{label}</div>
    </div>
  );
}

export default function Overview() {
  const counts = alignmentCounts();
  const a2r = capabilitiesByStream('A2R').length;
  const i2r = capabilitiesByStream('I2R').length;
  const licensed = licensedCount();
  const entitlementsOwned = entitlementsOwnedCount();
  const consolidationRows = consolidationCandidates();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-surface-card p-8">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={18} style={{ color: 'var(--bb-accent)' }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--bb-accent)' }}>
            Application Rationalization · Discussion Canvas
          </span>
        </div>
        <h1 className="text-2xl font-bold text-th-primary leading-tight mb-3 max-w-3xl">
          Where does Salesforce already cover what Blackbaud runs today?
        </h1>
        <p className="text-sm text-th-muted leading-relaxed max-w-3xl mb-4">
          Blackbaud operates <strong className="text-th-secondary">{TOOL_COUNT} tools</strong> across the
          Awareness-to-Revenue and Implement-to-Renew value streams. This canvas maps each capability against the
          Salesforce platform Blackbaud already invests in — not to declare winners, but to give Enterprise
          Architecture and the Value Stream Leads a structured place to react, correct, and decide what to explore.
          The anchor question throughout: <em className="text-th-secondary">which of these do you already own?</em>
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/map"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--bb-accent)' }}
          >
            Open the capability map <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <DisclaimerBanner />

      {/* "Start inward first" — the already-licensed story */}
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-500/15 p-2 shrink-0">
            <BadgeCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
              Start inward first — build the platform you already own
            </h2>
            <p className="text-sm text-th-secondary leading-relaxed max-w-3xl">
              Blackbaud already owns <strong>{entitlementsOwned}</strong> Salesforce entitlements, covering{' '}
              <strong>{licensed}</strong> of the capabilities on this map — and <strong>{consolidationRows.length}</strong>{' '}
              of those overlap a third-party tool Blackbaud also runs, so the work could be consolidated onto the
              platform you already own and reduce context-switching across applications. Several active RFPs
              (forecasting, CLM) are for capabilities Blackbaud already pays for. Filter the map to{' '}
              <Link to="/map" className="font-medium underline" style={{ color: 'var(--bb-accent)' }}>
                “Owned · overlaps a tool”
              </Link>{' '}
              to see them. Consolidation is a platform-strategy discussion, not a directive to retire tools —
              contract terms and prior investment decide what actually moves.
            </p>
            <p className="text-[11px] text-th-faint mt-2 italic">{ENTITLEMENT_DISCLAIMER}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat value={TOOL_COUNT} label="Tools in scope" />
        <Stat value={CAPABILITIES.length} label="Capability areas assessed" />
        <Stat value={entitlementsOwned} label="Salesforce entitlements owned" />
        <Stat value={licensed} label="Capabilities already covered" />
        <Stat value={consolidationRows.length} label="Overlap · consolidation candidates" />
      </div>

      {/* Alignment distribution */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="text-sm font-semibold text-th-primary">Draft alignment distribution</h2>
          <span className="text-[11px] text-th-faint">preliminary — for discussion</span>
        </div>
        <div className="section-card-body">
          <div className="flex flex-wrap gap-3">
            {ALIGNMENT_ORDER.map((k) => {
              const meta = alignmentMeta(k);
              const n = counts[k] || 0;
              return (
                <div key={k} className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                  <span className="text-sm font-bold text-th-primary">{n}</span>
                  <span className="text-xs text-th-muted">{meta.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-th-faint mt-3 leading-relaxed max-w-3xl">
            “Native” and “Integrates” are the heart of the consolidation story — capabilities Blackbaud can run on the
            Salesforce investment they already hold. “Gap” counts are shown honestly: naming where Salesforce does not
            play is what makes the rest credible.
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <HeatmapGrid />

      {/* Value stream shortcuts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/a2r" className="metric-card flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} style={{ color: 'var(--bb-accent)' }} />
            <div>
              <div className="text-sm font-semibold text-th-primary">Awareness → Revenue</div>
              <div className="text-xs text-th-muted">{a2r} capabilities · marketing, sales, revenue ops</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-th-faint group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link to="/i2r" className="metric-card flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} style={{ color: 'var(--bb-accent)' }} />
            <div>
              <div className="text-sm font-semibold text-th-primary">Implement → Renew</div>
              <div className="text-xs text-th-muted">{i2r} capabilities · onboarding, support, renewals</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-th-faint group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Future-agent roadmap */}
      <RoadmapTile />
    </div>
  );
}
