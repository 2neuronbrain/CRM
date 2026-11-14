import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SeverityBadge from '../components/SeverityBadge';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Target, 
  AlertOctagon, 
  EyeOff, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';

export function AccountDetailPage() {
  const { accountId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, bookValue, powerMap, actions, risks, gaps
  const { openEvidence } = useEvidence();

  const fetchAccount = async () => {
    try {
      const res = await fetch(`/api/accounts/${accountId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load account:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
    const interval = setInterval(fetchAccount, 6000);
    return () => clearInterval(interval);
  }, [accountId]);

  if (loading && !data) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Retrieving account intelligence file...</p>
      </div>
    );
  }

  if (!data || !data.account) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-600">Account not found or not yet ingested.</p>
        <Link to="/" className="mt-4 inline-block text-emerald-600 font-semibold text-xs">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const { account, fiveQuestions } = data;
  const { 
    question1_bookValue: q1, 
    question2_powerMap: q2, 
    question3_nextActions: q3, 
    question4_riskRadar: q4, 
    question5_blindSpots: q5 
  } = fiveQuestions;

  return (
    <div className="space-y-6 pb-12">
      {/* Account Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded">
                Account {account.id}
              </span>
              <span className="text-xs text-slate-500">
                Last synchronized: {account.last_synced_at ? new Date(account.last_synced_at).toLocaleTimeString() : 'Live'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {account.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {account.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Verified Book</span>
              <div className="flex items-center justify-end gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-2xl font-black text-emerald-700">
                  ${(q1.totalVerifiedValue || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                + ${(q1.totalReportedValue || 0).toLocaleString()} reported
              </span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-100 pt-4 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All 5 Questions' },
            { id: 'bookValue', label: '1. Book Value', icon: DollarSign },
            { id: 'powerMap', label: '2. Power Map', icon: Users },
            { id: 'actions', label: '3. Next Actions', icon: Target },
            { id: 'risks', label: '4. Risk Radar', icon: AlertOctagon },
            { id: 'gaps', label: '5. Blind Spots', icon: EyeOff },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* QUESTION 1: Book Value */}
      {(activeTab === 'all' || activeTab === 'bookValue') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900">What is the book worth?</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Constituent deals breakdown separating verified contracts from unverified claims.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-semibold">
                Verified: ${(q1.totalVerifiedValue || 0).toLocaleString()}
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded font-semibold">
                Reported: ${(q1.totalReportedValue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Deals Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Opportunity / Deal</th>
                  <th className="py-2.5 px-3">Stage / Status</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3">Source Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {q1.deals.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No deals recorded yet for this account.
                    </td>
                  </tr>
                ) : (
                  q1.deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block">{deal.title}</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-sm block">
                          {deal.description}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {deal.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {deal.amount > 0 ? `$${deal.amount.toLocaleString()}` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <ConfidenceBadge confidence={deal.verification_status || 'Unknown'} size="xs" />
                      </td>
                      <td className="py-3 px-3">
                        {deal.evidence && deal.evidence.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {deal.evidence.map((ev) => (
                              <button
                                key={ev.id}
                                onClick={() => openEvidence(ev)}
                                className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 px-1.5 py-0.5 rounded transition text-slate-700"
                                title="Click to inspect unedited source provenance"
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
        </section>
      )}

      {/* QUESTION 2: Power Map */}
      {(activeTab === 'all' || activeTab === 'powerMap') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900">Who holds the power?</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Account stakeholder intelligence: decision-makers, champions, payers, blockers, and departures.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {q2.totalPeople} identified stakeholders
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {q2.people.map((person) => {
              const isDeparting = (person.stance || '').toLowerCase().includes('depart');
              return (
                <div 
                  key={person.id} 
                  className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                    isDeparting 
                      ? 'bg-rose-50/60 border-rose-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">
                          {person.name}
                        </h4>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          {person.role}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                        isDeparting ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' :
                        person.stance === 'Supportive' || person.stance === 'Warm' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        person.stance === 'Guarded' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        person.stance === 'Resistant' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {person.stance}
                      </span>
                    </div>

                    {/* Departure warning banner if applicable */}
                    {isDeparting && (
                      <div className="p-2 bg-rose-100/80 rounded border border-rose-200 text-rose-900 text-[11px] font-medium mb-3">
                        ⚠️ <strong>Departing in January:</strong> Handover required immediately. No successor named.
                      </div>
                    )}

                    {/* Stated Concerns */}
                    {person.concerns && (
                      <div className="text-xs text-slate-700 mb-2">
                        <strong className="text-slate-900 block text-[10px] uppercase">Concerns:</strong>
                        <p className="bg-white/80 p-2 rounded border border-slate-200/60 text-[11px] leading-relaxed">
                          {person.concerns}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Evidence tag */}
                  <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Source:</span>
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
        </section>
      )}

      {/* QUESTION 3: Next Best Actions */}
      {(activeTab === 'all' || activeTab === 'actions') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h2 className="text-lg font-bold text-slate-900">What should we do first?</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic prioritization algorithm: Deal Value + Likelihood of Success + Deadline Urgency.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded">
              Top 3 Moves Ranked
            </span>
          </div>

          <div className="space-y-4">
            {q3.top3Actions.map((action, idx) => (
              <div 
                key={action.id} 
                className="p-5 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow">
                    #{idx + 1}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {action.title}
                      </h3>
                      {action.deadline && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> Due: {action.deadline}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {action.description}
                    </p>

                    <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-lg text-purple-900 text-xs leading-relaxed">
                      <strong>Deterministic Ranking Basis:</strong> {action.deterministicReasoning}
                    </div>

                    {action.expected_outcome && (
                      <p className="text-[11px] text-slate-600">
                        <strong className="text-slate-800">Target Outcome:</strong> {action.expected_outcome}
                      </p>
                    )}
                  </div>
                </div>

                <div className="md:w-56 bg-slate-100/70 p-3 rounded-lg border border-slate-200 shrink-0 text-xs space-y-2">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Assigned Owner</span>
                    <strong className="text-slate-800">{action.owner || 'Unassigned'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Deal Impact</span>
                    <span className="text-slate-700">{action.deal_title || 'Account Strategy'}</span>
                  </div>
                  {action.evidence_source_id && (
                    <div className="pt-1 border-t border-slate-200">
                      <button
                        onClick={() => openEvidence(action.evidence_id || action.evidence_source_id)}
                        className="text-emerald-700 hover:text-emerald-800 font-mono text-[10px] underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Evidence: {action.evidence_source_id}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* QUESTION 4: Risk Radar */}
      {(activeTab === 'all' || activeTab === 'risks') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h2 className="text-lg font-bold text-slate-900">What is about to go wrong?</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active risk radar: approaching deadlines, departure events, unanswered customer requests, usage drop-offs.
              </p>
            </div>
            <SeverityBadge severity={q4.overallStatus} />
          </div>

          <div className="space-y-4">
            {q4.risks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active risks recorded for this account.
              </div>
            ) : (
              q4.risks.map((risk) => (
                <div 
                  key={risk.id} 
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={risk.severity} />
                      <h3 className="font-bold text-slate-900 text-sm">{risk.title}</h3>
                    </div>
                    {risk.trigger_date && (
                      <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Trigger: {risk.trigger_date}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {risk.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950">
                      <strong className="block text-[11px] uppercase text-rose-800 mb-1">
                        Consequence If Unresolved:
                      </strong>
                      <p className="text-[11px] leading-relaxed">{risk.consequence}</p>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950">
                      <strong className="block text-[11px] uppercase text-emerald-800 mb-1">
                        Recommended Mitigation:
                      </strong>
                      <p className="text-[11px] leading-relaxed">{risk.mitigation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">
                      Responsible Owner: <strong className="text-slate-800">{risk.responsible_owner}</strong>
                    </span>
                    {risk.evidence_source_id && (
                      <button
                        onClick={() => openEvidence(risk.evidence_id || risk.evidence_source_id)}
                        className="text-emerald-700 hover:text-emerald-800 font-mono text-[10px] underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Evidence: {risk.evidence_source_id}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* QUESTION 5: Blind-Spot Finder */}
      {(activeTab === 'all' || activeTab === 'gaps') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <h2 className="text-lg font-bold text-slate-900">What do we still not know?</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Strategic unknowns and recommended discovery questions to resolve before Monday decisions.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
              {q5.totalGaps} Intelligence Gaps
            </span>
          </div>

          <div className="space-y-4">
            {q5.gaps.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No blind spots currently unaddressed.
              </div>
            ) : (
              q5.gaps.map((gap) => (
                <div key={gap.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      {gap.missing_information}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      {gap.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Why It Matters:</strong> {gap.importance}
                  </p>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                    <strong className="text-slate-900 block text-[11px] uppercase mb-1">
                      Recommended Question to Ask:
                    </strong>
                    <p className="text-emerald-900 font-medium italic">
                      "{gap.recommended_question}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Suggested Lead: <strong className="text-slate-700">{gap.suggested_owner}</strong>
                    </span>
                    {gap.evidence_source_id && (
                      <button
                        onClick={() => openEvidence(gap.evidence_id || gap.evidence_source_id)}
                        className="text-emerald-700 hover:text-emerald-800 font-mono text-[10px] underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Evidence: {gap.evidence_source_id}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default AccountDetailPage;
