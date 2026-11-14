import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeverityBadge from '../components/SeverityBadge';
import { Building2, ShieldCheck, DollarSign, ArrowUpRight, Target, AlertTriangle, EyeOff } from 'lucide-react';

export function AccountsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading accounts...</p>
      </div>
    );
  }

  const { accounts = [] } = data || {};

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Accounts Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct comparative view of both assigned customer accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  Account {acc.id}
                </span>
                <SeverityBadge severity={acc.riskStatus || 'Amber'} />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-1">{acc.name}</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{acc.description}</p>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Verified Value</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ${(acc.verifiedBookValue || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Reported Value</span>
                  <span className="font-bold text-slate-700 text-sm">
                    ${(acc.reportedValue || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Deals</span>
                  <span className="font-bold text-slate-700 text-sm">{acc.dealsCount}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {acc.topAction && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200/60 flex items-start gap-2">
                    <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950 block">Top Move: {acc.topAction.title}</strong>
                      <span className="text-[11px] text-emerald-800">
                        Owner: {acc.topAction.owner} • Due: {acc.topAction.deadline || 'Immediate'}
                      </span>
                    </div>
                  </div>
                )}

                {acc.topRisk && (
                  <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200/60 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-950 block">Key Risk: {acc.topRisk.title}</strong>
                      <span className="text-[11px] text-rose-800">{acc.topRisk.consequence?.slice(0, 85)}...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">{acc.gapsCount} critical blind spots</span>
              <Link
                to={`/accounts/${acc.id}`}
                className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Open 5 Questions File <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AccountsPage;
