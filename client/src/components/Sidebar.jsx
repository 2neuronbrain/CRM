import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Clock, CheckSquare, HeartHandshake, 
  Briefcase, Users, AlertTriangle, HelpCircle, FileSearch, Radio, 
  FileEdit, Send, Plus, RefreshCw
} from 'lucide-react';
import { useSync } from '../context/SyncContext';

export function Sidebar({ onOpenAddAccount, onOpenCreateTask }) {
  const { syncStatus, secondsUntilAllowed, triggerManualSync, isTriggeringSync } = useSync();

  const coreNav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/accounts', label: 'Accounts', icon: Building2 },
    { to: '/timeline', label: 'Timeline', icon: Clock, badge: 'Live' },
    { to: '/tasks', label: 'Priority Tasks', icon: CheckSquare },
  ];

  const intelNav = [
    { to: '/sentiment', label: 'Sentiment', icon: HeartHandshake },
    { to: '/deals', label: 'Deals', icon: Briefcase },
    { to: '/power-map', label: 'Power Map', icon: Users },
    { to: '/risks', label: 'Risk Radar', icon: AlertTriangle },
    { to: '/blind-spots', label: 'Blind Spots', icon: HelpCircle },
  ];

  const auditNav = [
    { to: '/evidence', label: 'Evidence', icon: FileSearch },
    { to: '/activity', label: 'Telemetry', icon: Radio },
    { to: '/notes', label: 'Write-Back', icon: FileEdit },
    { to: '/hand-in', label: 'Hand-In', icon: Send },
  ];

  const isRateLimited = secondsUntilAllowed > 0;

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-[7px] rounded-lg text-[13px] font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-blue-500/10 text-blue-400'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
    }`;

  return (
    <aside className="w-56 min-w-[14rem] h-screen sticky top-0 flex flex-col bg-zinc-900 border-r border-zinc-800/70 text-zinc-300 select-none z-30">
      {/* Brand */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800/60">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            C
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-100">
            CRM
          </span>
        </Link>
        <span className="relative flex h-2 w-2" title="Live">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-zinc-800/50 grid grid-cols-2 gap-2">
        <button
          onClick={onOpenAddAccount}
          className="flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          Account
        </button>
        <button
          onClick={onOpenCreateTask}
          className="flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-violet-400" />
          Task
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 text-[13px]">
        <NavSection label="Operations">
          {coreNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 opacity-70" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </NavSection>

        <NavSection label="Intelligence">
          {intelNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 opacity-70" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </NavSection>

        <NavSection label="Records">
          {auditNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 opacity-70" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </NavSection>
      </div>

      {/* MCP Footer */}
      <div className="p-3 border-t border-zinc-800/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            MCP Sync
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            isRateLimited 
              ? 'bg-amber-500/10 text-amber-400' 
              : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            {isRateLimited ? `${secondsUntilAllowed}s` : 'Ready'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2">
          <span>Queue: {syncStatus.pendingQueueCount || 0}</span>
          <span>1 / 65s</span>
        </div>

        <button
          onClick={triggerManualSync}
          disabled={isTriggeringSync}
          className="w-full flex items-center justify-center gap-2 py-1.5 bg-zinc-800/70 hover:bg-zinc-700/70 disabled:opacity-40 text-zinc-300 text-xs font-medium rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isTriggeringSync ? 'animate-spin' : ''}`} />
          {isTriggeringSync ? 'Syncing...' : 'Sync Signals'}
        </button>
      </div>
    </aside>
  );
}

function NavSection({ label, children }) {
  return (
    <div>
      <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
        {label}
      </div>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  );
}

export default Sidebar;
