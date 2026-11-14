import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEvidence } from '../context/EvidenceContext';
import SentimentBadge from '../components/SentimentBadge';
import TaskItem from '../components/TaskItem';
import { 
  Building2, ShieldCheck, CheckSquare, HeartHandshake, AlertTriangle,
  ArrowRight, Clock, ChevronRight, RefreshCw, Loader2
} from 'lucide-react';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { openEvidence } = useEvidence();

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) setData(await res.json());
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
        <Loader2 className="w-7 h-7 animate-spin text-blue-400 mx-auto" />
        <p className="text-xs text-zinc-500">Loading executive briefing…</p>
      </div>
    );
  }

  const { overview = {}, accounts = [], priorityTasks = [], recentActivity = [] } = data || {};
  const openTasks = priorityTasks.filter(t => t.status !== 'completed').slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Overview Header */}
      <div className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                Executive Briefing
              </span>
              <span className="text-[11px] text-zinc-500">• Live Synchronized</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              Account Intelligence
            </h1>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
              Live account intelligence. Every figure links to primary evidence.
            </p>
          </div>

          {/* Metrics Ribbon */}
          <div className="flex items-center gap-3 flex-wrap">
            <MetricCard label="Verified Revenue" value={`$${(overview.totalVerifiedBookValue || 0).toLocaleString()}`} color="emerald" />
            <MetricCard label="Pipeline" value={`$${(overview.totalReportedValue || 0).toLocaleString()}`} color="zinc" />
            <MetricCard label="Active Threats" value={`${overview.totalOpenRisks || 0} Critical`} color="red" />
          </div>
        </div>
      </div>

      {/* SWAPPED: Priority Tasks & Sentiment FIRST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Priority Tasks */}
        <div className="lg:col-span-2 bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-violet-400" />
                <h3 className="font-semibold text-zinc-100 text-sm">Priority Tasks</h3>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Ranked operational deliverables</p>
            </div>
            <Link to="/tasks" className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              All ({priorityTasks.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {openTasks.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">No open tasks.</div>
            ) : (
              openTasks.map((task) => (
                <TaskItem key={task.id} task={task} onStatusChange={handleTaskStatusChange} onRefresh={fetchDashboard} />
              ))
            )}
          </div>
        </div>

        {/* Customer Sentiments */}
        <div className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-zinc-100 text-sm">Sentiments</h3>
            </div>
            <Link to="/sentiment" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Details →
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            <SentimentCard
              name="Insp. Karen Mbeki"
              tag="Guarded"
              tagColor="amber"
              quote='"I need two things settled in writing this week: operator training dates and who answers if a dock fails."'
              evidenceId="ev_sig_urgent_request"
              evidenceLabel="FB-11206"
              openEvidence={openEvidence}
            />
            <SentimentCard
              name="Aldermoor Telemetry"
              tag="Silent Freeze"
              tagColor="amber"
              quote="3 active docks recorded zero flights across 14 days without customer reporting."
              evidenceId="ev_sig_aldermoor_usage_freeze"
              evidenceLabel="Usage Data"
              openEvidence={openEvidence}
            />
            <SentimentCard
              name="Rhys Calder"
              tag="Departing"
              tagColor="red"
              quote='"I am moving to another role in the new year. My successor has not been named yet."'
              evidenceId="ev_sig_champion_leaves"
              evidenceLabel="Departure Email"
              openEvidence={openEvidence}
            />
          </div>

          <div className="pt-3 border-t border-zinc-800/50 text-center">
            <Link to="/sentiment" className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
              Full Relationship Audit →
            </Link>
          </div>
        </div>
      </div>

      {/* Account Summaries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Account Summaries</h2>
            <p className="text-[11px] text-zinc-500">Current operational & commercial status</p>
          </div>
          <Link to="/accounts" className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            All Accounts <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const summary = acc.executiveSummary || {};
            return (
              <div key={acc.id} className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4 hover:border-zinc-700/80 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800/50">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                        {acc.id}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        {summary.statusCategory || 'Active'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100 leading-tight">{acc.name}</h3>
                  </div>
                  <SentimentBadge status={acc.sentiment?.overallSentiment} score={acc.sentiment?.sentimentScore} size="xs" />
                </div>

                {/* Verdict */}
                <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/50 leading-relaxed">
                  {summary.oneLineVerdict || acc.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-zinc-900/50 rounded-lg border border-zinc-800/50 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium block">Book Value</span>
                    <strong className="text-emerald-400 font-semibold text-sm block">
                      {summary.metrics?.verifiedRevenue || `$${(acc.verifiedBookValue || 0).toLocaleString()}`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium block">Fleet</span>
                    <span className="text-zinc-300 font-medium text-[11px] block mt-0.5">
                      {summary.metrics?.activeFleet?.split(' ')[0] || '—'} Docks
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium block">Expiry</span>
                    <span className="text-amber-400 text-[11px] block mt-0.5 font-medium">
                      {summary.metrics?.renewalDate || '—'}
                    </span>
                  </div>
                </div>

                {/* Decision */}
                {summary.criticalDecision && (
                  <div className="text-xs space-y-1">
                    <strong className="block text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                      Required Decision:
                    </strong>
                    <p className="text-zinc-400 leading-relaxed">{summary.criticalDecision}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                  <Link
                    to={`/timeline?accountId=${acc.id}`}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Timeline ({acc.gapsCount || 0} gaps)
                  </Link>
                  <Link
                    to={`/accounts/${acc.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    Deep Dive <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Helper Components ─── */

function MetricCard({ label, value, color }) {
  const colorMap = {
    emerald: 'text-emerald-400',
    zinc: 'text-zinc-200',
    red: 'text-red-400'
  };
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/50 p-3 rounded-lg text-right min-w-[120px]">
      <span className="text-[10px] text-zinc-500 uppercase font-medium block">{label}</span>
      <span className={`text-lg font-bold font-mono ${colorMap[color] || 'text-zinc-200'}`}>{value}</span>
    </div>
  );
}

function SentimentCard({ name, tag, tagColor, quote, evidenceId, evidenceLabel, openEvidence }) {
  const tagColors = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const cardBorder = {
    amber: 'border-amber-500/15',
    red: 'border-red-500/15',
    green: 'border-emerald-500/15',
  };

  return (
    <div className={`p-3 bg-zinc-900/50 rounded-lg border ${cardBorder[tagColor] || 'border-zinc-800/50'} text-xs space-y-1.5`}>
      <div className="flex items-center justify-between">
        <strong className="text-zinc-200 font-medium text-[12px]">{name}</strong>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${tagColors[tagColor]}`}>{tag}</span>
      </div>
      <p className="text-[11px] text-zinc-400 italic leading-relaxed">{quote}</p>
      <div className="pt-1 text-right">
        <button
          onClick={() => openEvidence(evidenceId)}
          className="text-[10px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
        >
          {evidenceLabel} →
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
