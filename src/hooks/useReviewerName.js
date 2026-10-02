import { useState, useCallback } from 'react';

/**
 * The reviewer's display name, remembered in their own browser so they type it
 * once and it stamps every note they post. This is lightweight attribution (no
 * login) — enough to see who said what across the shared notes.
 */
const KEY = 'bb-reviewer-name';

export function useReviewerName() {
  const [name, setNameState] = useState(() => {
    try {
      return localStorage.getItem(KEY) || '';
    } catch {
      return '';
    }
  });

  const setName = useCallback((value) => {
    const v = (value || '').slice(0, 120);
    setNameState(v);
    try {
      if (v) localStorage.setItem(KEY, v);
      else localStorage.removeItem(KEY);
    } catch {
      /* storage disabled — name stays in-memory for the session */
    }
  }, []);

  return { name, setName };
}
