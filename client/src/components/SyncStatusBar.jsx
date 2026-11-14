import React, { useState, useEffect } from 'react';
import { useSync } from '../context/SyncContext';
import { RefreshCw, Clock, CheckCircle2, AlertTriangle, Layers, Radio, Play } from 'lucide-react';

export function SyncStatusBar() {
  const { syncStatus, triggerCheck, triggerInitialSync } = useSync();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!syncStatus.nextAllowedRequestAt) {
      setCountdown(0);
      return;
    }

    const target = new Date(syncStatus.nextAllowedRequestAt).getTime();
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setCountdown(remaining);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [syncStatus.nextAllowedRequestAt]);

  const isSyncing = syncStatus.syncState === 'syncing';
  const hasError = syncStatus.syncState === 'error';

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 text-xs text-slate-600 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Status & Engine info */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isSyncing ? (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              ) : countdown > 0 ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              )}
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-500" />
              Live MCP Bridge:
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
              isSyncing ? 'bg-blue-100 text-blue-700 animate-pulse' :
              hasError ? 'bg-rose-100 text-rose-700' :
              countdown > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isSyncing ? 'Processing Tool...' : countdown > 0 ? `Cooldown (${countdown}s)` : 'Ready'}
            </span>
          </div>

          {/* Rate limiter safe interval notice */}
          <div className="hidden sm:flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Token Rate Limit: 1 call / 65s</span>
          </div>

          {/* Pending Queue count */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-700">
              {syncStatus.counts?.pending || 0} queued
            </span>
          </div>
        </div>

        {/* Right: Last Sync, Events, Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500">
            <span>
              Last Sync:{' '}
              <strong className="text-slate-700">
                {syncStatus.lastSuccessfulSyncAt
                  ? new Date(syncStatus.lastSuccessfulSyncAt).toLocaleTimeString()
                  : 'Pending'}
              </strong>
            </span>
            {syncStatus.lastError && (
              <span className="text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Error recorded
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerCheck}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium border border-slate-300 transition text-[11px] disabled:opacity-50"
              title="Enqueue a live signal discovery call via rate limiter"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Check Signals
            </button>

            <button
              onClick={triggerInitialSync}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition text-[11px] shadow-sm"
              title="Queue full paperwork and accounts initial ingestion"
            >
              <Play className="w-3 h-3" />
              Full Ingestion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SyncStatusBar;
