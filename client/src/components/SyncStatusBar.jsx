import React from 'react';
import { useSync } from '../context/SyncContext';
import { Radio, ShieldCheck } from 'lucide-react';

export function SyncStatusBar() {
  const { syncStatus, secondsUntilAllowed } = useSync();
  const isRateLimited = secondsUntilAllowed > 0;

  return (
    <div className="h-9 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-900/60 text-[11px] shrink-0">
      <div className="flex items-center gap-3 text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-emerald-400" />
          <span className="font-medium text-zinc-300">Provenance Engine</span>
        </div>
        <span className="text-zinc-600">•</span>
        <span>
          Rate: {isRateLimited ? `${secondsUntilAllowed}s cooldown` : 'ready'}
        </span>
      </div>

      <div className="flex items-center gap-3 text-zinc-400">
        <span>{syncStatus.totalQueuedCalls || 0} queued calls</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="text-zinc-300 font-medium">
            {syncStatus.verifiedMcpCount || 0} Verified
          </span>
        </div>
        <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Sync
        </button>
      </div>
    </div>
  );
}

export default SyncStatusBar;
