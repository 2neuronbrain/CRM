import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SentimentBadge from '../components/SentimentBadge';
import AddAccountModal from '../components/AddAccountModal';
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
  CheckCircle2,
  Plus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export function AccountsPage() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  const fetchAccounts = () => {
    setLoading(true);
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setSummaries(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAccountCreated = (newAcc) => {
    fetchAccounts();
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-7 h-7 animate-spin text-emerald-400 mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Compiling account portfolio summaries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Portfolio Overview
            </span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">{summaries.length} Accounts Monitored</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Customer Accounts & Portfolio Reality
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational and commercial reality of assigned customer accounts for executive review.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAccounts}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Portfolio"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium shadow-sm transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summaries.map((acc) => {
          const isAtRisk = acc.healthBadgeColor === 'red';
          const isWarning = acc.healthBadgeColor === 'amber';

          return (
            <div
              key={acc.accountId}
              className="bg-slate-900/95 rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-slate-700 transition"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Acc {acc.accountId}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                        {acc.statusCategory || acc.industry}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {acc.name}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      isAtRisk
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {acc.healthBadge}
                  </span>
                </div>

                {/* One-Line Verdict */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                    Bottom-Line Reality
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {acc.oneLineVerdict}
                  </p>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
                  <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 block">Verified Book</span>
                    <span className="text-xs font-bold text-emerald-400">{acc.metrics.verifiedRevenue}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 block">Pipeline Value</span>
                    <span className="text-xs font-bold text-slate-200">{acc.metrics.pipelineValue}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 block">Sentiment</span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-xs font-bold text-white">{acc.metrics.sentimentScore}/100</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 block">Active Risks</span>
                    <span className={`text-xs font-bold ${acc.metrics.riskCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {acc.metrics.riskCount} Open
                    </span>
                  </div>
                </div>

                {/* Operational & Commercial Synthesis */}
                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <strong className="text-slate-300 font-semibold block mb-0.5">Commercial Status:</strong>
                    <p className="text-slate-400 leading-relaxed">{acc.commercialSummary}</p>
                  </div>
                  <div>
                    <strong className="text-slate-300 font-semibold block mb-0.5">Operational Context:</strong>
                    <p className="text-slate-400 leading-relaxed">{acc.operationalSummary}</p>
                  </div>
                </div>

                {/* Critical Monday Decision */}
                <div className="p-3 bg-indigo-950/20 border border-indigo-800/40 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                      Required Monday Leadership Move
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                    {acc.criticalDecision}
                  </p>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <Link
                  to={`/timeline?accountId=${acc.accountId}`}
                  className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Interaction Timeline</span>
                </Link>

                <Link
                  to={`/accounts/${acc.accountId}`}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                >
                  <span>Open Account Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
    </div>
  );
}

export default AccountsPage;
