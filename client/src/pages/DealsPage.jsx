import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { Briefcase, Search, Filter, ShieldCheck, DollarSign, FileText, ArrowUpDown } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deal & Commercial Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Traceable commercial contracts, proposals, and pipeline opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Verified Book Total</span>
            <span className="font-extrabold text-emerald-900 text-base">
              ${verifiedTotal.toLocaleString()}
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-amber-700 uppercase font-semibold block">Reported Unverified</span>
            <span className="font-extrabold text-amber-900 text-base">
              ${reportedTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search deals, descriptions, or force..."
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
            <option value="A">Account A (Eastern Counties)</option>
            <option value="B">Account B (Aldermoor)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Verifications</option>
            <option value="Verified">Verified Only</option>
            <option value="Reported">Reported Only</option>
            <option value="Unknown">Unknown Value</option>
          </select>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Deal Title & Description</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Commercial Value</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Deal Stage</th>
                <th className="py-3 px-4">Supporting Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading commercial opportunities...
                  </td>
                </tr>
              ) : filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No deals match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 max-w-sm">
                      <strong className="text-slate-900 block font-semibold text-sm">
                        {deal.title}
                      </strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {deal.description}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        Acc {deal.account_id}
                      </span>
                      <span className="block text-[11px] text-slate-600 mt-0.5">
                        {deal.account_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {parseFloat(deal.amount || 0) > 0 ? `$${parseFloat(deal.amount).toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ConfidenceBadge confidence={deal.verification_status || 'Unknown'} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
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
                              className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 px-2 py-0.5 rounded transition text-slate-700"
                              title="Click to view traceable provenance"
                            >
                              <FileText className="w-3 h-3 text-emerald-600" />
                              {ev.source_id || ev.id}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No linked record</span>
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
