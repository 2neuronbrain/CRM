import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import { EyeOff, HelpCircle, FileText, ChevronRight, AlertCircle } from 'lucide-react';

export function BlindSpotsPage() {
  const [gapsA, setGapsA] = useState([]);
  const [gapsB, setGapsB] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState('ALL');
  const { openEvidence } = useEvidence();

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts/A/gaps').then(r => r.json()),
      fetch('/api/accounts/B/gaps').then(r => r.json())
    ]).then(([resA, resB]) => {
      setGapsA((resA.gaps || []).map(g => ({ ...g, account_id: 'A', account_name: 'Eastern Counties Police Alliance' })));
      setGapsB((resB.gaps || []).map(g => ({ ...g, account_id: 'B', account_name: 'Aldermoor Industrial Group' })));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allGaps = [...gapsA, ...gapsB];
  const filteredGaps = allGaps.filter(g => accountFilter === 'ALL' || g.account_id === accountFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Blind-Spot Finder</h1>
          <p className="text-xs text-slate-500 mt-1">
            Identifies missing strategic information and formulates actionable discovery questions.
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

      {/* Gaps Grid */}
      <div className="space-y-4">
        {filteredGaps.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No blind spots currently unaddressed.
          </div>
        ) : (
          filteredGaps.map((gap) => (
            <div
              key={gap.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Account {gap.account_id}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      {gap.priority || 'Medium'} Priority
                    </span>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      {gap.missing_information}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 block">
                    {gap.account_name}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Why It Matters:</strong> {gap.importance}
              </p>

              {/* Recommended Question box */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1">
                <strong className="block text-[11px] uppercase tracking-wider text-amber-900 font-bold">
                  Recommended Question To Ask Stakeholder:
                </strong>
                <p className="text-slate-900 font-medium italic text-sm leading-relaxed">
                  "{gap.recommended_question}"
                </p>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">
                  Target Information Lead: <strong className="text-slate-800">{gap.suggested_owner}</strong>
                </span>
                {gap.evidence_source_id && (
                  <button
                    onClick={() => openEvidence(gap.evidence_id || gap.evidence_source_id)}
                    className="text-emerald-700 hover:text-emerald-800 font-mono text-[10px] underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Evidence: {gap.evidence_source_id}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BlindSpotsPage;
