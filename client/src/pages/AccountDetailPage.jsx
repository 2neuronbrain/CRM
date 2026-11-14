import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SeverityBadge from '../components/SeverityBadge';
import SentimentBadge from '../components/SentimentBadge';
import AccountTimelineSection from '../components/AccountTimelineSection';
import AccountSelector from '../components/AccountSelector';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Target, 
  AlertOctagon, 
  EyeOff, 
  ShieldCheck, 
  FileText, 
  ChevronRight,
  Clock, 
  ArrowRight, 
  HelpCircle, 
  AlertTriangle,
  Loader2,
  Calendar,
  Briefcase
} from 'lucide-react';

export function AccountDetailPage() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { openEvidence } = useEvidence();

  const fetchAccount = async () => {
    try {
      const res = await fetch(`/api/accounts/${accountId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load account intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAccount();
    const interval = setInterval(fetchAccount, 8000);
    return () => clearInterval(interval);
  }, [accountId]);

  if (loading && !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
        <p className="text-xs text-zinc-500 font-medium">Retrieving account intelligence file...</p>
      </div>
    );
  }

  if (!data || !data.account) {
    return (
      <div className="py-24 text-center space-y-4">
        <Building2 className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-base font-semibold text-zinc-200">Account Not Found</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          The requested account ID does not exist or has not yet been ingested into the CRM database.
        </p>
        <Link 
          to="/accounts" 
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors border border-zinc-700/60"
        >
          &larr; Return to Accounts Directory
        </Link>
      </div>
    );
  }

  const { account, sentiment = {}, summary = {}, fiveQuestions = {} } = data;
  const q1 = fiveQuestions.question1_bookValue || { deals: [], totalVerifiedValue: 0, totalReportedValue: 0 };
  const q2 = fiveQuestions.question2_powerMap || { people: [], totalPeople: 0 };
  const q3 = fiveQuestions.question3_nextActions || { top3Actions: [], allActions: [] };
  const q4 = fiveQuestions.question4_riskRadar || { risks: [], overallStatus: 'Healthy' };
  const q5 = fiveQuestions.question5_blindSpots || { gaps: [], totalGaps: 0 };

  const tabs = [
    { id: 'all', label: 'All 5 Questions' },
    { id: 'bookValue', label: '1. Book Value', icon: DollarSign, count: q1.deals?.length },
    { id: 'powerMap', label: '2. Power Map', icon: Users, count: q2.people?.length },
    { id: 'actions', label: '3. Next Actions', icon: Target, count: q3.top3Actions?.length },
    { id: 'risks', label: '4. Risk Radar', icon: AlertOctagon, count: q4.risks?.length },
    { id: 'gaps', label: '5. Blind Spots', icon: EyeOff, count: q5.gaps?.length },
    { id: 'timeline', label: '6. Timeline', icon: Clock },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Account Header Card */}
      <div className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Acc {account.id}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {account.industry || 'Enterprise Customer'}
              </span>
              <span className="text-zinc-600">•</span>
              <SentimentBadge 
                status={sentiment.overallSentiment} 
                score={sentiment.sentimentScore} 
                size="xs" 
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {account.name}
            </h1>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
              {account.description || summary.oneLineVerdict || 'No description provided.'}
            </p>
          </div>

          {/* Quick Metrics Ribbon & Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <AccountSelector
                value={account.id}
                onChange={(newId) => {
                  if (newId !== 'ALL' && newId !== account.id) {
                    navigate(`/accounts/${newId}`);
                  }
                }}
                includeAll={false}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-zinc-900/60 border border-zinc-800/50 p-3 rounded-lg text-right min-w-[130px]">
                <span className="text-[10px] text-zinc-500 uppercase font-medium block font-mono">Verified Book</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ${(q1.totalVerifiedValue || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 block font-mono">
                  + ${(q1.totalReportedValue || 0).toLocaleString()} pipeline
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 border-t border-zinc-800/50 pt-4 overflow-x-auto text-xs scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUESTION 1: Book Value */}
      {(activeTab === 'all' || activeTab === 'bookValue') && (
        <section className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-sm font-semibold text-zinc-100">What is the book worth?</h2>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Constituent deals breakdown separating verified contracts from unverified claims.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
                Verified: ${(q1.totalVerifiedValue || 0).toLocaleString()}
              </span>
              <span className="bg-zinc-800 text-zinc-300 border border-zinc-700/60 px-2 py-0.5 rounded text-[11px] font-medium">
                Pipeline: ${(q1.totalReportedValue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Deals Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[10px] font-medium border-b border-zinc-800/60">
                <tr>
                  <th className="py-2.5 px-3">Opportunity / Deal</th>
                  <th className="py-2.5 px-3">Stage / Status</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                {!q1.deals || q1.deals.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500 text-xs">
                      No commercial deals recorded yet for this account.
                    </td>
                  </tr>
                ) : (
                  q1.deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-3 max-w-sm">
                        <strong className="text-zinc-100 block font-medium text-xs leading-snug">
                          {deal.title}
                        </strong>
                        <span className="text-[11px] text-zinc-500 truncate block mt-0.5">
                          {deal.description}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-zinc-800/70 text-zinc-300 font-medium text-[11px] border border-zinc-700/50">
                          {deal.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs text-zinc-100">
                          {parseFloat(deal.amount || 0) > 0 ? `$${parseFloat(deal.amount).toLocaleString()}` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <ConfidenceBadge confidence={deal.verification_status || 'Unknown'} size="xs" />
                      </td>
                      <td className="py-3 px-3">
                        {deal.evidence && deal.evidence.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {deal.evidence.map((ev) => (
                              <button
                                key={ev.id}
                                onClick={() => openEvidence(ev)}
                                className="inline-flex items-center gap-1 font-mono text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border border-zinc-700/60 px-1.5 py-0.5 rounded transition-colors"
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
        </section>
      )}

      {/* QUESTION 2: Power Map */}
      {(activeTab === 'all' || activeTab === 'powerMap') && (
        <section className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="text-sm font-semibold text-zinc-100">Who holds the power?</h2>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Account stakeholder power map: sponsors, gatekeepers, champions, blockers, and concerns.
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {q2.totalPeople || q2.people?.length || 0} Stakeholders
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {!q2.people || q2.people.length === 0 ? (
              <div className="col-span-full py-8 text-center text-zinc-500 text-xs">
                No stakeholders identified yet for this account.
              </div>
            ) : (
              q2.people.map((person) => {
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
                    className={`p-4 rounded-xl border transition-colors flex flex-col justify-between space-y-3 ${
                      isDeparting 
                        ? 'bg-red-950/20 border-red-800/40' 
                        : 'bg-zinc-900/50 border-zinc-800/60 hover:border-zinc-700/70'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-zinc-100 text-xs leading-snug">
                            {person.name}
                          </h4>
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            {person.role || person.title}
                          </span>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${stanceBadge}`}>
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
                          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Stated Stance / Concerns:</span>
                          <p className="bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-700/40 text-[11px] text-zinc-300 leading-relaxed">
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
              })
            )}
          </div>
        </section>
      )}

      {/* QUESTION 3: Next Actions */}
      {(activeTab === 'all' || activeTab === 'actions') && (
        <section className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-violet-500/15 text-violet-400 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h2 className="text-sm font-semibold text-zinc-100">What should we do first?</h2>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Deterministic explainable ranking: Deal Impact + Likelihood + Deadline Urgency.
              </p>
            </div>
            <span className="text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
              {q3.top3Actions?.length || 0} Priority Moves
            </span>
          </div>

          <div className="space-y-3">
            {!q3.top3Actions || q3.top3Actions.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No priority actions assigned for this account yet.
              </div>
            ) : (
              q3.top3Actions.map((action, idx) => (
                <div 
                  key={action.id} 
                  className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-zinc-700/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-700/60 mt-0.5">
                      #{idx + 1}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-zinc-100 text-xs leading-snug">
                          {action.title}
                        </h3>
                        {action.deadline && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded font-mono">
                            <Clock className="w-3 h-3" /> Due: {action.deadline}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {action.description}
                      </p>

                      {action.deterministicReasoning && (
                        <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-300 text-[11px] leading-relaxed">
                          <strong>Deterministic Basis:</strong> {action.deterministicReasoning}
                        </div>
                      )}

                      {action.expected_outcome && (
                        <p className="text-[11px] text-zinc-500">
                          <strong className="text-zinc-400">Target Outcome:</strong> {action.expected_outcome}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="md:w-52 bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/50 shrink-0 text-xs space-y-1.5">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-medium">Owner</span>
                      <strong className="text-zinc-200">{action.owner || 'Unassigned'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-medium">Deal Impact</span>
                      <span className="text-zinc-400 truncate block">{action.deal_title || 'Account Strategy'}</span>
                    </div>
                    {action.evidence_source_id && (
                      <div className="pt-1 border-t border-zinc-700/50">
                        <button
                          onClick={() => openEvidence(action.evidence_id || action.evidence_source_id)}
                          className="text-blue-400 hover:text-blue-300 font-mono text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          Evidence: {action.evidence_source_id}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* QUESTION 4: Risk Radar */}
      {(activeTab === 'all' || activeTab === 'risks') && (
        <section className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-red-500/15 text-red-400 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h2 className="text-sm font-semibold text-zinc-100">What is about to go wrong?</h2>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Active risk radar: approaching deadlines, departure voids, unanswered tickets, and hardware drop-offs.
              </p>
            </div>
            <SeverityBadge severity={q4.overallStatus} />
          </div>

          <div className="space-y-3">
            {!q4.risks || q4.risks.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No active threats or operational risks recorded for this account.
              </div>
            ) : (
              q4.risks.map((risk) => (
                <div 
                  key={risk.id} 
                  className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 space-y-3 hover:border-zinc-700/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={risk.severity} size="xs" />
                      <h3 className="font-semibold text-zinc-100 text-xs">{risk.title}</h3>
                    </div>
                    {risk.trigger_date && (
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60">
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
                      Owner: <strong className="text-zinc-300">{risk.responsible_owner}</strong>
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
              ))
            )}
          </div>
        </section>
      )}

      {/* QUESTION 5: Blind Spots */}
      {(activeTab === 'all' || activeTab === 'gaps') && (
        <section className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <h2 className="text-sm font-semibold text-zinc-100">What do we still not know?</h2>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Strategic unknowns and recommended discovery questions before decisions lock.
              </p>
            </div>
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {q5.totalGaps || q5.gaps?.length || 0} Intelligence Gaps
            </span>
          </div>

          <div className="space-y-3">
            {!q5.gaps || q5.gaps.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No blind spots currently unaddressed for this account.
              </div>
            ) : (
              q5.gaps.map((gap) => (
                <div key={gap.id} className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 space-y-2.5 hover:border-zinc-700/70 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-zinc-100 text-xs flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      {gap.missing_information}
                    </h3>
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {gap.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <strong className="text-zinc-300">Why It Matters:</strong> {gap.importance}
                  </p>

                  <div className="p-3 bg-zinc-850 bg-zinc-900/80 border border-zinc-800/80 rounded-lg text-xs">
                    <strong className="text-zinc-400 block text-[10px] uppercase mb-1">
                      Recommended Question to Ask:
                    </strong>
                    <p className="text-blue-300 font-medium italic">
                      "{gap.recommended_question}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
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
              ))
            )}
          </div>
        </section>
      )}

      {/* QUESTION 6: Interaction Timeline */}
      {(activeTab === 'all' || activeTab === 'timeline') && (
        <AccountTimelineSection accountId={account.id} />
      )}
    </div>
  );
}

export default AccountDetailPage;
