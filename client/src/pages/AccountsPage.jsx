import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SentimentBadge from '../components/SentimentBadge';
import SeverityBadge from '../components/SeverityBadge';
import { 
  Building2, 
  ShieldCheck, 
  DollarSign, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  Target, 
  Radio, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

export function AccountsPage() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setSummaries(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Compiling account portfolio summaries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Insightful Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Accounts Overview & Portfolio Status</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational and commercial reality of assigned customer accounts for Monday review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
            2 Active Enterprise Accounts
          </span>
        </div>
      </div>

      {/* Structured Account Briefing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summaries.map((acc) => {
          const isAtRisk = acc.healthBadgeColor === 'red';
          return (
            <div
              key={acc.accountId}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-slate-300 transition"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                        Account {acc.accountId}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {acc.statusCategory}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {acc.name}
                    </h2>
                  </div>

                  <SentimentBadge 
                    status={acc.metrics?.sentimentStatus} 
                    score={acc.metrics?.sentimentScore} 
                    size="xs" 
                  />
                </div>

                {/* One-Line Verdict */}
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                  {acc.oneLineVerdict}
                </p>

                {/* 4 Core Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Verified Book</span>
                    <strong className="text-emerald-700 font-bold text-sm block mt-0.5">
                      {acc.metrics?.verifiedRevenue}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pipeline</span>
                    <strong className="text-slate-800 font-bold text-sm block mt-0.5">
                      {acc.metrics?.pipelineValue}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Active Fleet</span>
                    <span className="text-slate-800 font-medium text-[11px] block mt-0.5 truncate">
                      {acc.metrics?.activeFleet?.split(' ')[0]} Docks
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Renewal</span>
                    <span className="text-rose-700 font-mono text-[11px] block mt-0.5 font-semibold">
                      {acc.metrics?.renewalDate?.split(' ')[0]} {acc.metrics?.renewalDate?.split(' ')[1]}
                    </span>
                  </div>
                </div>

                {/* Critical Decision Required */}
                <div className="space-y-1 text-xs">
                  <strong className="block text-[11px] uppercase font-bold text-slate-900 tracking-wider">
                    Required Monday Decision:
                  </strong>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {acc.criticalDecision}
                  </p>
                </div>

                {/* Priority Action & Top Risk Quick Highlights */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  {acc.priorityAction && (
                    <div className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                      <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-emerald-950 block truncate">
                          Next Move: {acc.priorityAction.title}
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          Owner: {acc.priorityAction.owner} • Due: {acc.priorityAction.deadline}
                        </span>
                      </div>
                    </div>
                  )}

                  {acc.topRisk && (
                    <div className="flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-rose-950 block truncate">
                          Immediate Risk: {acc.topRisk.title}
                        </span>
                        <span className="text-[11px] text-rose-800 truncate block">
                          {acc.topRisk.consequence}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Full 5-Question Intelligence Profile
                </span>
                <Link
                  to={`/accounts/${acc.accountId}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Inspect Account <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Portfolio Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Portfolio Comparison Matrix</h3>
          <span className="text-xs text-slate-400 font-mono">2 Accounts • Live MCP Synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Account</th>
                <th className="py-2.5 px-4">Current Status Category</th>
                <th className="py-2.5 px-4">Verified Revenue</th>
                <th className="py-2.5 px-4">Customer Sentiment</th>
                <th className="py-2.5 px-4">Fleet & Renewal</th>
                <th className="py-2.5 px-4">Primary Immediate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((acc) => (
                <tr key={acc.accountId} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                        {acc.accountId}
                      </span>
                      <strong className="text-slate-900 font-semibold">{acc.name}</strong>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {acc.statusCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-emerald-700">
                      {acc.metrics?.verifiedRevenue}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <SentimentBadge status={acc.metrics?.sentimentStatus} size="xs" />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="block text-slate-800 font-medium">{acc.metrics?.activeFleet?.split(' ')[0]} Docks</span>
                    <span className="text-[10px] text-rose-600 block">{acc.metrics?.renewalDate?.split(' ')[0]} {acc.metrics?.renewalDate?.split(' ')[1]}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-700 line-clamp-1 max-w-xs font-medium">
                      {acc.priorityAction?.title || 'Review account'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AccountsPage;
