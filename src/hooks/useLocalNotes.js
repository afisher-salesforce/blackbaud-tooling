import { useState, useEffect, useCallback } from 'react';

/**
 * Per-capability discussion notes, persisted client-side.
 *
 * This is the "alignment capture" half of the discussion canvas: during Friday's
 * review, Enterprise Architecture and the Value Stream Leads react to each
 * capability, and those reactions are captured here. Notes live in localStorage
 * (no backend write) under one namespaced key per capability id, so they survive
 * reload and are portable via the Export button.
 *
 * Returns { note, setNote } for a single capability.
 */
const KEY_PREFIX = 'bb-notes:';

export function useLocalNotes(capabilityId) {
  const key = `${KEY_PREFIX}${capabilityId}`;
  const [note, setNoteState] = useState('');

  useEffect(() => {
    try {
      setNoteState(localStorage.getItem(key) || '');
    } catch {
      setNoteState('');
    }
  }, [key]);

  const setNote = useCallback(
    (value) => {
      setNoteState(value);
      try {
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
      } catch {
        /* storage disabled — notes stay in-memory for the session */
      }
    },
    [key]
  );

  return { note, setNote };
}

/**
 * Read ALL captured notes as a { capabilityId: text } map. Used by the Export
 * button so one click produces the full set of Friday's input, not just the
 * current page.
 */
export function readAllNotes() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) {
        const id = k.slice(KEY_PREFIX.length);
        const val = localStorage.getItem(k);
        if (val && val.trim()) out[id] = val;
      }
    }
  } catch {
    /* storage disabled */
  }
  return out;
}

export function clearAllNotes() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* no-op */
  }
}
