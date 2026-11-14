import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SeverityBadge from '../components/SeverityBadge';
import { 
  DollarSign, 
  Building2, 
  Briefcase, 
  AlertTriangle, 
  Target, 
  EyeOff, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  FileText,
  Activity,
  Layers,
  ChevronRight
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
    const interval = setInterval(fetchDashboard, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Loading executive account intelligence...</p>
      </div>
    );
  }

  const { overview = {}, accounts = [], recentActivity = [] } = data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Welcome & Value Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold uppercase tracking-wider border border-emerald-500/30">
                Monday Review Briefing
              </span>
              <span className="text-slate-400 text-xs">Live MCP Synchronization Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Executive Account Intelligence</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time, evidence-backed CRM intelligence for assigned customer accounts. Every dollar and factual claim is backed by unedited MCP source records.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 backdrop-blur-sm">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Verified Book</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                ${(overview.totalVerifiedBookValue || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                + ${(overview.totalReportedValue || 0).toLocaleString()} unverified reported
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Verified Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Verified Book</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">
            ${(overview.totalVerifiedBookValue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
            Primary contract backed
          </span>
        </div>

        {/* Reported Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Reported Value</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">
            ${(overview.totalReportedValue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
            Commercial proposals
          </span>
        </div>

        {/* Deals */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Active Deals</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{overview.totalDeals || 0}</p>
          <span className="text-[11px] text-slate-500">Across 2 accounts</span>
        </div>

        {/* Open Risks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Open Risks</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-rose-600">{overview.totalOpenRisks || 0}</p>
          <span className="text-[11px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
            Requiring action
          </span>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Urgent Moves</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{overview.totalUpcomingDeadlines || 0}</p>
          <span className="text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
            Approaching deadlines
          </span>
        </div>

        {/* Intelligence Gaps */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Blind Spots</span>
            <EyeOff className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{overview.totalGaps || 0}</p>
          <span className="text-[11px] text-slate-500">Critical unknowns</span>
        </div>
      </div>

      {/* Account Workspaces Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Account Workspaces</h2>
            <p className="text-xs text-slate-500">Complete five-question intelligence profile for each assigned account</p>
          </div>
          <Link to="/accounts" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Compare Accounts <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {accounts.map((acc) => (
            <div 
              key={acc.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Account {acc.id}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2 leading-tight">
                      {acc.name}
                    </h3>
                  </div>
                  <SeverityBadge severity={acc.riskStatus || 'Amber'} />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {acc.description}
                </p>

                {/* Numbers Row */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Verified Book</span>
                    <strong className="text-emerald-700 font-bold text-sm">
                      ${(acc.verifiedBookValue || 0).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Reported</span>
                    <strong className="text-slate-700 font-bold text-sm">
                      ${(acc.reportedValue || 0).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Deals</span>
                    <strong className="text-slate-700 font-bold text-sm">{acc.dealsCount}</strong>
                  </div>
                </div>

                {/* Top Action & Top Risk previews */}
                <div className="space-y-2 text-xs">
                  {acc.topAction && (
                    <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200/60 flex items-start gap-2">
                      <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-emerald-950 block truncate">
                          #1 Move: {acc.topAction.title}
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          Owner: {acc.topAction.owner} • Due: {acc.topAction.deadline || 'Immediate'}
                        </span>
                      </div>
                    </div>
                  )}

                  {acc.topRisk && (
                    <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-200/60 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-rose-950 block truncate">
                          Top Risk: {acc.topRisk.title}
                        </span>
                        <span className="text-[11px] text-rose-800">
                          {acc.topRisk.consequence ? acc.topRisk.consequence.slice(0, 90) + '...' : 'Under monitoring'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {acc.gapsCount} critical blind spots identified
                </span>
                <Link
                  to={`/accounts/${acc.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  Open Intelligence File <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom split: The 5 Core Questions Quick Review & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core 5 Questions Framework Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">The Five Core Questions Framework</h3>
            <span className="text-xs font-medium text-slate-500">Traceable Account Intelligence</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-sm">1. What is the book worth?</span>
                <Link to="/deals" className="text-xs font-semibold text-emerald-600">View Deals &rarr;</Link>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Separates verified contract values from reported claims. Total verified book stands at <strong>${(overview.totalVerifiedBookValue || 0).toLocaleString()}</strong>. Unsupported assumptions are excluded from verified revenue calculations.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-sm">2. Who holds the power?</span>
                <Link to="/power-map" className="text-xs font-semibold text-emerald-600">View Power Map &rarr;</Link>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maps decision-makers, champions, economic buyers, and blockers. Highlights vulnerable relationships, departure alerts (e.g. Rhys Calder leaving Eastern Counties in January), and unengaged stakeholders.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-sm">3. What should we do first?</span>
                <Link to="/actions" className="text-xs font-semibold text-emerald-600">View Ranked Actions &rarr;</Link>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic prioritization algorithm combining deal value, documented likelihood, and deadline urgency. Every action includes an assigned owner and clear justification.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-sm">4. What is about to go wrong?</span>
                <Link to="/risks" className="text-xs font-semibold text-emerald-600">View Risk Radar &rarr;</Link>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detects unanswered customer communications (Insp. Karen Mbeki escalation), approaching public events, and silent usage drop-offs (3 docks stopping flights at Aldermoor).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-sm">5. What do we still not know?</span>
                <Link to="/blind-spots" className="text-xs font-semibold text-emerald-600">View Blind Spots &rarr;</Link>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identifies critical information gaps that could derail account renewals or tender specs. Formulates recommended discovery questions to ask key stakeholders.
              </p>
            </div>
          </div>
        </div>

        {/* Live Activity & Signals Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Live Account Feed</h3>
            </div>
            <Link to="/activity" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              All Activity &rarr;
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[480px]">
            {recentActivity.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No recent activity logged yet.
              </div>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{act.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{act.description}</p>
                  {act.account_id && (
                    <span className="inline-block mt-1 text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                      Account {act.account_id}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
