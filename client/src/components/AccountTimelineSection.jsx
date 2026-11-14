import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import { 
  Clock, 
  Mail, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Radio, 
  Paperclip, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw
} from 'lucide-react';

export function AccountTimelineSection({ accountId }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const { openEvidence } = useEvidence();

  const fetchTimeline = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId);
    if (channelFilter !== 'all') params.append('channel', channelFilter);
    if (query.trim()) params.append('query', query.trim());

    fetch(`/api/timeline?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTimeline(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load account timeline:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTimeline();
  }, [accountId, channelFilter]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return <Mail className="w-3.5 h-3.5 text-sky-400" />;
      case 'call': return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ticket': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'telemetry': return <Radio className="w-3.5 h-3.5 text-rose-400" />;
      case 'note': return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <section className="bg-slate-900/95 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base font-bold text-white">Customer Interaction Timeline</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological log of emails, call transcripts, support tickets, and telemetry alerts for this account.
          </p>
        </div>

        {/* Channel Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {['all', 'call', 'email', 'ticket', 'telemetry', 'note'].map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition capitalize border ${
                channelFilter === ch
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {ch === 'all' ? 'All' : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline items */}
      {loading ? (
        <div className="py-12 text-center">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading interactions...</p>
        </div>
      ) : timeline.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 italic">
          No interactions logged matching the active filter.
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((item) => {
            const isExp = expanded[item.id];
            return (
              <div 
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(item.channel)}
                    <span className="font-mono font-semibold text-slate-200 text-[11px]">
                      {item.date}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 capitalize">
                      {item.channelLabel || item.channel}
                    </span>
                  </div>

                  {item.evidenceId && (
                    <button
                      onClick={() => openEvidence(item.evidenceId)}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 transition"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{item.sourceId ? item.sourceId.split('/').pop() : 'Evidence'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-white leading-snug">
                  {item.title}
                </h4>

                {item.participants && item.participants.length > 0 && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                    <span className="text-slate-500">Participants:</span>
                    {item.participants.map((p, i) => (
                      <span key={i} className="font-mono bg-slate-900 px-1.5 py-0.2 rounded text-slate-300 border border-slate-800">
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                  {item.summary}
                </p>

                {isExp && item.fullText && (
                  <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {item.fullText}
                  </pre>
                )}

                {item.fullText && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      <span>{isExp ? 'Collapse' : 'Full Content'}</span>
                      {isExp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AccountTimelineSection;
