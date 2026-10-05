import React from 'react';
import { Bot, ArrowRight, MessageSquareText } from 'lucide-react';
import { useAgentChat } from './RationalizationAgentChat';

/**
 * RoadmapTile — the agent surface on the Overview page. When the Rationalization
 * Agent is wired (BFF reports configured), this is a live launcher that opens the
 * chat drawer. When it isn't (pre-activation), it keeps the honest roadmap
 * framing. The header "Ask the Agent" button opens the same drawer.
 */
export default function RoadmapTile() {
  const { openAgent, available } = useAgentChat();

  return (
    <div className="relative overflow-hidden rounded-lg border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-sky-500/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-violet-500/15 p-2 shrink-0">
            <Bot size={18} className="text-violet-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-th-primary">Ask the Rationalization Agent</h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  available
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                    : 'border-violet-500/30 bg-violet-500/10 text-violet-500'
                }`}
              >
                {available ? 'Live' : 'Roadmap'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-th-muted max-w-xl">
              {available
                ? 'A headless Agentforce agent, grounded in Salesforce — ask it in plain language what Blackbaud already owns, where Salesforce overlaps a tool, or what’s a candidate to retire. Answers cite the capability records.'
                : 'A future headless Agentforce agent will answer this inventory in plain language, grounded in Salesforce and honoring the permission model. The backend seam is in place; it activates once Salesforce org access is provisioned.'}
            </p>
          </div>
        </div>
      </div>

      {available ? (
        <button
          onClick={() => openAgent()}
          className="mt-3 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: 'var(--bb-accent)' }}
        >
          <MessageSquareText size={13} /> Open the agent
        </button>
      ) : (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-violet-500/80">
          <span>Same pattern as the Siemens DISW knowledge agent</span>
          <ArrowRight size={12} />
        </div>
      )}
    </div>
  );
}
