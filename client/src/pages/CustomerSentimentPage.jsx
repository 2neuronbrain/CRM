import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import SentimentBadge from '../components/SentimentBadge';
import AccountSelector from '../components/AccountSelector';
import { HeartHandshake, TrendingDown, TrendingUp, AlertTriangle, FileText, User, Quote, Loader2 } from 'lucide-react';

export function CustomerSentimentPage() {
  const [accountList, setAccountList] = useState([]);
  const [sentiments, setSentiments] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const { openEvidence } = useEvidence();

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(async (accs) => {
        if (!Array.isArray(accs)) return;
        setAccountList(accs);
        const sentimentMap = {};
        await Promise.all(
          accs.map(async (acc) => {
            const accId = acc.accountId || acc.id;
            try {
              const res = await fetch(`/api/accounts/${accId}/sentiment`);
              if (res.ok) {
                sentimentMap[accId] = await res.json();
              }
            } catch (err) {
              console.error(`Failed to load sentiment for ${accId}:`, err);
            }
          })
        );
        setSentiments(sentimentMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const visibleAccounts = accountList
    .map(acc => {
      const id = acc.accountId || acc.id;
      return {
        id,
        name: acc.name,
        data: sentiments[id]
      };
    })
    .filter(acc => selectedAccount === 'ALL' || acc.id === selectedAccount);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Customer Sentiment & Relationship Health</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Evidence-backed sentiment signals extracted from call transcripts, email exchanges, and escalations.
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

      {/* Account Sentiment Briefings */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-zinc-500">Evaluating relationship health & sentiment signals...</p>
        </div>
      ) : visibleAccounts.length === 0 ? (
        <div className="py-16 text-center bg-zinc-800/30 rounded-xl border border-zinc-800/60 text-zinc-500 text-xs">
          No sentiment records found for the selected account filter.
        </div>
      ) : (
        <div className="space-y-5">
          {visibleAccounts.map(({ id, name, data }) => {
            if (!data) return null;
            return (
              <div key={id} className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4 shadow-sm">
                {/* Account Sentiment Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                      {id}
                    </span>
                    <h2 className="text-sm font-bold text-zinc-100">
                      {name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <SentimentBadge status={data.overallSentiment} score={data.sentimentScore} />
                    <span className="text-xs text-zinc-400 font-mono">
                      {data.trendLabel}
                    </span>
                  </div>
                </div>

                {/* Synthesis Summary */}
                <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/50 leading-relaxed font-medium">
                  {data.summary}
                </p>

                {/* Drivers Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Core Sentiment Drivers:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {data.drivers?.map((driver, idx) => {
                      const isNeg = driver.type === 'negative';
                      const isPos = driver.type === 'positive';
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border text-xs space-y-1.5 flex flex-col justify-between ${
                            isNeg
                              ? 'bg-red-500/10 border-red-500/20 text-red-300'
                              : isPos
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-xs font-semibold block leading-tight">{driver.title}</strong>
                              <span className="text-[10px] opacity-75 capitalize">{driver.type}</span>
                            </div>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              {driver.detail}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-current/20 flex items-center justify-between text-[10px]">
                            <span className="opacity-75">{driver.stakeholder}</span>
                            {driver.evidenceId && (
                              <button
                                onClick={() => openEvidence(driver.evidenceId)}
                                className="font-mono text-blue-400 hover:text-blue-300 underline"
                              >
                                Evidence &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stakeholder Sentiment Breakdown */}
                {data.stakeholderBreakdown && data.stakeholderBreakdown.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/50">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Individual Stakeholder Voices:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {data.stakeholderBreakdown.map((person, idx) => (
                        <div key={idx} className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-3 space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <strong className="text-zinc-200 block text-xs">{person.name}</strong>
                              <span className="text-[11px] text-zinc-500">{person.role}</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                              {person.sentimentScore}/100
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 italic bg-zinc-900 p-2 rounded border border-zinc-800 leading-relaxed">
                            "{person.keyQuote}"
                          </p>

                          {person.evidenceId && (
                            <div className="text-right">
                              <button
                                onClick={() => openEvidence(person.evidenceId)}
                                className="text-[10px] font-mono text-blue-400 hover:text-blue-300"
                              >
                                View Record &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomerSentimentPage;
