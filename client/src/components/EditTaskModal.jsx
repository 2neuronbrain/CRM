import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, Trash2, AlertCircle, Loader2 } from 'lucide-react';

export function EditTaskModal({ isOpen, task, onClose, onTaskUpdated, onTaskDeleted }) {
  const [formData, setFormData] = useState({
    title: '',
    owner: '',
    priority: 1,
    status: 'pending',
    deadline: '',
    reasoning: '',
    expected_outcome: '',
    task_notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        owner: task.owner || '',
        priority: task.priority || 1,
        status: task.status || 'pending',
        deadline: task.deadline ? String(task.deadline).split('T')[0] : '',
        reasoning: task.reasoning || '',
        expected_outcome: task.expected_outcome || '',
        task_notes: task.task_notes || ''
      });
      setError(null);
    }
  }, [task]);

  if (!isOpen || !task) return null;

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

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          owner: formData.owner.trim(),
          priority: parseInt(formData.priority, 10),
          status: formData.status,
          deadline: formData.deadline.trim() || undefined,
          reasoning: formData.reasoning.trim() || undefined,
          expected_outcome: formData.expected_outcome.trim() || undefined,
          task_notes: formData.task_notes.trim() || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to update task' }));
        throw new Error(errData.error || 'Server error updating task');
      }

      const updated = await res.json();
      if (onTaskUpdated) onTaskUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete task "${task.title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (onTaskDeleted) onTaskDeleted(task.id);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete task');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
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
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Edit Operational Task</h2>
              <p className="text-[11px] text-zinc-500">Task ID: {task.id}</p>
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

          {/* Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium text-[11px]">Execution Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs font-mono"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
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
                <option value="1">P1 - Critical Priority</option>
                <option value="2">P2 - High Priority</option>
                <option value="3">P3 - Standard Priority</option>
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

          {/* Reasoning */}
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium text-[11px]">Strategic Reasoning</label>
            <textarea
              name="reasoning"
              rows="2"
              value={formData.reasoning}
              onChange={handleChange}
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
              className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
            />
          </div>

          {/* Operational Notes */}
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium text-[11px]">Progress & Handover Notes</label>
            <textarea
              name="task_notes"
              rows="3"
              value={formData.task_notes}
              onChange={handleChange}
              placeholder="Record progress updates, blocker resolutions, or customer feedback..."
              className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>

            <div className="flex items-center gap-2">
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;
