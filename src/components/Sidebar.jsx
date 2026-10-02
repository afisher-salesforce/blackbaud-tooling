import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Table2, TrendingUp, RefreshCw, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutGrid },
  { to: '/map', label: 'Capability Map', icon: Table2 },
  { to: '/a2r', label: 'Awareness → Revenue', icon: TrendingUp },
  { to: '/i2r', label: 'Implement → Renew', icon: RefreshCw },
];

export default function Sidebar({ collapsed = false, onToggle }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[var(--table-header-bg)] border-r border-surface-border flex flex-col z-30 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Brand */}
      <div className={`h-14 flex items-center gap-2.5 border-b border-surface-border shrink-0 ${collapsed ? 'px-0 justify-center' : 'px-4'}`}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--bb-accent)' }}
          title="Blackbaud × Salesforce"
        >
          <Layers size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-xs font-bold text-th-primary leading-tight truncate">Blackbaud × Salesforce</div>
            <div className="text-[10px] text-th-muted leading-tight truncate">Capability Alignment</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 py-2 rounded-md text-[13px] transition-colors ${
                collapsed ? 'px-0 justify-center' : 'px-3'
              } ${
                isActive
                  ? 'font-medium text-[color:var(--bb-accent)] bg-[color-mix(in_srgb,var(--bb-accent)_12%,transparent)]'
                  : 'text-th-muted hover:text-th-secondary hover:bg-surface-card-hover'
              }`
            }
          >
            <Icon size={15} className="shrink-0" />
            {!collapsed && <span className="flex-1 min-w-0 truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Legend footer — alignment taxonomy key */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-surface-border shrink-0 space-y-1.5">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-th-faint mb-1">Alignment</div>
          {[
            ['bg-emerald-500', 'Native'],
            ['bg-sky-500', 'Integrates'],
            ['bg-violet-500', 'Data 360'],
            ['bg-amber-500', 'Partial'],
            ['bg-slate-400', 'Gap'],
            ['bg-rose-500', 'Discuss'],
          ].map(([dot, lbl]) => (
            <div key={lbl} className="flex items-center gap-2 text-[10px] text-th-faint">
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} /> {lbl}
            </div>
          ))}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-surface-border text-th-faint hover:text-th-secondary hover:bg-surface-card-hover transition-colors shrink-0"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
