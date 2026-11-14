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
  TrendingDown
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
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Loading executive account briefing...</p>
      </div>
    );
  }

  const { overview = {}, accounts = [], priorityTasks = [], recentActivity = [] } = data || {};
  const openTasks = priorityTasks.filter(t => t.status !== 'completed').slice(0, 4);

  return (
    <div className="space-y-7 pb-12">
      {/* Executive Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Monday Review Briefing
              </span>
              <span className="text-xs text-slate-400">• Live MCP Synchronized</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Executive Account Intelligence
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Live, unmanipulated account intelligence for assigned customer accounts. Every dollar, risk trigger, and action links directly to primary MCP records.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-right min-w-[140px]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Verified Revenue</span>
              <span className="text-xl font-bold text-emerald-700 font-mono">
                ${(overview.totalVerifiedBookValue || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Primary contracts</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-right min-w-[130px]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pipeline Value</span>
              <span className="text-xl font-bold text-slate-800 font-mono">
                ${(overview.totalReportedValue || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Reported proposals</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-right min-w-[120px]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Threats</span>
              <span className="text-xl font-bold text-rose-600 font-mono">
                {overview.totalOpenRisks || 0} Critical
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Immediate action</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Summaries Based on Current Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Account Summaries (Current Status)</h2>
            <p className="text-xs text-slate-500">Commercial & operational executive status synthesis</p>
          </div>
          <Link to="/accounts" className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1">
            Portfolio Matrix <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {accounts.map((acc) => {
            const summary = acc.executiveSummary || {};
            return (
              <div 
                key={acc.id} 
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div className="space-y-3.5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                          Account {acc.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {summary.statusCategory || 'Active'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
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
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                    {summary.oneLineVerdict || acc.description}
                  </p>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Book Value</span>
                      <strong className="text-emerald-700 font-bold text-sm block">
                        {summary.metrics?.verifiedRevenue || `$${(acc.verifiedBookValue || 0).toLocaleString()}`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Fleet</span>
                      <span className="text-slate-800 font-medium text-[11px] block mt-0.5">
                        {summary.metrics?.activeFleet?.split(' ')[0] || '14'} Docks
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Term Expiry</span>
                      <span className="text-rose-700 font-mono text-[11px] block mt-0.5 font-semibold">
                        {summary.metrics?.renewalDate?.split(' ')[0]} {summary.metrics?.renewalDate?.split(' ')[1]}
                      </span>
                    </div>
                  </div>

                  {/* Required Monday Decision */}
                  <div className="text-xs space-y-1">
                    <strong className="block text-[11px] uppercase font-bold text-slate-900 tracking-wider">
                      Required Monday Decision:
                    </strong>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {summary.criticalDecision}
                    </p>
                  </div>
                </div>

                {/* Footer Action Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {acc.gapsCount} critical blind spots
                  </span>
                  <Link
                    to={`/accounts/${acc.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Open Deep Dive <ArrowRight className="w-3.5 h-3.5" />
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Immediate Priority Tasks</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Ranked operational deliverables with assigned owners</p>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1">
              All Tasks ({priorityTasks.length}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {openTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No open priority tasks.
              </div>
            ) : (
              openTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Customer Sentiment Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Customer Sentiments</h3>
              </div>
              <Link to="/sentiment" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                Details &rarr;
              </Link>
            </div>

            {/* Quick Stakeholder quotes */}
            <div className="space-y-3">
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-rose-950 font-semibold">Insp. Karen Mbeki (Westmere)</strong>
                  <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-medium">Guarded</span>
                </div>
                <p className="text-[11px] text-rose-900 italic leading-relaxed">
                  "I need two things settled in writing this week: operator training dates and who answers if a dock fails on the event day. Nobody has replied."
                </p>
                <div className="pt-1 text-right">
                  <button
                    onClick={() => openEvidence('ev_sig_urgent_request')}
                    className="text-[10px] font-mono text-emerald-700 hover:underline"
                  >
                    Ticket FB-11206 Evidence
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-950 font-semibold">Aldermoor Site Telemetry</strong>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-medium">Silent Freeze</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  3 active docks recorded zero flights across 14 days without customer reporting or ticket submissions.
                </p>
                <div className="pt-1 text-right">
                  <button
                    onClick={() => openEvidence('ev_sig_aldermoor_usage_freeze')}
                    className="text-[10px] font-mono text-emerald-700 hover:underline"
                  >
                    Usage Telemetry Evidence
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-semibold">Rhys Calder (Alliance Lead)</strong>
                  <span className="text-[10px] text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded font-medium">Departing</span>
                </div>
                <p className="text-[11px] text-slate-600 italic leading-relaxed">
                  "I am moving to another role in the new year and will hand over the drone programme in January. My successor has not been named yet."
                </p>
                <div className="pt-1 text-right">
                  <button
                    onClick={() => openEvidence('ev_sig_champion_leaves')}
                    className="text-[10px] font-mono text-emerald-700 hover:underline"
                  >
                    Departure Email Evidence
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link to="/sentiment" className="text-xs font-semibold text-slate-900 hover:text-emerald-700">
              Open Full Relationship Health Audit &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
