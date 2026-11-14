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
  Search, 
  Filter, 
  Building2, 
  User, 
  Paperclip, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Plus
} from 'lucide-react';

export function InteractionTimelinePage({ initialAccountId = null, onOpenCreateTask }) {
  const [timeline, setTimeline] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(initialAccountId || 'all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const { openEvidence } = useEvidence();

  const fetchTimeline = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedAccount && selectedAccount !== 'all') params.append('accountId', selectedAccount);
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
    fetch('/api/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAccounts(data);
      })
      .catch(() => {});
  }, []);

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
      case 'email':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'call':
        return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'ticket':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'telemetry':
        return <Radio className="w-4 h-4 text-rose-400" />;
      case 'note':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'contract':
        return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'email':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
      case 'call':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'ticket':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'telemetry':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'note':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'contract':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSentimentDot = (sentiment) => {
    switch (sentiment) {
      case 'critical':
        return <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Critical Attention Required" />;
      case 'negative':
        return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="At-Risk Sentiment" />;
      case 'positive':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Positive Stance" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" title="Neutral" />;
    }
  };

  // Channel summary counts
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Live Customer Intelligence
            </span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">{timeline.length} Records Indexed</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Customer Interaction Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological audit trail of verified calls, emails, support tickets, telemetry signals, and notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTimeline}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
            title="Refresh Timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {onOpenCreateTask && (
            <button
              onClick={onOpenCreateTask}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Account Filter */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Filter by Account</label>
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="all">All Accounts ({accounts.length})</option>
                {accounts.map((acc) => (
                  <option key={acc.accountId || acc.id} value={acc.accountId || acc.id}>
                    {acc.name} ({acc.accountId || acc.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Query */}
          <div className="sm:col-span-8">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Search Keywords or People</label>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Rhys Calder, stadium, battery, FB-11206, Dec 5..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-md text-xs font-medium border border-slate-700 transition"
              >
                Filter
              </button>
            </form>
          </div>
        </div>

        {/* Channel Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80">
          {[
            { id: 'all', label: 'All Channels', count: channelCounts.all },
            { id: 'call', label: 'Call Notes', icon: Phone, count: channelCounts.call },
            { id: 'email', label: 'Emails', icon: Mail, count: channelCounts.email },
            { id: 'ticket', label: 'Support Tickets', icon: AlertTriangle, count: channelCounts.ticket },
            { id: 'telemetry', label: 'Telemetry Signals', icon: Radio, count: channelCounts.telemetry },
            { id: 'note', label: 'Notes', icon: FileText, count: channelCounts.note }
          ].map((ch) => {
            const Icon = ch.icon;
            const isSelected = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-semibold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{ch.label}</span>
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                  isSelected ? 'bg-emerald-500/25 text-emerald-200' : 'bg-slate-800 text-slate-400'
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
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading customer interaction history...</p>
        </div>
      ) : timeline.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Interactions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your filters or search query to see communications and telemetry events.
          </p>
          <button
            onClick={() => { setSelectedAccount('all'); setSelectedChannel('all'); setSearchQuery(''); }}
            className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-700 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {timeline.map((item) => {
            const isExpanded = expandedItems[item.id];
            return (
              <div key={item.id} className="relative group">
                {/* Node icon marker */}
                <div className="absolute -left-6 sm:-left-8 top-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md z-10 group-hover:scale-110 transition-transform">
                  {getChannelIcon(item.channel)}
                </div>

                {/* Card Container */}
                <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition shadow-sm space-y-3">
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Sentiment Indicator */}
                      {getSentimentDot(item.sentiment)}

                      {/* Date */}
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {item.date}
                      </span>

                      {/* Channel Badge */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${getChannelBadge(item.channel)}`}>
                        {item.channelLabel || item.channel}
                      </span>

                      {/* Account Badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        <Building2 className="w-2.5 h-2.5 text-slate-500" />
                        {item.accountName || `Account ${item.accountId}`}
                      </span>

                      {/* Status */}
                      {item.status && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 capitalize">
                          {item.status}
                        </span>
                      )}
                    </div>

                    {/* Clickable Reference to Evidence/Attachment */}
                    {item.evidenceId && (
                      <button
                        onClick={() => openEvidence(item.evidenceId)}
                        className="text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1.5 transition active:scale-95"
                        title="Open unedited original evidence attachment"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Source: {item.sourceId ? item.sourceId.split('/').pop() : 'Evidence'}</span>
                        <ExternalLink className="w-3 h-3 text-emerald-500" />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-white leading-snug">
                    {item.title}
                  </h3>

                  {/* Participants Chips */}
                  {item.participants && item.participants.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
                      <User className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-slate-500">Participants:</span>
                      {item.participants.map((p, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Excerpt / Summary */}
                  <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    {item.summary}
                  </div>

                  {/* Expandable Full Text */}
                  {isExpanded && item.fullText && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Complete Unedited Transcript / Content
                      </div>
                      <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                        {item.fullText}
                      </pre>
                    </div>
                  )}

                  {/* Bottom Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags && item.tags.map((tag, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.fullText && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
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
