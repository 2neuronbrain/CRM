import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import SentimentBadge from '../components/SentimentBadge';
import { HeartHandshake, TrendingDown, TrendingUp, AlertTriangle, FileText, User, Quote, ShieldAlert } from 'lucide-react';

export function CustomerSentimentPage() {
  const [sentiments, setSentiments] = useState({ A: null, B: null });
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const { openEvidence } = useEvidence();

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts/A/sentiment').then(r => r.json()),
      fetch('/api/accounts/B/sentiment').then(r => r.json())
    ]).then(([resA, resB]) => {
      setSentiments({ A: resA, B: resB });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const accounts = [
    { id: 'A', name: 'Eastern Counties Police Alliance', data: sentiments.A },
    { id: 'B', name: 'Aldermoor Industrial Group', data: sentiments.B }
  ].filter(acc => selectedAccount === 'ALL' || acc.id === selectedAccount);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Sentiment & Relationship Health</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evidence-backed sentiment signals extracted from call transcripts, email exchanges, and ticket escalations.
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
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {acc === 'ALL' ? 'All Accounts' : acc === 'A' ? 'Eastern Counties' : 'Aldermoor'}
            </button>
          ))}
        </div>
      </div>

      {/* Account Sentiment Briefings */}
      <div className="space-y-6">
        {accounts.map(({ id, name, data }) => {
          if (!data) return null;
          return (
            <div key={id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                      Account {id}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{name}</h2>
                  </div>
                  <p className="text-xs text-slate-500">{data.trendLabel}</p>
                </div>

                <div className="flex items-center gap-2">
                  <SentimentBadge status={data.overallSentiment} score={data.sentimentScore} />
                </div>
              </div>

              {/* Summary Statement */}
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                <strong className="text-slate-900 block font-semibold mb-1">Executive Sentiment Overview:</strong>
                {data.summary}
              </p>

              {/* Drivers & Stakeholder Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Key Drivers */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Primary Sentiment Drivers
                  </h3>
                  <div className="space-y-2.5">
                    {data.drivers?.map((driver, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{driver.title}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            driver.type === 'negative' ? 'bg-rose-50 text-rose-700' :
                            driver.type === 'positive' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {driver.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{driver.detail}</p>
                        {driver.evidenceId && (
                          <button
                            onClick={() => openEvidence(driver.evidenceId)}
                            className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 font-mono pt-0.5"
                          >
                            <FileText className="w-3 h-3" />
                            Verify Evidence
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stakeholder Quotes & Stances */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Stakeholder Sentiment Stances
                  </h3>
                  <div className="space-y-2.5">
                    {data.stakeholderBreakdown?.map((sh, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong className="text-slate-900 block font-semibold">{sh.name}</strong>
                            <span className="text-[11px] text-slate-500">{sh.role}</span>
                          </div>
                          <SentimentBadge status={sh.sentiment} score={sh.sentimentScore} size="xs" />
                        </div>

                        {sh.keyQuote && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2 text-[11px] text-slate-700 italic">
                            <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>"{sh.keyQuote}"</span>
                          </div>
                        )}

                        {sh.evidenceId && (
                          <div className="text-right">
                            <button
                              onClick={() => openEvidence(sh.evidenceId)}
                              className="text-[10px] text-emerald-700 hover:underline font-mono inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              View Quote Provenance
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomerSentimentPage;
