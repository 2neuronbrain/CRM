import React, { useState, useEffect } from 'react';
import { useSync } from '../context/SyncContext';
import { RefreshCw, Radio, Layers, ShieldCheck } from 'lucide-react';

export function SyncStatusBar() {
  const { syncStatus, secondsUntilAllowed, triggerManualSync, isTriggeringSync } = useSync();
  const isSyncing = syncStatus.syncState === 'syncing' || isTriggeringSync;

  return (
    <div className="bg-slate-900/70 backdrop-blur border-b border-slate-800 px-6 py-2.5 text-xs text-slate-400 shrink-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Engine Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              isSyncing 
                ? 'bg-indigo-400 animate-ping' 
                : secondsUntilAllowed > 0 
                ? 'bg-amber-400' 
                : 'bg-emerald-400'
            }`} />
            <span className="font-medium text-slate-200 text-xs">
              Live Provenance Engine
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span>
              {isSyncing 
                ? 'Executing tool...' 
                : secondsUntilAllowed > 0 
                ? `Rate limit safe: ${secondsUntilAllowed}s cooldown` 
                : 'MCP Rate Limiter: Ready'}
            </span>
          </div>
        </div>

        {/* Right: Queue & Verification Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{syncStatus.pendingQueueCount || 0} queued calls</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Verified MVP</span>
          </div>

          <button
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs font-medium transition disabled:opacity-50 active:scale-95 shadow-sm"
            title="Poll MCP get_signals"
          >
            <RefreshCw className={`w-3 h-3 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SyncStatusBar;
