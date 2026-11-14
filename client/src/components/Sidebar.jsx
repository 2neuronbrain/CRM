import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Clock, 
  CheckSquare, 
  HeartHandshake, 
  Briefcase, 
  Users, 
  AlertTriangle, 
  HelpCircle, 
  FileSearch, 
  Radio, 
  FileEdit, 
  Send,
  Plus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useSync } from '../context/SyncContext';

export function Sidebar({ onOpenAddAccount, onOpenCreateTask }) {
  const { syncStatus, secondsUntilAllowed, triggerManualSync, isTriggeringSync } = useSync();

  const coreNav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/accounts', label: 'Accounts', icon: Building2 },
    { to: '/timeline', label: 'Interaction Timeline', icon: Clock, badge: 'Live' },
    { to: '/tasks', label: 'Priority Tasks', icon: CheckSquare },
  ];

  const intelNav = [
    { to: '/sentiment', label: 'Customer Sentiment', icon: HeartHandshake },
    { to: '/deals', label: 'Deals & Valuation', icon: Briefcase },
    { to: '/power-map', label: 'Power Map', icon: Users },
    { to: '/risks', label: 'Risk Radar', icon: AlertTriangle },
    { to: '/blind-spots', label: 'Blind Spots', icon: HelpCircle },
  ];

  const auditNav = [
    { to: '/evidence', label: 'Evidence Vault', icon: FileSearch },
    { to: '/activity', label: 'Telemetry & Logs', icon: Radio },
    { to: '/notes', label: 'MCP Write-Back', icon: FileEdit },
    { to: '/hand-in', label: 'Hand In Links', icon: Send, highlight: true },
  ];

  const isRateLimited = secondsUntilAllowed > 0;

  return (
    <aside className="w-64 min-w-[16rem] h-screen sticky top-0 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-900/50">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs tracking-wider shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            C
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-tight text-white font-mono">
              CRM
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700/60 font-medium">
              v1.0
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5" title="Live SSE Feed Active">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-3 border-b border-slate-800/60 grid grid-cols-2 gap-2">
        <button
          onClick={onOpenAddAccount}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-md text-xs font-medium border border-slate-700/80 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Account</span>
        </button>
        <button
          onClick={onOpenCreateTask}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-md text-xs font-medium border border-slate-700/80 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Task</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 text-xs">
        {/* Core CRM */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Core Operations
          </div>
          <nav className="space-y-0.5">
            {coreNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-2.5 py-1.5 rounded-md font-medium transition ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500 pl-2'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-semibold px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Intelligence Radar */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Deep Intelligence
          </div>
          <nav className="space-y-0.5">
            {intelNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-medium transition ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500 pl-2'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Records & System */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Records & Handover
          </div>
          <nav className="space-y-0.5">
            {auditNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-medium transition ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500 pl-2'
                        : item.highlight
                        ? 'text-emerald-400/90 hover:bg-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer MCP Rate Limiter & Sync Widget */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-950/60">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            MCP Synchronization
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
            isRateLimited ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
          }`}>
            {isRateLimited ? `${secondsUntilAllowed}s Cooldown` : 'Ready'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
          <span>Queue: {syncStatus.pendingQueueCount || 0}</span>
          <span>1 call / 65s</span>
        </div>

        <button
          onClick={triggerManualSync}
          disabled={isTriggeringSync}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded border border-slate-700/80 transition shadow-sm active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isTriggeringSync ? 'animate-spin' : ''}`} />
          <span>{isTriggeringSync ? 'Enqueuing...' : 'Sync Live Signals'}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
