import React, { useState, useEffect } from 'react';
import { useSync } from '../context/SyncContext';
import { FileEdit, Send, Clock, CheckCircle2, AlertTriangle, Layers, ShieldCheck } from 'lucide-react';

export function NotesPage() {
  const [notes, setNotes] = useState([]);
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MCP Write-Back & Note Creator</h1>
        <p className="text-xs text-slate-500 mt-1">
          Write notes, tasks, risks, and next steps directly back to the live MCP server using <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">write_note</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileEdit className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">Create MCP Record</h2>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="A">Account A (Eastern Counties Police Alliance)</option>
                <option value="B">Account B (Aldermoor Industrial Group)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Record Kind</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="next_step">Next Step</option>
                <option value="task">Task</option>
                <option value="risk">Risk</option>
                <option value="note">General Note</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Record Title</label>
              <input
                type="text"
                placeholder="e.g. Schedule Karen Mbeki briefing before Dec 5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Note Content (Text)</label>
              <textarea
                rows="4"
                placeholder="Enter detailed facts, task instructions, or risk analysis..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Enqueuing...' : 'Queue to MCP'}</span>
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <strong className="text-slate-800 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Central Scheduler Cooldown
            </strong>
            <p className="leading-relaxed">
              Writes are treated with highest priority (priority 2), scheduled through the centralized rate limiter, and marked 'synced' once confirmed by MCP.
            </p>
          </div>
        </div>

        {/* Existing Notes List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base">Write-Back Audit Log</h2>
            <span className="text-xs text-slate-500">{notes.length} total entries</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Loading notes...
              </div>
            ) : notes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No notes created yet. Use the form to write your first record back to the MCP.
              </div>
            ) : (
              notes.map((note) => {
                const isSynced = note.synchronization_status === 'synced';
                const isFailed = note.synchronization_status === 'failed';
                return (
                  <div
                    key={note.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                          Account {note.account_id || 'Global'}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm">{note.title}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] uppercase font-mono">
                          {note.kind}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isSynced ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        isFailed ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      }`}>
                        {isSynced ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {note.synchronization_status}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed text-xs">
                      {note.text}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Created: {new Date(note.created_at).toLocaleString()}</span>
                      {note.external_id && (
                        <span className="font-mono">MCP ID: {note.external_id}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesPage;
