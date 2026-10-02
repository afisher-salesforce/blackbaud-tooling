import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Sidebar, { NAV_ITEMS } from './Sidebar';
import ThemeToggle from './ThemeToggle';
import ConnectionStatus from './ConnectionStatus';

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const current = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to));
  const pageTitle = current ? current.label : 'Capability Alignment';

  return (
    <div className="min-h-screen bg-surface-bg">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <header className="sticky top-0 z-20 h-14 bg-[var(--table-header-bg)]/80 backdrop-blur-xl border-b border-surface-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-th-secondary tracking-wide">{pageTitle}</h1>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bb-accent) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--bb-accent) 25%, transparent)',
              }}
            >
              <Sparkles size={10} style={{ color: 'var(--bb-accent)' }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--bb-accent)' }}>
                Discussion Canvas
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <ThemeToggle />
            <div className="w-px h-6 bg-surface-border mx-1" />
            <span className="text-sm text-th-muted hidden sm:inline">Salesforce SE</span>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
