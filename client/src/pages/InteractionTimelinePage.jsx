import React, { useState, useEffect } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import AccountSelector from '../components/AccountSelector';
import { 
  Clock, 
  Mail, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Radio, 
  Search, 
  Building2, 
  User, 
  Paperclip, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Plus,
  Loader2
} from 'lucide-react';

export function InteractionTimelinePage({ initialAccountId = null, onOpenCreateTask }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(initialAccountId || 'ALL');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const { openEvidence } = useEvidence();

  const fetchTimeline = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedAccount && selectedAccount !== 'ALL') params.append('accountId', selectedAccount);
    if (selectedChannel && selectedChannel !== 'all') params.append('channel', selectedChannel);
    if (searchQuery.trim()) params.append('query', searchQuery.trim());

    fetch(`/api/timeline?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTimeline(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load timeline:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTimeline();
  }, [selectedAccount, selectedChannel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTimeline();
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-blue-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-violet-400" />;
      case 'ticket':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'telemetry':
        return <Radio className="w-3.5 h-3.5 text-red-400" />;
      case 'note':
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
      case 'contract':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'call':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'email':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'ticket':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'telemetry':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'note':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700/60';
      case 'contract':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700/60';
    }
  };

  const getSentimentDot = (sentiment) => {
    switch (sentiment) {
      case 'critical':
        return <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" title="Critical Attention Required" />;
      case 'negative':
        return <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="At-Risk Sentiment" />;
      case 'positive':
        return <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Positive Stance" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" title="Neutral" />;
    }
  };

  const channelCounts = {
    all: timeline.length,
    call: timeline.filter((t) => t.channel === 'call').length,
    email: timeline.filter((t) => t.channel === 'email').length,
    ticket: timeline.filter((t) => t.channel === 'ticket').length,
    telemetry: timeline.filter((t) => t.channel === 'telemetry').length,
    note: timeline.filter((t) => t.channel === 'note').length
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded">
              Interaction Stream
            </span>
            <span className="text-xs text-zinc-600">•</span>
            <span className="text-xs font-mono text-zinc-400">{timeline.length} Records Indexed</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Customer Interaction Timeline
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit trail of verified calls, emails, support tickets, telemetry signals, and notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTimeline}
            className="px-3 py-1.5 bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-medium border border-zinc-700/60 transition-colors flex items-center gap-1.5"
            title="Refresh Timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {onOpenCreateTask && (
            <button
              onClick={onOpenCreateTask}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-800/40 border border-zinc-800/60 p-4 rounded-xl space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Account Filter */}
          <div className="sm:col-span-4">
            <AccountSelector
              value={selectedAccount}
              onChange={setSelectedAccount}
              allLabel="All Accounts"
              className="w-full"
            />
          </div>

          {/* Search Query */}
          <div className="sm:col-span-8">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords, stakeholders, tickets (e.g. FB-11206)..."
                  className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-lg pl-9 pr-3 py-1.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700/60 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Channel Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-800/50 scrollbar-none">
          {[
            { id: 'all', label: 'All Channels', count: channelCounts.all },
            { id: 'call', label: 'Call Notes', icon: Phone, count: channelCounts.call },
            { id: 'email', label: 'Emails', icon: Mail, count: channelCounts.email },
            { id: 'ticket', label: 'Support Tickets', icon: AlertTriangle, count: channelCounts.ticket },
            { id: 'telemetry', label: 'Telemetry', icon: Radio, count: channelCounts.telemetry },
            { id: 'note', label: 'Notes', icon: FileText, count: channelCounts.note }
          ].map((ch) => {
            const Icon = ch.icon;
            const isSelected = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${
                  isSelected
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold'
                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/70 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                <span>{ch.label}</span>
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                  isSelected ? 'bg-blue-500/25 text-blue-300' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {ch.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-zinc-500">Loading customer interaction history...</p>
        </div>
      ) : timeline.length === 0 ? (
        <div className="p-12 text-center bg-zinc-800/30 border border-zinc-800/60 rounded-xl space-y-2">
          <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No Interactions Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try resetting your filters or search query to see communications and telemetry events.
          </p>
          <button
            onClick={() => { setSelectedAccount('ALL'); setSelectedChannel('all'); setSearchQuery(''); }}
            className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg border border-zinc-700/60 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-5 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
          {timeline.map((item) => {
            const isExpanded = expandedItems[item.id];
            return (
              <div key={item.id} className="relative group">
                {/* Node icon marker */}
                <div className="absolute -left-6 sm:-left-8 top-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-md z-10 group-hover:scale-105 transition-transform">
                  {getChannelIcon(item.channel)}
                </div>

                {/* Card Container */}
                <div className="bg-zinc-800/40 border border-zinc-800/60 rounded-xl p-4 sm:p-5 hover:border-zinc-700/80 transition-colors shadow-sm space-y-3">
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSentimentDot(item.sentiment)}

                      <span className="font-mono text-xs font-semibold text-zinc-300">
                        {item.date}
                      </span>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${getChannelBadge(item.channel)}`}>
                        {item.channelLabel || item.channel}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                        <Building2 className="w-2.5 h-2.5 text-zinc-500" />
                        {item.accountName || `Account ${item.accountId}`}
                      </span>

                      {item.status && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                          {item.status}
                        </span>
                      )}
                    </div>

                    {item.evidenceId && (
                      <button
                        onClick={() => openEvidence(item.evidenceId)}
                        className="text-xs font-mono text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20 flex items-center gap-1.5 transition-colors"
                        title="Open unedited original evidence attachment"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Source: {item.sourceId ? item.sourceId.split('/').pop() : 'Evidence'}</span>
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
                    {item.title}
                  </h3>

                  {item.participants && item.participants.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-400">
                      <User className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="text-zinc-500">Participants:</span>
                      {item.participants.map((p, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/60">
                    {item.summary}
                  </div>

                  {isExpanded && item.fullText && (
                    <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                        Complete Unedited Transcript / Content
                      </div>
                      <pre className="text-[11px] font-mono text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-zinc-800 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                        {item.fullText}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags && item.tags.map((tag, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.fullText && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? 'Collapse' : 'View Full Content'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InteractionTimelinePage;
