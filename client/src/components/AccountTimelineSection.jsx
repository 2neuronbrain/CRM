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
  RefreshCw,
  Loader2
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
      case 'email': return <Mail className="w-3.5 h-3.5 text-violet-400" />;
      case 'call': return <Phone className="w-3.5 h-3.5 text-blue-400" />;
      case 'ticket': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'telemetry': return <Radio className="w-3.5 h-3.5 text-red-400" />;
      case 'note': return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
      case 'contract': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <section className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-xs">
              6
            </div>
            <h2 className="text-sm font-semibold text-zinc-100">Interaction & Communication Timeline</h2>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Chronological audit trail for this account across calls, emails, support tickets, and telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel selector */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="border border-zinc-700/60 rounded-lg px-2.5 py-1 bg-zinc-800/70 text-zinc-200 text-xs focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="ticket">Tickets</option>
            <option value="telemetry">Telemetry</option>
            <option value="note">Notes</option>
          </select>

          <button
            onClick={fetchTimeline}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-12 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-zinc-500">Loading interactions...</p>
        </div>
      ) : timeline.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-xs">
          No interaction records found for this account.
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((item) => {
            const isExp = expanded[item.id];
            return (
              <div 
                key={item.id} 
                className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 space-y-2 hover:border-zinc-700/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/60">
                      {getChannelIcon(item.channel)}
                    </span>
                    <span className="font-mono text-xs font-semibold text-zinc-300">
                      {item.date}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50 capitalize">
                      {item.channel}
                    </span>
                    {item.participants && item.participants.length > 0 && (
                      <span className="text-[11px] text-zinc-500">
                        ({item.participants.join(', ')})
                      </span>
                    )}
                  </div>

                  {item.evidenceId && (
                    <button
                      onClick={() => openEvidence(item.evidenceId)}
                      className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{item.sourceId ? item.sourceId.split('/').pop() : 'Evidence'}</span>
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                    </button>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-zinc-100">
                  {item.title}
                </h4>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.summary}
                </p>

                {isExp && item.fullText && (
                  <div className="pt-2 border-t border-zinc-800/60">
                    <pre className="text-[11px] font-mono text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 whitespace-pre-wrap leading-relaxed">
                      {item.fullText}
                    </pre>
                  </div>
                )}

                {item.fullText && (
                  <div className="pt-1 text-right">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {isExp ? 'Collapse' : 'View Full Content →'}
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
