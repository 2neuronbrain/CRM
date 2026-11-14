import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import SeverityBadge from '../components/SeverityBadge';
import AccountSelector from '../components/AccountSelector';
import { AlertOctagon, FileText, Clock, Loader2 } from 'lucide-react';

export function RiskRadarPage() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
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
              const res = await fetch(`/api/accounts/${accId}/risks`);
              if (res.ok) {
                const rData = await res.json();
                if (rData.risks && Array.isArray(rData.risks)) {
                  rData.risks.forEach(r => {
                    all.push({
                      ...r,
                      account_id: accId,
                      account_name: acc.name
                    });
                  });
                }
              }
            } catch (err) {
              console.error(`Failed to load risks for ${accId}:`, err);
            }
          })
        );
        setRisks(all);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredRisks = risks.filter(r => {
    const matchesSev = severityFilter === 'ALL' || r.severity === severityFilter;
    const matchesAcc = accountFilter === 'ALL' || r.account_id === accountFilter;
    return matchesSev && matchesAcc;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Account Risk Radar</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time detection of approaching deadlines, customer escalations, departures, and usage drop-offs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <AccountSelector
            value={accountFilter}
            onChange={setAccountFilter}
            allLabel="All Accounts"
          />

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border border-zinc-700/60 rounded-lg px-2.5 py-1.5 bg-zinc-800/70 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          >
            <option value="ALL">All Severities</option>
            <option value="Red">Red (Critical)</option>
            <option value="Amber">Amber (Developing)</option>
            <option value="Green">Green (Managed)</option>
          </select>
        </div>
      </div>

      {/* Risks Stream */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-zinc-500">Scanning risk radars across enterprise accounts...</p>
        </div>
      ) : filteredRisks.length === 0 ? (
        <div className="py-16 text-center bg-zinc-800/30 rounded-xl border border-zinc-800/60 text-zinc-500 text-xs">
          No risks match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-800/40 space-y-3 hover:border-zinc-700/80 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <SeverityBadge severity={risk.severity} size="xs" />
                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                    {risk.account_id}
                  </span>
                  <h3 className="font-semibold text-zinc-100 text-xs">{risk.title}</h3>
                </div>

                {risk.trigger_date && (
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700/60">
                    Trigger: {risk.trigger_date}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {risk.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
                  <strong className="block text-[10px] uppercase text-red-400 mb-0.5">
                    Consequence If Unresolved:
                  </strong>
                  <p className="text-[11px] leading-relaxed">{risk.consequence}</p>
                </div>

                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300">
                  <strong className="block text-[10px] uppercase text-emerald-400 mb-0.5">
                    Recommended Mitigation:
                  </strong>
                  <p className="text-[11px] leading-relaxed">{risk.mitigation}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-800/60">
                <span className="text-zinc-500">
                  Responsible Owner: <strong className="text-zinc-300">{risk.responsible_owner}</strong>
                </span>
                {risk.evidence_source_id && (
                  <button
                    onClick={() => openEvidence(risk.evidence_id || risk.evidence_source_id)}
                    className="text-blue-400 hover:text-blue-300 font-mono text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Evidence: {risk.evidence_source_id}
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

export default RiskRadarPage;
