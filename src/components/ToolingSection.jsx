import React, { useEffect, useState, useCallback } from 'react';
import { Package, Save, Check, CircleDashed } from 'lucide-react';
import { getTools, updateTool } from '../api/client';

/**
 * ToolingSection — the "Blackbaud tooling" capture surface on a capability detail
 * page, below the discussion notes. Lists the tools under this capability (read
 * live from Salesforce) and lets the reviewer capture 4 commercial fields per
 * tool — Priority, Contract Maturity (date), Users, Contract Amount — writing
 * each back to BB_Tool__c via the BFF. Partial/optional: save only what's filled.
 *
 * Degrades gracefully: if Salesforce isn't configured (501) the section shows a
 * quiet note instead of erroring; if writes are disabled (403) the inputs show
 * read-only state with a message.
 *
 * Props: capabilityExternalId — the capability's External_Id__c (e.g. "revenue-forecasting").
 */
const FIELDS = ['priority', 'contractMaturity', 'users', 'contractAmount'];

export default function ToolingSection({ capabilityExternalId }) {
  const [state, setState] = useState({ loading: true, available: true, tools: [], error: null });
  const [edits, setEdits] = useState({}); // externalId -> {field: value}
  const [saving, setSaving] = useState({}); // externalId -> 'saving' | 'saved' | error string

  const load = useCallback(() => {
    setState({ loading: true, available: true, tools: [], error: null });
    getTools(capabilityExternalId)
      .then((data) => setState({ loading: false, available: true, tools: data.tools || [], error: null }))
      .catch((err) => {
        if (err.status === 501) setState({ loading: false, available: false, tools: [], error: null });
        else setState({ loading: false, available: true, tools: [], error: err.message });
      });
  }, [capabilityExternalId]);

  useEffect(() => {
    load();
  }, [load]);

  const fieldValue = (tool, field) => {
    const e = edits[tool.externalId];
    if (e && e[field] !== undefined) return e[field];
    return tool[field] ?? '';
  };

  const setField = (externalId, field, value) => {
    setEdits((prev) => ({ ...prev, [externalId]: { ...prev[externalId], [field]: value } }));
    setSaving((prev) => ({ ...prev, [externalId]: undefined }));
  };

  const save = async (tool) => {
    const e = edits[tool.externalId];
    if (!e) return;
    setSaving((prev) => ({ ...prev, [tool.externalId]: 'saving' }));
    try {
      await updateTool(tool.externalId, e);
      setSaving((prev) => ({ ...prev, [tool.externalId]: 'saved' }));
      // reflect saved values into the base row, clear the edit buffer
      setState((s) => ({
        ...s,
        tools: s.tools.map((t) => (t.externalId === tool.externalId ? { ...t, ...e } : t)),
      }));
      setEdits((prev) => {
        const next = { ...prev };
        delete next[tool.externalId];
        return next;
      });
    } catch (err) {
      setSaving((prev) => ({
        ...prev,
        [tool.externalId]: err.status === 403 ? 'Writes are disabled on this deployment.' : err.message,
      }));
    }
  };

  const { loading, available, tools, error } = state;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Package size={16} style={{ color: 'var(--bb-accent)' }} />
        <span className="text-sm font-semibold text-th-secondary">Blackbaud tooling</span>
        <span className="text-[10px] font-medium text-th-faint uppercase tracking-wider">captured to Salesforce</span>
      </div>
      <p className="text-[11px] text-th-muted mb-3 leading-relaxed">
        Capture the commercial facts for the tool(s) under this capability — priority, contract maturity, users, and
        annual contract amount. Optional, point-in-time; saved to Salesforce for the rationalization record.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-th-muted">
          <CircleDashed size={13} className="animate-spin" /> Loading tooling…
        </div>
      )}

      {!loading && !available && (
        <p className="text-xs text-th-faint italic">
          Salesforce isn’t connected on this deployment, so tooling capture is unavailable here.
        </p>
      )}

      {!loading && available && error && (
        <p className="text-xs text-rose-500">Couldn’t load tooling: {error}</p>
      )}

      {!loading && available && !error && tools.length === 0 && (
        <p className="text-xs text-th-faint italic">No tools recorded under this capability.</p>
      )}

      {!loading && available && tools.length > 0 && (
        <div className="space-y-3">
          {tools.map((tool) => {
            const dirty = !!edits[tool.externalId];
            const status = saving[tool.externalId];
            return (
              <div key={tool.externalId} className="rounded-md border border-surface-border bg-surface-card-hover p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-th-primary">{tool.name}</span>
                  <div className="flex items-center gap-2">
                    {status === 'saved' && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                        <Check size={11} /> Saved
                      </span>
                    )}
                    {typeof status === 'string' && status !== 'saving' && status !== 'saved' && (
                      <span className="text-[10px] text-rose-500">{status}</span>
                    )}
                    <button
                      onClick={() => save(tool)}
                      disabled={!dirty || status === 'saving'}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-white transition-colors disabled:opacity-40"
                      style={{ backgroundColor: 'var(--bb-accent)' }}
                    >
                      {status === 'saving' ? <CircleDashed size={11} className="animate-spin" /> : <Save size={11} />}
                      Save
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="text-[10px] text-th-faint">
                    Priority
                    <select
                      value={fieldValue(tool, 'priority')}
                      onChange={(e) => setField(tool.externalId, 'priority', e.target.value)}
                      className="mt-0.5 w-full rounded border border-surface-border bg-surface-card px-2 py-1 text-xs"
                    >
                      <option value="">—</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </label>
                  <label className="text-[10px] text-th-faint">
                    Contract maturity
                    <input
                      type="date"
                      value={fieldValue(tool, 'contractMaturity')}
                      onChange={(e) => setField(tool.externalId, 'contractMaturity', e.target.value)}
                      className="mt-0.5 w-full rounded border border-surface-border bg-surface-card px-2 py-1 text-xs"
                    />
                  </label>
                  <label className="text-[10px] text-th-faint">
                    Users
                    <input
                      type="number"
                      min="0"
                      value={fieldValue(tool, 'users')}
                      onChange={(e) => setField(tool.externalId, 'users', e.target.value)}
                      className="mt-0.5 w-full rounded border border-surface-border bg-surface-card px-2 py-1 text-xs"
                    />
                  </label>
                  <label className="text-[10px] text-th-faint">
                    Contract amount ($)
                    <input
                      type="number"
                      min="0"
                      value={fieldValue(tool, 'contractAmount')}
                      onChange={(e) => setField(tool.externalId, 'contractAmount', e.target.value)}
                      className="mt-0.5 w-full rounded border border-surface-border bg-surface-card px-2 py-1 text-xs"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
