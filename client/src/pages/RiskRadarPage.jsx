import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import SeverityBadge from '../components/SeverityBadge';
import { AlertOctagon, AlertTriangle, ShieldCheck, FileText, Clock, Filter } from 'lucide-react';

export function RiskRadarPage() {
  const [risksA, setRisksA] = useState([]);
  const [risksB, setRisksB] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const { openEvidence } = useEvidence();

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts/A/risks').then(r => r.json()),
      fetch('/api/accounts/B/risks').then(r => r.json())
    ]).then(([resA, resB]) => {
      setRisksA((resA.risks || []).map(r => ({ ...r, account_id: 'A', account_name: 'Eastern Counties Police Alliance' })));
      setRisksB((resB.risks || []).map(r => ({ ...r, account_id: 'B', account_name: 'Aldermoor Industrial Group' })));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allRisks = [...risksA, ...risksB];
  const filteredRisks = allRisks.filter(r => {
    const matchesSev = severityFilter === 'ALL' || r.severity === severityFilter;
    const matchesAcc = accountFilter === 'ALL' || r.account_id === accountFilter;
    return matchesSev && matchesAcc;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Risk Radar</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time detection of approaching deadlines, unanswered customer escalations, departures, and usage freezes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="ALL">All Accounts</option>
            <option value="A">Eastern Counties</option>
            <option value="B">Aldermoor</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Red">Red (Immediate Intervention)</option>
            <option value="Amber">Amber (Developing Risk)</option>
            <option value="Green">Green (Evidence-backed Healthy)</option>
          </select>
        </div>
      </div>

      {/* Risks Grid */}
      <div className="space-y-4">
        {filteredRisks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No risks matching selected filter criteria.
          </div>
        ) : (
          filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Account {risk.account_id}
                    </span>
                    <SeverityBadge severity={risk.severity} />
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {risk.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 block">
                    {risk.account_name}
                  </span>
                </div>

                {risk.trigger_date && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded shrink-0">
                    <Clock className="w-3.5 h-3.5" /> Trigger: {risk.trigger_date}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {risk.description}
              </p>

              {/* Consequence & Mitigation Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                  <strong className="block text-[11px] uppercase tracking-wider text-rose-800 font-bold">
                    Consequence If Unresolved:
                  </strong>
                  <p className="text-rose-950 text-xs leading-relaxed">
                    {risk.consequence}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                  <strong className="block text-[11px] uppercase tracking-wider text-emerald-800 font-bold">
                    Recommended Mitigation:
                  </strong>
                  <p className="text-emerald-950 text-xs leading-relaxed">
                    {risk.mitigation}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">
                  Responsible Lead: <strong className="text-slate-800">{risk.responsible_owner}</strong>
                </span>
                {risk.evidence_source_id && (
                  <button
                    onClick={() => openEvidence(risk.evidence_id || risk.evidence_source_id)}
                    className="text-emerald-700 hover:text-emerald-800 font-mono text-[10px] underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Trace Evidence: {risk.evidence_source_id}
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

export default RiskRadarPage;
