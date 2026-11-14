import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import { Users, Shield, UserCheck, UserX, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

export function PowerMapPage() {
  const [data, setData] = useState({ A: null, B: null });
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const { openEvidence } = useEvidence();

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts/A/stakeholders').then(r => r.json()),
      fetch('/api/accounts/B/stakeholders').then(r => r.json())
    ]).then(([resA, resB]) => {
      setData({ A: resA, B: resB });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allPeople = [
    ...(data.A?.people || []).map(p => ({ ...p, account_id: 'A', account_name: 'Eastern Counties Police Alliance' })),
    ...(data.B?.people || []).map(p => ({ ...p, account_id: 'B', account_name: 'Aldermoor Industrial Group' }))
  ];

  const filteredPeople = allPeople.filter(p => selectedAccount === 'ALL' || p.account_id === selectedAccount);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stakeholder Power Map</h1>
          <p className="text-xs text-slate-500 mt-1">
            Who makes decisions, controls budgets, champions adoption, or poses a blocking risk.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'A', 'B'].map((acc) => (
            <button
              key={acc}
              onClick={() => setSelectedAccount(acc)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedAccount === acc
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {acc === 'ALL' ? 'All Accounts' : acc === 'A' ? 'Eastern Counties' : 'Aldermoor'}
            </button>
          ))}
        </div>
      </div>

      {/* Stakeholders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPeople.map((person) => {
          const isDeparting = (person.stance || '').toLowerCase().includes('depart');
          return (
            <div
              key={person.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition ${
                isDeparting ? 'border-rose-300 ring-2 ring-rose-200/50' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Account {person.account_id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1 leading-snug">
                      {person.name}
                    </h3>
                    <span className="text-xs text-slate-500 block">{person.role}</span>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    isDeparting ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' :
                    person.stance === 'Supportive' || person.stance === 'Warm' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    person.stance === 'Guarded' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    person.stance === 'Resistant' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {person.stance}
                  </span>
                </div>

                {/* Stance details / departure notice */}
                {isDeparting && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 text-xs mb-3 space-y-1">
                    <strong className="flex items-center gap-1 text-rose-800 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Risk Departure
                    </strong>
                    <p className="text-[11px] leading-relaxed">
                      Rhys Calder is leaving the alliance drone programme in January. Handover required immediately; no successor named yet.
                    </p>
                  </div>
                )}

                {/* Concerns or notes */}
                {person.concerns && (
                  <div className="text-xs text-slate-700 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <strong className="block text-[10px] uppercase text-slate-900 mb-1">
                      Identified Concerns:
                    </strong>
                    <p className="text-[11px] leading-relaxed italic text-slate-700">
                      "{person.concerns}"
                    </p>
                  </div>
                )}

                {person.dealConnections && person.dealConnections.length > 0 && (
                  <div className="text-xs text-slate-600 mb-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                      Deal Relationship:
                    </span>
                    <div className="space-y-1">
                      {person.dealConnections.map((d, i) => (
                        <div key={i} className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-800 truncate">
                          {d.deal_title || 'Deal'} • <strong>{d.relationship_role}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Provenance footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">Source Evidence:</span>
                {person.evidence && person.evidence.length > 0 ? (
                  <button
                    onClick={() => openEvidence(person.evidence[0])}
                    className="text-emerald-700 hover:text-emerald-800 font-mono text-[10px] underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    {person.evidence[0].source_id || person.evidence[0].id}
                  </button>
                ) : (
                  <span className="text-slate-400 font-mono text-[10px]">MCP Account Roster</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PowerMapPage;
