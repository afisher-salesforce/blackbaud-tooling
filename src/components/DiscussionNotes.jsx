import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquarePlus, Send, Trash2, CircleDashed, Check } from 'lucide-react';
import { getNotesFor, addNote, deleteNote } from '../api/client';
import { useReviewerName } from '../hooks/useReviewerName';
import { useLocalNotes } from '../hooks/useLocalNotes';

/**
 * DiscussionNotes — the capture surface. Multiple reviewers comment on each
 * capability before Friday; notes pool together in Heroku Postgres via the BFF
 * and render as a thread with author + timestamp. A reviewer's name is kept in
 * their own browser (useReviewerName) so they type it once; they can delete
 * notes they posted under that name in this browser.
 *
 * GRACEFUL FALLBACK: if the BFF reports store:'local' (no DATABASE_URL), the
 * component falls back to the original single per-browser localStorage textarea
 * so local dev and un-provisioned deploys still work.
 */
function fmt(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function DiscussionNotes({ capabilityId }) {
  const { name, setName } = useReviewerName();
  const [store, setStore] = useState(null); // 'postgres' | 'local' | null (loading)
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const load = useCallback(() => {
    getNotesFor(capabilityId)
      .then((data) => {
        setStore(data.store);
        setNotes(data.notes || []);
      })
      .catch(() => setStore('local'));
  }, [capabilityId]);

  useEffect(() => {
    setStore(null);
    setNotes([]);
    setDraft('');
    setErr(null);
    load();
  }, [load]);

  const submit = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const { note } = await addNote({ capability: capabilityId, author: name || 'Anonymous', body: draft.trim() });
      setNotes((prev) => [...prev, note]);
      setDraft('');
    } catch (e) {
      setErr(e.message || 'Could not save note');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setErr(e.message || 'Could not delete note');
    }
  };

  // A reviewer may delete a note that matches their current name (case-insensitive).
  const canDelete = (note) => name && note.author && note.author.toLowerCase() === name.toLowerCase();

  // ── Local-only fallback (no shared store configured) ──
  if (store === 'local') return <LocalFallback capabilityId={capabilityId} />;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquarePlus size={16} style={{ color: 'var(--bb-accent)' }} />
          <span className="text-sm font-semibold text-th-secondary">Discussion notes</span>
        </div>
        <span className="text-[10px] font-medium text-th-faint uppercase tracking-wider">Shared · all reviewers</span>
      </div>
      <p className="text-[11px] text-th-muted mb-3 leading-relaxed">
        Capture your reaction to this placement — agree / disagree, how the tool is really used, who owns it. Notes are
        shared across everyone reviewing the site.
      </p>

      {/* Existing thread */}
      {store === null && (
        <div className="flex items-center gap-2 text-xs text-th-muted mb-3">
          <CircleDashed size={13} className="animate-spin" /> Loading notes…
        </div>
      )}
      {store === 'postgres' && notes.length > 0 && (
        <ul className="space-y-2 mb-4">
          {notes.map((n) => (
            <li key={n.id} className="rounded-md border border-surface-border bg-surface-card-hover p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-th-secondary">{n.author || 'Anonymous'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-th-faint">{fmt(n.createdAt)}</span>
                  {canDelete(n) && (
                    <button
                      onClick={() => remove(n.id)}
                      className="text-th-faint hover:text-rose-500 transition-colors"
                      title="Delete your note"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-th-muted leading-relaxed whitespace-pre-wrap">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
      {store === 'postgres' && notes.length === 0 && (
        <p className="text-xs text-th-faint mb-3 italic">No notes yet — add the first.</p>
      )}

      {/* Composer */}
      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (remembered on this device)"
          className="w-full rounded-md border border-surface-border bg-surface-card px-3 py-1.5 text-xs focus:outline-none focus:border-[color:var(--bb-accent)]"
        />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="e.g. Marketo is entrenched for identity — revisit after the web/personalization work."
          className="w-full rounded-md border border-surface-border bg-surface-card px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:border-[color:var(--bb-accent)]"
        />
        <div className="flex items-center justify-between">
          {err ? <span className="text-[11px] text-rose-500">{err}</span> : <span />}
          <button
            onClick={submit}
            disabled={!draft.trim() || busy}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'var(--bb-accent)' }}
          >
            {busy ? <CircleDashed size={13} className="animate-spin" /> : <Send size={13} />}
            Post note
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * LocalFallback — the original single per-browser note, used only when no shared
 * store is configured (local dev without Postgres). Keeps local work intact.
 */
function LocalFallback({ capabilityId }) {
  const { note, setNote } = useLocalNotes(capabilityId);
  const saved = note.trim().length > 0;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquarePlus size={16} style={{ color: 'var(--bb-accent)' }} />
          <span className="text-sm font-semibold text-th-secondary">Discussion notes</span>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
            <Check size={11} /> Saved locally
          </span>
        )}
      </div>
      <p className="text-[11px] text-th-muted mb-2 leading-relaxed">
        Shared notes store isn’t configured here, so this note is saved in this browser only.
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Capture Blackbaud’s reaction to this placement…"
        className="w-full rounded-md border border-surface-border bg-surface-card px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:border-[color:var(--bb-accent)]"
      />
    </div>
  );
}
