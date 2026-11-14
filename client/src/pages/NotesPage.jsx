import React, { useState, useEffect } from 'react';
import { useSync } from '../context/SyncContext';
import { FileEdit, Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [account, setAccount] = useState('A');
  const [kind, setKind] = useState('next_step');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { syncStatus, refreshStatus } = useSync();

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAccounts(data);
          if (data.length > 0 && !data.some(a => (a.accountId || a.id) === account)) {
            setAccount(data[0].accountId || data[0].id);
          }
        }
      })
      .catch(console.error);

    const interval = setInterval(fetchNotes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Strategic Note',
          text,
          account,
          kind
        })
      });

      if (res.ok) {
        setTitle('');
        setText('');
        setMessage({
          type: 'success',
          text: 'Note enqueued successfully into the MCP Central Scheduler! It will sync via write_note tool respecting the 65s rate limiter.'
        });
        fetchNotes();
        refreshStatus();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to submit note' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">MCP Write-Back & Note Creator</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Write notes, tasks, risks, and next steps directly back to the live MCP server using <code className="font-mono bg-zinc-800 px-1 py-0.5 rounded text-blue-400">write_note</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <div className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
            <FileEdit className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-zinc-100 text-sm">Create MCP Record</h2>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/10 border border-red-500/20 text-red-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Target Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full border border-zinc-700/60 rounded-lg p-2 bg-zinc-900/60 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
              >
                {accounts.map(acc => {
                  const id = acc.accountId || acc.id;
                  return (
                    <option key={id} value={id}>
                      {acc.name} ({id})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Record Kind</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full border border-zinc-700/60 rounded-lg p-2 bg-zinc-900/60 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
              >
                <option value="next_step">Next Step</option>
                <option value="task">Task</option>
                <option value="risk">Risk</option>
                <option value="note">General Note</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Record Title</label>
              <input
                type="text"
                placeholder="e.g. Schedule Karen Mbeki briefing before Dec 5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-zinc-700/60 rounded-lg p-2 bg-zinc-900/60 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Note Content (Text)</label>
              <textarea
                rows="4"
                placeholder="Enter detailed facts, task instructions, or risk analysis..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                className="w-full border border-zinc-700/60 rounded-lg p-2 bg-zinc-900/60 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs placeholder-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enqueuing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Write to MCP Server</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Notes Feed */}
        <div className="lg:col-span-2 bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
            <h2 className="font-semibold text-zinc-100 text-sm">Archived MCP Notes</h2>
            <span className="text-xs text-zinc-500 font-mono">{notes.length} notes</span>
          </div>

          <div className="space-y-3">
            {loading && notes.length === 0 ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
              </div>
            ) : notes.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No MCP notes synced yet. Use the form to write your first strategic note.
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-3.5 bg-zinc-900/50 rounded-lg border border-zinc-800/60 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                        Acc {note.account_id}
                      </span>
                      <strong className="text-zinc-200 text-xs">{note.title}</strong>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {note.kind}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                      note.synchronization_status === 'synced'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {note.synchronization_status}
                    </span>
                  </div>

                  <p className="text-zinc-400 leading-relaxed bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                    {note.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesPage;
