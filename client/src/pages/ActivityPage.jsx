import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import { Activity, Radio, FileText, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openEvidence } = useEvidence();

  const fetchData = async () => {
    try {
      const [actRes, sigRes] = await Promise.all([
        fetch('/api/activity'),
        fetch('/api/signals')
      ]);
      if (actRes.ok) setActivities(await actRes.json());
      if (sigRes.ok) setSignals(await sigRes.json());
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Activity & Signal Timeline</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Real-time chronological audit trail of MCP tool responses, live signals, and CRM operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Activity Timeline */}
        <div className="lg:col-span-2 bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
            <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Chronological Audit Log
            </h2>
            <span className="text-xs text-zinc-500 font-mono">{activities.length} recorded events</span>
          </div>

          <div className="space-y-3">
            {loading && activities.length === 0 ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
              </div>
            ) : activities.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No activity logs recorded yet.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-3.5 bg-zinc-900/50 rounded-lg border border-zinc-800/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200 text-xs">{act.title}</span>
                      {act.account_id && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                          Acc {act.account_id}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{act.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Signals Stream */}
        <div className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
            <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400" />
              Live Telemetry Signals
            </h2>
            <span className="text-xs text-zinc-500 font-mono">{signals.length} signals</span>
          </div>

          <div className="space-y-3">
            {signals.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Awaiting incoming MCP signals.
              </div>
            ) : (
              signals.map((sig) => (
                <div key={sig.id} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold text-blue-400">
                      {sig.external_id || sig.id}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(sig.detected_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {sig.payload?.text || sig.payload?.summary || JSON.stringify(sig.payload)}
                  </p>

                  <div className="pt-1 text-right">
                    <button
                      onClick={() => openEvidence(`ev_sig_${sig.external_id}`)}
                      className="text-[10px] font-mono text-blue-400 hover:text-blue-300"
                    >
                      Inspect Evidence &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;
