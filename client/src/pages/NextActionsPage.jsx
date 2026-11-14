import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import AccountSelector from '../components/AccountSelector';
import { Target, Clock, FileText, Loader2 } from 'lucide-react';

export function NextActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState('ALL');
  const { openEvidence } = useEvidence();

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(async (accs) => {
        if (!Array.isArray(accs)) return;
        const all = [];
        await Promise.all(
          accs.map(async (acc) => {
            const accId = acc.accountId || acc.id;
            try {
              const res = await fetch(`/api/accounts/${accId}/actions`);
              if (res.ok) {
                const aData = await res.json();
                if (aData.allActions && Array.isArray(aData.allActions)) {
                  aData.allActions.forEach(a => {
                    all.push({
                      ...a,
                      account_id: accId,
                      account_name: acc.name
                    });
                  });
                }
              }
            } catch (err) {
              console.error(`Failed to load actions for ${accId}:`, err);
            }
          })
        );
        all.sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));
        setActions(all);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredActions = actions.filter(a => accountFilter === 'ALL' || a.account_id === accountFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Next Best Actions Engine</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Deterministic prioritization ranking: Deal Value + Likelihood of Success + Deadline Urgency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AccountSelector
            value={accountFilter}
            onChange={setAccountFilter}
            allLabel="All Accounts"
          />
        </div>
      </div>

      {/* Prioritization Algorithm Card */}
      <div className="p-4 bg-zinc-800/40 border border-zinc-800/60 rounded-xl text-xs space-y-1 shadow-sm">
        <strong className="text-violet-400 font-semibold uppercase text-[10px] tracking-wider block">
          Deterministic Priority Score Calculation (0 - 100 Pts)
        </strong>
        <p className="text-zinc-400 leading-relaxed text-[11px]">
          Actions are scored deterministically: <strong>Deal Value (up to 40 pts)</strong> based on verified commercial contract size + <strong>Documented Likelihood (up to 30 pts)</strong> based on assigned operational owner and deliverable clarity + <strong>Deadline Urgency (up to 30 pts)</strong> based on days remaining before customer milestones.
        </p>
      </div>

      {/* Actions List */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-zinc-500">Ranking operational deliverables...</p>
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="py-16 text-center bg-zinc-800/30 rounded-xl border border-zinc-800/60 text-zinc-500 text-xs">
          No actions match the selected account filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((action, idx) => (
            <div
              key={action.id}
              className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-800/40 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-zinc-700/80 transition-colors shadow-sm"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/60 text-zinc-200 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  #{idx + 1}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                      {action.account_id}
                    </span>
                    <h3 className="font-semibold text-zinc-100 text-xs leading-snug">
                      {action.title}
                    </h3>
                    {action.deadline && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                        <Clock className="w-3 h-3" /> Due: {action.deadline}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {action.description}
                  </p>

                  {action.deterministicReasoning && (
                    <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-300 text-[11px] leading-relaxed">
                      <strong>Deterministic Basis:</strong> {action.deterministicReasoning}
                    </div>
                  )}

                  {action.expected_outcome && (
                    <p className="text-[11px] text-zinc-500">
                      <strong className="text-zinc-400">Target Outcome:</strong> {action.expected_outcome}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:w-56 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/60 shrink-0 text-xs space-y-1.5">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-medium">Owner</span>
                  <strong className="text-zinc-200">{action.owner || 'Unassigned'}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-medium">Deal Impact</span>
                  <span className="text-zinc-400 truncate block">{action.deal_title || 'Account Strategy'}</span>
                </div>
                {action.evidence_source_id && (
                  <div className="pt-1 border-t border-zinc-800">
                    <button
                      onClick={() => openEvidence(action.evidence_id || action.evidence_source_id)}
                      className="text-blue-400 hover:text-blue-300 font-mono text-[10px] flex items-center gap-1 transition-colors"
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
      )}
    </div>
  );
}

export default NextActionsPage;
