import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SentimentBadge from '../components/SentimentBadge';
import AddAccountModal from '../components/AddAccountModal';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  Target, 
  HeartHandshake,
  Plus,
  RefreshCw,
  Loader2
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

  const handleAccountCreated = () => {
    fetchAccounts();
  };

  if (loading && summaries.length === 0) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
        <p className="text-xs text-zinc-500 font-medium">Compiling account portfolio summaries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded">
              Portfolio Overview
            </span>
            <span className="text-xs text-zinc-600">•</span>
            <span className="text-xs font-mono text-zinc-400">{summaries.length} Accounts Monitored</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Customer Accounts & Portfolio
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Operational and commercial reality of assigned customer accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAccounts}
            className="p-2 rounded-lg bg-zinc-800/70 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/70 transition-colors"
            title="Refresh Portfolio"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {summaries.map((acc) => {
          const isAtRisk = acc.healthBadgeColor === 'red';
          const isWarning = acc.healthBadgeColor === 'amber';

          return (
            <div
              key={acc.accountId}
              className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-zinc-700/80 transition-colors"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/50 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                        {acc.accountId}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">
                        {acc.industry}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 leading-tight">
                      {acc.name}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono border ${
                    isAtRisk ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    isWarning ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {acc.healthBadge}
                  </span>
                </div>

                {/* One Line Verdict */}
                <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/50 leading-relaxed font-medium">
                  {acc.oneLineVerdict}
                </p>

                {/* Core Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/50 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium block">Verified Book</span>
                    <strong className="text-emerald-400 font-bold text-sm block font-mono">
                      {acc.metrics?.verifiedRevenue || '$0'}
                    </strong>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      + {acc.metrics?.pipelineValue || '$0'} pipe
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium block">Active Fleet</span>
                    <span className="text-zinc-300 font-medium text-xs block mt-0.5">
                      {acc.metrics?.activeFleet?.split('(')[0] || '14 Docks'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium block">Term Expiry</span>
                    <span className="text-zinc-300 text-xs block mt-0.5 font-mono">
                      {acc.metrics?.renewalDate?.split('(')[0] || 'Rolling'}
                    </span>
                  </div>
                </div>

                {/* Operational Synthesis */}
                <div className="space-y-2 text-xs">
                  <div>
                    <strong className="text-zinc-400 block text-[10px] uppercase font-semibold">Operational Reality:</strong>
                    <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">
                      {acc.operationalSummary}
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-400 block text-[10px] uppercase font-semibold">Immediate Priority Action:</strong>
                    <p className="text-blue-300 text-xs leading-relaxed mt-0.5 font-medium">
                      {acc.criticalDecision}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                <Link
                  to={`/timeline?accountId=${acc.accountId}`}
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Timeline</span>
                </Link>

                <Link
                  to={`/accounts/${acc.accountId}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700/60 transition-colors"
                >
                  <span>Open Deep Dive</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
    </div>
  );
}

export default AccountsPage;
