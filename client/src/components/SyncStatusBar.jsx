import React, { useState, useEffect } from 'react';
import { useSync } from '../context/SyncContext';
import { RefreshCw, Radio, Layers } from 'lucide-react';

export function SyncStatusBar() {
  const { syncStatus, triggerCheck } = useSync();
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

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-1.5 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${
              isSyncing ? 'bg-blue-500 animate-ping' : countdown > 0 ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span className="font-medium text-slate-700 text-[11px]">
              MCP Live Sync:
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {isSyncing ? 'Processing Tool...' : countdown > 0 ? `Next call allowed in ${countdown}s` : 'Ready'}
            </span>
          </div>

          <span className="text-slate-300">|</span>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            <Layers className="w-3 h-3" />
            <span>{syncStatus.counts?.pending || 0} queued operations</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Rate limit: 1 call / 65s
          </span>

          <button
            onClick={triggerCheck}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 text-[11px] font-medium transition disabled:opacity-50"
            title="Poll MCP get_signals"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default SyncStatusBar;
