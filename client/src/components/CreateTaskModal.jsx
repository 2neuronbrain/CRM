import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, AlertCircle, Loader2 } from 'lucide-react';

export function CreateTaskModal({ isOpen, onClose, onTaskCreated, defaultAccountId }) {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    account_id: defaultAccountId || 'A',
    owner: 'Customer Success Lead',
    priority: 1,
    deadline: '',
    action_type: 'operational',
    reasoning: '',
    expected_outcome: '',
    task_notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/accounts')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAccounts(data);
            if (!defaultAccountId && data.length > 0) {
              setFormData((prev) => ({ ...prev, account_id: data[0].accountId || data[0].id }));
            } else if (defaultAccountId) {
              setFormData((prev) => ({ ...prev, account_id: defaultAccountId }));
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, defaultAccountId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!formData.account_id) {
      setError('Please select an account.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          account_id: formData.account_id,
          owner: formData.owner.trim(),
          priority: parseInt(formData.priority, 10),
          deadline: formData.deadline.trim() || undefined,
          action_type: formData.action_type,
          reasoning: formData.reasoning.trim() || undefined,
          expected_outcome: formData.expected_outcome.trim() || undefined,
          task_notes: formData.task_notes.trim() || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to create task' }));
        throw new Error(errData.error || 'Server error creating task');
      }

      const created = await res.json();
      if (onTaskCreated) onTaskCreated(created);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Create Priority Task</h2>
              <p className="text-[11px] text-zinc-500">Configure actionable deliverable with assigned owner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium text-[11px]">Associated Account *</label>
              <select
                name="account_id"
                value={formData.account_id}
                onChange={handleChange}
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
              >
                {accounts.map((acc) => (
                  <option key={acc.accountId || acc.id} value={acc.accountId || acc.id}>
                    {acc.name} ({acc.accountId || acc.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium text-[11px]">Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs font-mono"
              >
                <option value="1">P1 - Critical (Immediate / Escalation)</option>
                <option value="2">P2 - High (Pre-Event Milestone)</option>
                <option value="3">P3 - Standard (Operational Cadence)</option>
              </select>
            </div>
          </div>

          {/* Task Title */}
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium text-[11px]">Task Deliverable Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Deliver written confirmation of training dates to Insp. Mbeki"
              required
              className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
            />
          </div>

          {/* Owner & Deadline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium text-[11px]">Assigned Owner</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                placeholder="e.g. Account Director, CS Lead"
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium text-[11px]">Deadline Date</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs font-mono"
              />
            </div>
          </div>

          {/* Reasoning / Strategic Context */}
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium text-[11px]">Strategic Reasoning (Deterministic Ranking Basis)</label>
            <textarea
              name="reasoning"
              rows="2"
              value={formData.reasoning}
              onChange={handleChange}
              placeholder="Why this move takes priority over other deliverables..."
              className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
            />
          </div>

          {/* Expected Outcome */}
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium text-[11px]">Target Expected Outcome</label>
            <input
              type="text"
              name="expected_outcome"
              value={formData.expected_outcome}
              onChange={handleChange}
              placeholder="e.g. Customer confirms operational readiness before Dec 5 public event"
              className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
            />
          </div>

          {/* Initial Task Notes */}
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium text-[11px]">Initial Progress Note</label>
            <textarea
              name="task_notes"
              rows="2"
              value={formData.task_notes}
              onChange={handleChange}
              placeholder="Log any execution details, blockers, or reference ticket IDs..."
              className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Configuring Task...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Configure Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
