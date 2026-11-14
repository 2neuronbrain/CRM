import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import { Activity, Radio, FileText, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity & Signal Timeline</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time chronological audit trail of MCP tool responses, live signals, and CRM operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Activity Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Chronological Audit Log
            </h2>
            <span className="text-xs text-slate-400">{activities.length} recorded events</span>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No activity records yet.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="relative flex items-start gap-4 pl-8 text-xs">
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-white ring-2 ring-slate-100 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <strong className="text-slate-900 text-sm font-semibold">{act.title}</strong>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-xs">{act.description}</p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        Type: {act.type}
                      </span>
                      {act.account_id && (
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                          Account {act.account_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live MCP Signals stream */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
              Live MCP Signals
            </h2>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
              {signals.length} Signals
            </span>
          </div>

          <div className="space-y-3">
            {signals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No external signals received yet.
              </div>
            ) : (
              signals.map((sig) => {
                const payload = typeof sig.payload === 'object' ? sig.payload : JSON.parse(sig.payload || '{}');
                return (
                  <div key={sig.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                        {sig.external_id || sig.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sig.detected_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <strong className="text-slate-900 block font-semibold">
                      {payload.title || 'Signal Event'}
                    </strong>

                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {payload.summary || payload.text || JSON.stringify(payload).slice(0, 120)}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-semibold uppercase">
                        Status: {sig.processing_status}
                      </span>
                      {sig.account_id && (
                        <span className="text-slate-500 font-semibold">Account {sig.account_id}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;
