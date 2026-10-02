import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, CircleDashed } from 'lucide-react';
import { getHealth } from '../api/client';

/**
 * ConnectionStatus — compact header indicator for the BFF. Green when the BFF is
 * up (the Trailhead catalog is served), grey while checking, red if unreachable.
 * The future rationalization agent shows as "pending" in the popover until it is
 * wired. Detail text is revealed on click so the pages stay clean for the demo.
 */
export default function ConnectionStatus() {
  const [health, setHealth] = useState(null);
  const [healthErr, setHealthErr] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealthErr(true));
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  let tone; // 'live' | 'down' | 'checking'
  if (healthErr) tone = 'down';
  else if (!health) tone = 'checking';
  else tone = 'live';

  const dotClass = { live: 'bg-emerald-500', down: 'bg-rose-500', checking: 'bg-th-faint' }[tone];
  const label = { live: 'Connected', down: 'Offline', checking: 'Checking' }[tone];
  const Icon = tone === 'down' ? WifiOff : tone === 'checking' ? CircleDashed : Wifi;
  const iconClass = {
    live: 'text-emerald-500',
    down: 'text-rose-500',
    checking: 'text-th-faint animate-spin',
  }[tone];

  const detail = healthErr ? (
    <>
      BFF not reachable — run <span className="font-mono text-th-secondary">npm run dev:server</span>. The
      discussion content renders without it; only the Trailhead rail needs it.
    </>
  ) : health ? (
    <>
      BFF is up and serving the Trailhead catalog.{' '}
      {health.agentConfigured
        ? 'Rationalization agent is wired.'
        : 'Rationalization agent is on the roadmap (activates with Salesforce org access).'}
    </>
  ) : (
    'Checking connection…'
  );

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-surface-border hover:bg-surface-card-hover transition-colors"
        title="Connection status"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="relative flex h-2 w-2">
          {tone === 'live' && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClass}`} />
        </span>
        <span className="text-[11px] font-medium text-th-muted hidden md:inline">{label}</span>
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute right-0 mt-2 w-72 rounded-lg border border-surface-border bg-surface-card shadow-card-hover p-3 z-30"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Icon size={14} className={iconClass} />
            <span className="text-xs font-semibold text-th-secondary">Connection status</span>
          </div>
          <p className="text-xs text-th-muted leading-relaxed">{detail}</p>
        </div>
      )}
    </div>
  );
}
