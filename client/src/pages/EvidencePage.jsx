import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { FileSearch, Search, Filter, FileText, Database, Calendar, Tag, ShieldCheck } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Evidence Repository & Provenance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable source repository of original unmanipulated paperwork, emails, contracts, and signals.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-right">
          <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Total Provenance Records</span>
          <span className="font-extrabold text-emerald-900 text-base">
            {evidenceList.length} Archived Sources
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search keywords, contract terms, tickets, or source IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Accounts</option>
            <option value="A">Eastern Counties (A)</option>
            <option value="B">Aldermoor (B)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Source Types</option>
            <option value="contract">Contracts</option>
            <option value="call">Call Transcripts</option>
            <option value="email">Emails</option>
            <option value="signal">Live Signals</option>
            <option value="usage">Usage / Flights</option>
          </select>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs">
            Loading evidence repository...
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No evidence records matched your search parameters.
          </div>
        ) : (
          filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              onClick={() => openEvidence(ev)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                    {ev.source_id || ev.id}
                  </span>
                  <ConfidenceBadge confidence={ev.confidence || 'Verified'} size="xs" />
                </div>

                <div className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-3 rounded-lg line-clamp-3 leading-relaxed mb-3">
                  {ev.excerpt}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                  {ev.account_name && (
                    <span>Account: <strong className="text-slate-700">{ev.account_name}</strong></span>
                  )}
                  <span className="capitalize">Type: <strong className="text-slate-700">{ev.source_type}</strong></span>
                  {ev.source_date && (
                    <span>Date: <strong className="text-slate-700">{ev.source_date}</strong></span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">{ev.tool_name || 'MCP Tool'}</span>
                <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                  View Full Provenance &rarr;
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EvidencePage;
