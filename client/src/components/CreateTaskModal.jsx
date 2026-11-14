import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export function CreateTaskModal({ isOpen, onClose, onTaskCreated, initialAccountId }) {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    account_id: initialAccountId || 'A',
    owner: 'Customer Success Lead',
    priority: 1,
    deadline: '',
    action_type: 'escalation',
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
            if (!initialAccountId && data.length > 0) {
              setFormData((prev) => ({ ...prev, account_id: data[0].accountId || data[0].id }));
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, initialAccountId]);

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
          ...formData,
          priority: parseInt(formData.priority, 10)
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create task' }));
        throw new Error(err.error || 'Server error creating task');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Create Operational Task</h2>
              <p className="text-xs text-slate-400">Configure actionable priorities and team commitments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Task Action / Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Schedule emergency training slot before Dec 5 event"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Account *</label>
              <select
                name="account_id"
                value={formData.account_id}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                {accounts.map((acc) => (
                  <option key={acc.accountId || acc.id} value={acc.accountId || acc.id}>
                    {acc.name} ({acc.accountId || acc.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Assignee / Owner</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                placeholder="e.g. Sam / Field Ops Lead"
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Priority Urgency</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
              >
                <option value="1">P1 - Critical / Urgent</option>
                <option value="2">P2 - High Priority</option>
                <option value="3">P3 - Medium</option>
                <option value="4">P4 - Low / Backlog</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Action Category</label>
              <select
                name="action_type"
                value={formData.action_type}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="escalation">Escalation & Risk</option>
                <option value="meeting">Executive Meeting</option>
                <option value="field_ops">Field Engineering</option>
                <option value="contract">Commercial Renewal</option>
                <option value="review">Audit & Review</option>
                <option value="general">Operational</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Strategic Reasoning & Trigger</label>
            <textarea
              name="reasoning"
              rows="2"
              value={formData.reasoning}
              onChange={handleChange}
              placeholder="Why this action is critical now (e.g. ticket FB-11206 unanswered, high-visibility event)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Expected Outcome</label>
            <input
              type="text"
              name="expected_outcome"
              value={formData.expected_outcome}
              onChange={handleChange}
              placeholder="e.g. Written confirmation provided, pilot schedule approved"
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Initial Progress Note</label>
            <textarea
              name="task_notes"
              rows="2"
              value={formData.task_notes}
              onChange={handleChange}
              placeholder="Record initial status or immediate context..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-md shadow-md transition flex items-center gap-2"
            >
              {loading ? (
                <span>Creating Task...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Task</span>
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
