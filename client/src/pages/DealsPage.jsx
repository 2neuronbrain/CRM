import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import AccountSelector from '../components/AccountSelector';
import { Briefcase, Search, FileText, ChevronDown } from 'lucide-react';

export function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { openEvidence } = useEvidence();

  useEffect(() => {
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => setDeals(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = (deal.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (deal.account_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = accountFilter === 'ALL' || deal.account_id === accountFilter;
    const matchesStatus = statusFilter === 'ALL' || deal.verification_status === statusFilter;
    return matchesSearch && matchesAccount && matchesStatus;
  });

  const verifiedTotal = filteredDeals
    .filter(d => d.verification_status === 'Verified')
    .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  const reportedTotal = filteredDeals
    .filter(d => d.verification_status === 'Reported')
    .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Deal & Commercial Intelligence</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Traceable commercial contracts, proposals, and pipeline opportunities across all accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-800/60 border border-zinc-700/50 px-3.5 py-2 rounded-xl text-right min-w-[140px]">
            <span className="text-[10px] text-zinc-500 uppercase font-medium block font-mono">Verified Total</span>
            <span className="font-bold text-emerald-400 text-lg font-mono">
              ${verifiedTotal.toLocaleString()}
            </span>
          </div>
          <div className="bg-zinc-800/60 border border-zinc-700/50 px-3.5 py-2 rounded-xl text-right min-w-[140px]">
            <span className="text-[10px] text-zinc-500 uppercase font-medium block font-mono">Reported Pipeline</span>
            <span className="font-bold text-zinc-200 text-lg font-mono">
              ${reportedTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-800/60 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search deals, descriptions, or accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-700/60 rounded-lg text-xs bg-zinc-900/60 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          {/* Elegant Account Filter */}
          <AccountSelector
            value={accountFilter}
            onChange={setAccountFilter}
            allLabel="All Accounts"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-zinc-700/60 rounded-lg px-3 py-2 bg-zinc-800/70 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          >
            <option value="ALL">All Verifications</option>
            <option value="Verified">Verified Only</option>
            <option value="Reported">Reported Only</option>
            <option value="Unknown">Unknown Value</option>
          </select>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[10px] font-medium border-b border-zinc-800/60">
              <tr>
                <th className="py-3 px-4">Deal Title & Description</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Commercial Value</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Deal Stage</th>
                <th className="py-3 px-4">Supporting Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-500">
                    Loading commercial opportunities...
                  </td>
                </tr>
              ) : filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-500">
                    No deals match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <strong className="text-zinc-100 block font-medium text-xs leading-snug">
                        {deal.title}
                      </strong>
                      <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {deal.description}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                          {deal.account_id}
                        </span>
                        <span className="text-[11px] text-zinc-300 font-medium">
                          {deal.account_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-xs text-zinc-100">
                        {parseFloat(deal.amount || 0) > 0 ? `$${parseFloat(deal.amount).toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ConfidenceBadge confidence={deal.verification_status || 'Unknown'} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-[11px] font-medium border border-zinc-700/50">
                        {deal.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {deal.evidence && deal.evidence.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {deal.evidence.map((ev) => (
                            <button
                              key={ev.id}
                              onClick={() => openEvidence(ev)}
                              className="inline-flex items-center gap-1 font-mono text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border border-zinc-700/60 px-2 py-0.5 rounded transition-colors"
                              title="Click to view traceable provenance"
                            >
                              <FileText className="w-3 h-3 text-blue-400" />
                              {ev.source_id || ev.id}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[10px]">No linked record</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DealsPage;
