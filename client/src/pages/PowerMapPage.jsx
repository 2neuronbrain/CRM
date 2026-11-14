import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import AccountSelector from '../components/AccountSelector';
import { Users, FileText, Loader2, AlertTriangle } from 'lucide-react';

export function PowerMapPage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('ALL');
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
              const res = await fetch(`/api/accounts/${accId}/stakeholders`);
              if (res.ok) {
                const sData = await res.json();
                if (sData.people && Array.isArray(sData.people)) {
                  sData.people.forEach(p => {
                    all.push({
                      ...p,
                      account_id: accId,
                      account_name: acc.name
                    });
                  });
                }
              }
            } catch (err) {
              console.error(`Failed to load stakeholders for ${accId}:`, err);
            }
          })
        );
        setPeople(all);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPeople = people.filter(p => selectedAccount === 'ALL' || p.account_id === selectedAccount);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Stakeholder Power Map</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Who makes decisions, controls budgets, champions adoption, or poses a blocking risk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AccountSelector
            value={selectedAccount}
            onChange={setSelectedAccount}
            allLabel="All Accounts"
          />
        </div>
      </div>

      {/* Stakeholders Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-zinc-500">Mapping account power relationships...</p>
        </div>
      ) : filteredPeople.length === 0 ? (
        <div className="py-16 text-center bg-zinc-800/30 rounded-xl border border-zinc-800/60 text-zinc-500 text-xs">
          No stakeholders match the selected account filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => {
            const isDeparting = (person.stance || '').toLowerCase().includes('depart');
            const stanceLower = (person.stance || '').toLowerCase();
            let stanceBadge = 'bg-zinc-800 text-zinc-400 border-zinc-700/60';
            if (isDeparting) {
              stanceBadge = 'bg-red-500/15 text-red-400 border-red-500/30';
            } else if (stanceLower.includes('support') || stanceLower.includes('warm') || stanceLower.includes('champion')) {
              stanceBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            } else if (stanceLower.includes('guard')) {
              stanceBadge = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            }

            return (
              <div 
                key={person.id} 
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-colors ${
                  isDeparting 
                    ? 'bg-red-950/20 border-red-800/40' 
                    : 'bg-zinc-800/40 border-zinc-800/60 hover:border-zinc-700/80'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                          {person.account_id}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium truncate max-w-[150px]">
                          {person.account_name}
                        </span>
                      </div>
                      <h3 className="font-bold text-zinc-100 text-xs leading-tight">
                        {person.name}
                      </h3>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        {person.role || person.title}
                      </span>
                    </div>

                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border uppercase font-mono ${stanceBadge}`}>
                      {person.stance}
                    </span>
                  </div>

                  {isDeparting && (
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-300 text-[11px] leading-relaxed">
                      ⚠️ <strong>Departing Soon:</strong> Handover required immediately. No successor named.
                    </div>
                  )}

                  {person.concerns && (
                    <div className="text-xs space-y-1">
                      <strong className="text-zinc-500 block text-[10px] uppercase font-semibold">Stated Concerns:</strong>
                      <p className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80 text-[11px] text-zinc-300 leading-relaxed">
                        {person.concerns}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-800/60 pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Source:</span>
                  {person.evidence && person.evidence.length > 0 ? (
                    <button
                      onClick={() => openEvidence(person.evidence[0])}
                      className="text-blue-400 hover:text-blue-300 font-mono text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      {person.evidence[0].source_id || person.evidence[0].id}
                    </button>
                  ) : (
                    <span className="text-zinc-500 font-mono text-[10px]">MCP Account Roster</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PowerMapPage;
