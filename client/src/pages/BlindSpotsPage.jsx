import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import AccountSelector from '../components/AccountSelector';
import { HelpCircle, FileText, Loader2 } from 'lucide-react';

export function BlindSpotsPage() {
  const [gaps, setGaps] = useState([]);
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
              const res = await fetch(`/api/accounts/${accId}/gaps`);
              if (res.ok) {
                const gData = await res.json();
                if (gData.gaps && Array.isArray(gData.gaps)) {
                  gData.gaps.forEach(g => {
                    all.push({
                      ...g,
                      account_id: accId,
                      account_name: acc.name
                    });
                  });
                }
              }
            } catch (err) {
              console.error(`Failed to load gaps for ${accId}:`, err);
            }
          })
        );
        setGaps(all);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredGaps = gaps.filter(g => accountFilter === 'ALL' || g.account_id === accountFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Blind-Spot Finder</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Identifies missing strategic information and formulates actionable discovery questions.
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

      {/* Gaps List */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-zinc-500">Scanning intelligence blind spots across accounts...</p>
        </div>
      ) : filteredGaps.length === 0 ? (
        <div className="py-16 text-center bg-zinc-800/30 rounded-xl border border-zinc-800/60 text-zinc-500 text-xs">
          No blind spots match the selected account filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGaps.map((gap) => (
            <div
              key={gap.id}
              className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-800/40 space-y-2.5 hover:border-zinc-700/80 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                    {gap.account_id}
                  </span>
                  <h3 className="font-semibold text-zinc-100 text-xs flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    {gap.missing_information}
                  </h3>
                </div>
                <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {gap.priority} Priority
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300">Why It Matters:</strong> {gap.importance}
              </p>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-xs">
                <strong className="text-zinc-400 block text-[10px] uppercase mb-1">
                  Recommended Question to Ask:
                </strong>
                <p className="text-blue-300 font-medium italic">
                  "{gap.recommended_question}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/60">
                <span className="text-zinc-500">
                  Suggested Lead: <strong className="text-zinc-300">{gap.suggested_owner}</strong>
                </span>
                {gap.evidence_source_id && (
                  <button
                    onClick={() => openEvidence(gap.evidence_id || gap.evidence_source_id)}
                    className="text-blue-400 hover:text-blue-300 font-mono text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Evidence: {gap.evidence_source_id}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlindSpotsPage;
