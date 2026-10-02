import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import CapabilityTable from '../components/CapabilityTable';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { capabilitiesByStream } from '../content/capabilities';
import { alignmentMeta, ALIGNMENT_ORDER } from '../content/alignment';

const COPY = {
  A2R: {
    icon: TrendingUp,
    title: 'Awareness → Revenue',
    lead:
      'The go-to-market value stream — marketing, sales, revenue operations, and the enablement that supports them. ' +
      'This is where the Clari and Gong conversations live, where the "you already own this" story is strongest, and ' +
      'where the marketing-automation question (Marketo) is genuinely unsettled. For the A2R Value Stream Lead: the aim ' +
      'is to agree what consolidates onto Salesforce, what integrates, and what stays specialized.',
  },
  I2R: {
    icon: RefreshCw,
    title: 'Implement → Renew',
    lead:
      'The post-sale value stream — onboarding, adoption, support, and renewals. Service Cloud (Voice, Workforce ' +
      'Engagement, Knowledge) anchors much of this, and customer-health (Gainsight) is the build-vs-buy conversation. ' +
      'For the I2R Value Stream Lead: the aim is to separate the support-platform consolidation from the specialized ' +
      'CS tooling, and to see where Data 360 unifies signal without ripping anything out.',
  },
};

export default function ValueStream({ stream }) {
  const rows = capabilitiesByStream(stream);
  const { icon: Icon, title, lead } = COPY[stream];
  const domains = [...new Set(rows.map((r) => r.domain))];

  // Mini alignment tally for this stream.
  const counts = rows.reduce((acc, c) => {
    acc[c.alignment] = (acc[c.alignment] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="section-card">
        <div className="section-card-body">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={18} style={{ color: 'var(--bb-accent)' }} />
            <h1 className="text-xl font-bold text-th-primary">{title}</h1>
          </div>
          <p className="text-sm text-th-muted leading-relaxed max-w-3xl">{lead}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {ALIGNMENT_ORDER.filter((k) => counts[k]).map((k) => {
              const meta = alignmentMeta(k);
              return (
                <div key={k} className="flex items-center gap-1.5 rounded-full border border-surface-border px-2.5 py-1">
                  <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                  <span className="text-xs font-bold text-th-primary">{counts[k]}</span>
                  <span className="text-[11px] text-th-muted">{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DisclaimerBanner compact />

      <CapabilityTable rows={rows} domains={domains} lockStream={stream} />
    </div>
  );
}
