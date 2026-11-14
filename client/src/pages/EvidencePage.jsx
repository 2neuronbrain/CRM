import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import AccountSelector from '../components/AccountSelector';
import { Search, FileText, Loader2 } from 'lucide-react';

export function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const { openEvidence } = useEvidence();

  const fetchEvidence = async () => {
    try {
      let url = '/api/evidence?';
      if (accountFilter !== 'ALL') url += `accountId=${accountFilter}&`;
      if (searchTerm) url += `query=${encodeURIComponent(searchTerm)}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvidenceList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [accountFilter, searchTerm]);

  const filteredEvidence = evidenceList.filter(ev => {
    return typeFilter === 'ALL' || (ev.source_type || '').toLowerCase().includes(typeFilter.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Evidence Repository & Provenance</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Source repository of original unmanipulated paperwork, emails, contracts, and signals.
          </p>
        </div>

        <div className="bg-zinc-800/60 border border-zinc-700/50 px-3 py-1.5 rounded-xl text-right">
          <span className="text-[10px] text-zinc-500 uppercase font-medium block font-mono">Archived Sources</span>
          <span className="font-bold text-emerald-400 text-sm font-mono">
            {evidenceList.length} Records
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-800/60 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search raw transcripts, excerpts, filenames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-700/60 rounded-lg text-xs bg-zinc-900/60 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <AccountSelector
            value={accountFilter}
            onChange={setAccountFilter}
            allLabel="All Accounts"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-zinc-700/60 rounded-lg px-2.5 py-2 bg-zinc-800/70 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          >
            <option value="ALL">All Source Types</option>
            <option value="contract">Contracts</option>
            <option value="email">Emails</option>
            <option value="call">Call Notes</option>
            <option value="signal">Signals</option>
            <option value="fact">Facts</option>
          </select>
        </div>
      </div>

      {/* Evidence Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-zinc-500">Indexing evidence records...</p>
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="py-16 text-center bg-zinc-800/30 rounded-xl border border-zinc-800/60 text-zinc-500 text-xs">
          No evidence records match your search filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              onClick={() => openEvidence(ev)}
              className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-800/40 hover:border-zinc-700/80 cursor-pointer transition-colors shadow-sm flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                      {ev.account_id ? `Acc ${ev.account_id}` : 'Global'}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                      {ev.source_type || 'Record'}
                    </span>
                  </div>
                  <ConfidenceBadge confidence={ev.confidence || 'Reported'} size="xs" />
                </div>

                <div className="font-mono font-medium text-xs text-zinc-200 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400" />
                  <span className="truncate">{ev.source_id || ev.id}</span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-sans bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                  {ev.excerpt}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>{ev.tool_name || 'MCP Tool'}</span>
                <span className="text-blue-400 group-hover:underline">Inspect Provenance &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EvidencePage;
