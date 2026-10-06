import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Users, Cloud, FileText, UserCheck, HelpCircle, BadgeCheck } from 'lucide-react';
import AlignmentChip from '../components/AlignmentChip';
import EntitlementChip from '../components/EntitlementChip';
import OverlapCallout from '../components/OverlapCallout';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DiscussionNotes from '../components/DiscussionNotes';
import ToolingSection from '../components/ToolingSection';
import TrailheadRail from '../components/TrailheadRail';
import { getCapability, capabilityEntitlement } from '../content/capabilities';
import { alignmentMeta } from '../content/alignment';
import { ENTITLEMENT_DISCLAIMER } from '../content/entitlements';

function Field({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-th-faint mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-th-faint">{label}</div>
        <div className="text-sm text-th-secondary">{children}</div>
      </div>
    </div>
  );
}

export default function CapabilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cap = getCapability(id);

  if (!cap) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-sm text-th-muted mb-4">That capability wasn’t found.</p>
        <Link to="/map" className="text-sm font-medium" style={{ color: 'var(--bb-accent)' }}>
          ← Back to the capability map
        </Link>
      </div>
    );
  }

  const meta = alignmentMeta(cap.alignment);
  const ent = capabilityEntitlement(cap);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-th-muted hover:text-th-secondary transition-colors"
      >
        <ArrowLeft size={13} /> Back
      </button>

      {/* Header */}
      <div className="section-card">
        <div className="section-card-body">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-th-faint mb-1">
                {cap.domain} · {cap.valueStream === 'A2R' ? 'Awareness → Revenue' : 'Implement → Renew'}
              </div>
              <h1 className="text-xl font-bold text-th-primary">{cap.subCapability}</h1>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <AlignmentChip value={cap.alignment} />
              <EntitlementChip status={ent.status} expiry={ent.info?.expiry} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Field icon={Package} label="Tool(s) in use">{cap.tools.join(', ')}</Field>
            <Field icon={Users} label="Primary users">{cap.primaryUsers}</Field>
            <Field icon={Cloud} label="Salesforce">
              {cap.sfProducts && cap.sfProducts.length ? cap.sfProducts.join(', ') : '— (no direct Salesforce product)'}
            </Field>
            <Field icon={HelpCircle} label="Alignment meaning">{meta.description}</Field>
            {ent.info?.products?.length ? (
              <Field icon={BadgeCheck} label="Licensed via">
                {ent.info.products.join(', ')}
                {ent.info.expiry ? <span className="text-amber-500"> · term ends {ent.info.expiry}</span> : null}
              </Field>
            ) : null}
          </div>
        </div>
      </div>

      {/* "You already own an overlapping capability" — owned AND overlaps a tool */}
      {['owned', 'owned-expiring'].includes(ent.status) && cap.overlaps?.length ? (
        <OverlapCallout products={ent.info?.products || []} overlaps={cap.overlaps} expiring={ent.info?.expiry} />
      ) : null}

      {ent.status !== 'na' && (
        <p className="text-[11px] text-th-faint italic px-1">{ENTITLEMENT_DISCLAIMER}</p>
      )}

      {/* Draft note + SE review */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={15} className="text-th-faint" />
            <span className="text-sm font-semibold text-th-secondary">Christa’s draft analysis</span>
          </div>
          <p className="text-sm text-th-muted leading-relaxed">{cap.draftNote}</p>
          <p className="text-[10px] text-th-faint mt-2 italic">
            Shared quickly (partly Gemini-assisted); not yet validated — a starting point, not a conclusion.
          </p>
        </div>
        <div className="card p-5" style={{ borderColor: 'color-mix(in srgb, var(--bb-accent) 30%, var(--surface-border))' }}>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck size={15} style={{ color: 'var(--bb-accent)' }} />
            <span className="text-sm font-semibold text-th-secondary">Salesforce SE review</span>
          </div>
          <p className="text-sm text-th-muted leading-relaxed">{cap.seReview}</p>
        </div>
      </div>

      {/* Discussion prompts */}
      {cap.discussionPrompts && cap.discussionPrompts.length > 0 && (
        <div className="card p-5">
          <span className="text-sm font-semibold text-th-secondary">Questions to put to the room</span>
          <ul className="mt-2 space-y-2">
            {cap.discussionPrompts.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-th-muted leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--bb-accent)' }} />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Discussion notes capture */}
      <DiscussionNotes capabilityId={cap.id} />

      {/* Blackbaud tooling capture — per-tool commercial fields written to Salesforce */}
      <ToolingSection capabilityExternalId={cap.id} />

      {/* Trailhead learning rail — only where SF aligns and a path is staged */}
      {cap.trailheadSlug && <TrailheadRail slug={cap.trailheadSlug} />}

      <DisclaimerBanner compact />
    </div>
  );
}
