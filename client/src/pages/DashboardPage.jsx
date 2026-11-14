import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEvidence } from '../context/EvidenceContext';
import SentimentBadge from '../components/SentimentBadge';
import SeverityBadge from '../components/SeverityBadge';
import TaskItem from '../components/TaskItem';
import { 
  Building2, 
  ShieldCheck, 
  CheckSquare, 
  HeartHandshake, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Radio, 
  Layers,
  ChevronRight,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { openEvidence } = useEvidence();

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          priorityTasks: prev.priorityTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        };
      });
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update task:', err);
      fetchDashboard();
    }
  };

  if (loading && !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Loading executive briefing...</p>
      </div>
    );
  }

  const { overview = {}, accounts = [], priorityTasks = [], recentActivity = [] } = data || {};
  const openTasks = priorityTasks.filter(t => t.status !== 'completed').slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Overview Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Monday Review Briefing
              </span>
              <span className="text-xs text-slate-400">• Live MCP Synchronized</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Executive Account Intelligence
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Live, unmanipulated account intelligence for assigned customer accounts. Every figure, risk trigger, and priority move links directly to primary audit evidence.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-right min-w-[140px]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block font-mono">Verified Revenue</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                ${(overview.totalVerifiedBookValue || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Primary contracts</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-right min-w-[130px]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block font-mono">Pipeline Value</span>
              <span className="text-xl font-bold text-slate-200 font-mono">
                ${(overview.totalReportedValue || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Reported proposals</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-right min-w-[120px]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block font-mono">Active Threats</span>
              <span className="text-xl font-bold text-rose-400 font-mono">
                {overview.totalOpenRisks || 0} Critical
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Immediate action</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Summaries Based on Current Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Account Summaries (Current Status)</h2>
            <p className="text-xs text-slate-400">Commercial & operational executive status synthesis</p>
          </div>
          <Link to="/accounts" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition">
            Portfolio Matrix <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {accounts.map((acc) => {
            const summary = acc.executiveSummary || {};
            return (
              <div 
                key={acc.id} 
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-3.5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Acc {acc.id}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                          {summary.statusCategory || 'Active'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {acc.name}
                      </h3>
                    </div>

                    <SentimentBadge 
                      status={acc.sentiment?.overallSentiment} 
                      score={acc.sentiment?.sentimentScore} 
                      size="xs" 
                    />
                  </div>

                  {/* One-Line Verdict */}
                  <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-medium">
                    {summary.oneLineVerdict || acc.description}
                  </p>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block font-mono">Book Value</span>
                      <strong className="text-emerald-400 font-bold text-sm block font-mono">
                        {summary.metrics?.verifiedRevenue || `$${(acc.verifiedBookValue || 0).toLocaleString()}`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block font-mono">Active Fleet</span>
                      <span className="text-slate-300 font-medium text-[11px] block mt-0.5 font-mono">
                        {summary.metrics?.activeFleet?.split(' ')[0] || '14'} Docks
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block font-mono">Term Expiry</span>
                      <span className="text-rose-400 font-mono text-[11px] block mt-0.5 font-semibold">
                        {summary.metrics?.renewalDate?.split(' ')[0]} {summary.metrics?.renewalDate?.split(' ')[1]}
                      </span>
                    </div>
                  </div>

                  {/* Required Monday Decision */}
                  <div className="text-xs space-y-1">
                    <strong className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider font-mono">
                      Required Monday Decision:
                    </strong>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {summary.criticalDecision}
                    </p>
                  </div>
                </div>

                {/* Footer Action Link */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    to={`/timeline?accountId=${acc.id}`}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Timeline ({acc.gapsCount || 0} gaps)</span>
                  </Link>
                  <Link
                    to={`/accounts/${acc.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition"
                  >
                    <span>Open Deep Dive</span> <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Grid: Priority Tasks & Customer Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Immediate Priority Tasks */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Immediate Priority Tasks</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Ranked operational deliverables with assigned owners</p>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition">
              All Tasks ({priorityTasks.length}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {openTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No open priority tasks.
              </div>
            ) : (
              openTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                  onRefresh={fetchDashboard}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Customer Sentiment Snapshot */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-white text-sm">Customer Sentiments</h3>
              </div>
              <Link to="/sentiment" className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition">
                Details &rarr;
              </Link>
            </div>

            {/* Quick Stakeholder quotes */}
            <div className="space-y-3">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-rose-200 font-semibold">Insp. Karen Mbeki (Westmere)</strong>
                  <span className="text-[10px] text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded font-medium">Guarded</span>
                </div>
                <p className="text-[11px] text-rose-300/90 italic leading-relaxed">
                  "I need two things settled in writing this week: operator training dates and who answers if a dock fails on the event day. Nobody has replied."
                </p>
                <div className="pt-1 text-right">
                  <button
                    onClick={() => openEvidence('ev_sig_urgent_request')}
                    className="text-[10px] font-mono text-emerald-400 hover:underline"
                  >
                    Ticket FB-11206 Evidence &rarr;
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-200 font-semibold">Aldermoor Site Telemetry</strong>
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-medium">Silent Freeze</span>
                </div>
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  3 active docks recorded zero flights across 14 days without customer reporting or ticket submissions.
                </p>
                <div className="pt-1 text-right">
                  <button
                    onClick={() => openEvidence('ev_sig_aldermoor_usage_freeze')}
                    className="text-[10px] font-mono text-emerald-400 hover:underline"
                  >
                    Usage Telemetry Evidence &rarr;
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200 font-semibold">Rhys Calder (Alliance Lead)</strong>
                  <span className="text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded font-medium">Departing</span>
                </div>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">
                  "I am moving to another role in the new year and will hand over the drone programme in January. My successor has not been named yet."
                </p>
                <div className="pt-1 text-right">
                  <button
                    onClick={() => openEvidence('ev_sig_champion_leaves')}
                    className="text-[10px] font-mono text-emerald-400 hover:underline"
                  >
                    Departure Email Evidence &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <Link to="/sentiment" className="text-xs font-semibold text-slate-300 hover:text-white transition">
              Open Full Relationship Health Audit &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
