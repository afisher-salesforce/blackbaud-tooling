import React from 'react';
import CapabilityTable from '../components/CapabilityTable';
import DisclaimerBanner from '../components/DisclaimerBanner';
import NotesExport from '../components/NotesExport';
import { CAPABILITIES, DOMAINS } from '../content/capabilities';

export default function CapabilityMap() {
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-th-primary">Capability map</h1>
          <p className="text-sm text-th-muted mt-1 max-w-2xl">
            Every capability in Blackbaud’s inventory against its draft Salesforce alignment. Filter by value stream,
            alignment, or domain; click a row to open the discussion and capture Blackbaud’s view.
          </p>
        </div>
        <NotesExport />
      </div>

      <DisclaimerBanner compact />

      <CapabilityTable rows={CAPABILITIES} domains={DOMAINS} />
    </div>
  );
}
