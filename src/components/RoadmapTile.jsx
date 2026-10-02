import React from 'react';
import { Bot, ArrowRight } from 'lucide-react';

/**
 * RoadmapTile — the reserved future-agent surface. The site is a discussion
 * canvas today; this tile sets expectations for a Headless 360 / Aiforce
 * "rationalization agent" that will let stakeholders ask the inventory questions
 * in natural language, grounded in Salesforce. It is honestly labeled ROADMAP —
 * the BFF agent seam exists but is disabled until Blackbaud provisions org
 * access (mirrors the DISW Knowledge agent architecture).
 */
export default function RoadmapTile() {
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
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-500">
                Roadmap
              </span>
            </div>
            <p className="text-xs leading-relaxed text-th-muted max-w-xl">
              A future headless Agentforce agent will let anyone ask this inventory in plain language —
              “Where does Salesforce overlap with our Revenue Intelligence stack?”, “What integrates vs. replaces?” —
              grounded in Salesforce and honoring the permission model. The backend seam is already in place;
              it activates once Blackbaud provisions Salesforce org access.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-violet-500/80">
        <span>Same pattern as the Siemens DISW knowledge agent</span>
        <ArrowRight size={12} />
      </div>
    </div>
  );
}
