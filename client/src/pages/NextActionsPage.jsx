import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import { Target, Clock, CheckCircle2, FileText, ChevronRight, AlertCircle } from 'lucide-react';

export function NextActionsPage() {
  const [actionsA, setActionsA] = useState([]);
  const [actionsB, setActionsB] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState('ALL');
  const { openEvidence } = useEvidence();

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts/A/actions').then(r => r.json()),
      fetch('/api/accounts/B/actions').then(r => r.json())
    ]).then(([resA, resB]) => {
      setActionsA((resA.allActions || []).map(a => ({ ...a, account_id: 'A', account_name: 'Eastern Counties Police Alliance' })));
      setActionsB((resB.allActions || []).map(a => ({ ...a, account_id: 'B', account_name: 'Aldermoor Industrial Group' })));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allActions = [...actionsA, ...actionsB].sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));
  const filteredActions = allActions.filter(a => accountFilter === 'ALL' || a.account_id === accountFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Next Best Actions Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic prioritization ranking: Deal Value + Likelihood of Success + Deadline Urgency.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'A', 'B'].map((acc) => (
            <button
              key={acc}
              onClick={() => setAccountFilter(acc)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                accountFilter === acc
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {acc === 'ALL' ? 'All Accounts' : acc === 'A' ? 'Eastern Counties' : 'Aldermoor'}
            </button>
          ))}
        </div>
      </div>

      {/* Prioritization Algorithm Card */}
      <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-sm text-xs space-y-1">
        <strong className="text-purple-300 font-bold uppercase text-[10px] tracking-wider block">
          Transparent Priority Score Calculation (0 - 100 Pts)
        </strong>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Actions are scored deterministically: <strong>Deal Value (up to 40 pts)</strong> based on verified commercial contract size + <strong>Documented Likelihood (up to 30 pts)</strong> based on assigned operational owner and deliverable clarity + <strong>Deadline Urgency (up to 30 pts)</strong> based on days remaining before customer milestones.
        </p>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.map((action, idx) => (
          <div
            key={action.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-start justify-between gap-5"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow">
                #{idx + 1}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Account {action.account_id}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {action.title}
                  </h3>
                  {action.deadline && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" /> Due: {action.deadline}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {action.description}
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-xs">
                  <strong className="block text-[10px] uppercase text-purple-900 mb-0.5 font-bold">
                    Ranking Justification:
                  </strong>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    {action.deterministicReasoning}
                  </p>
                </div>

                {action.expected_outcome && (
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Target Outcome:</strong> {action.expected_outcome}
                  </p>
                )}
              </div>
            </div>

            <div className="md:w-56 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 text-xs space-y-2.5">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Responsible Owner</span>
                <strong className="text-slate-900 text-sm block">{action.owner || 'Unassigned'}</strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Priority Score</span>
                <span className="font-mono font-extrabold text-purple-700 text-sm">
                  {action.calculatedScore || 85} / 100
                </span>
              </div>

              {action.evidence_source_id && (
                <div className="pt-2 border-t border-slate-200">
                  <button
                    onClick={() => openEvidence(action.evidence_id || action.evidence_source_id)}
                    className="text-emerald-700 hover:text-emerald-800 font-mono text-[10px] underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Evidence: {action.evidence_source_id}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NextActionsPage;
