import React, { useState } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  MessageSquare, 
  Send,
  Building2
} from 'lucide-react';

export function TaskItem({ task, onStatusChange, onEdit, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const { openEvidence } = useEvidence();

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  const isBlocked = task.status === 'blocked';

  const priorityColors = {
    1: 'bg-red-500/10 text-red-400 border-red-500/20',
    2: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    3: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    4: 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
  };

  const statusBadges = {
    pending: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    in_progress: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    blocked: 'bg-red-500/15 text-red-300 border-red-500/30'
  };

  const handleToggleCompleted = (e) => {
    e.stopPropagation();
    const targetStatus = isCompleted ? 'pending' : 'completed';
    if (onStatusChange) onStatusChange(task.id, targetStatus);
  };

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    const targetStatus = e.target.value;
    if (onStatusChange) onStatusChange(task.id, targetStatus);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() })
      });
      if (res.ok) {
        setNewNote('');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to append task note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div className={`rounded-xl border transition-colors shadow-sm overflow-hidden ${
      isCompleted 
        ? 'bg-zinc-900/30 border-zinc-800/40 opacity-75' 
        : 'bg-zinc-800/40 border-zinc-800/60 hover:border-zinc-700/70'
    }`}>
      {/* Primary Row */}
      <div className="p-3.5 flex items-start gap-3">
        {/* Checkbox button */}
        <button
          onClick={handleToggleCompleted}
          className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
          title={isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Circle className="w-4 h-4 text-zinc-600 hover:text-zinc-400" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Badge */}
            <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${priorityColors[task.priority] || priorityColors[3]}`}>
              P{task.priority || 3}
            </span>

            {/* Account pill */}
            {task.account_id && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60">
                <Building2 className="w-2.5 h-2.5 text-zinc-500" />
                {task.account_id}
              </span>
            )}

            {/* Title */}
            <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {task.title}
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {task.description}
          </p>

          {/* Quick Meta Footer */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1 flex-wrap">
            {task.owner && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-zinc-500" />
                <span>{task.owner}</span>
              </span>
            )}

            {task.deadline && (
              <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400/90">
                <Clock className="w-3 h-3 text-amber-400/70" />
                <span>{task.deadline}</span>
              </span>
            )}

            {task.evidence_source_id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEvidence(task.evidence_id || task.evidence_source_id);
                }}
                className="font-mono text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <FileText className="w-3 h-3" />
                <span>{task.evidence_source_id}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Dropdown & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={task.status || 'pending'}
            onChange={handleStatusSelect}
            className={`text-[11px] font-medium font-mono px-2 py-1 rounded-lg border focus:outline-none transition-colors ${
              statusBadges[task.status] || statusBadges.pending
            }`}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded-lg hover:bg-zinc-700/60 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg hover:bg-zinc-700/60 text-zinc-500 hover:text-zinc-300 transition-colors"
            title={expanded ? 'Collapse' : 'Expand Details'}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details & Notes Drawer */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-800/60 space-y-3 bg-zinc-900/40 text-xs">
          {task.reasoning && (
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-300 text-[11px]">
              <strong className="block text-[10px] uppercase font-semibold text-violet-400 mb-0.5">
                Deterministic Basis:
              </strong>
              {task.reasoning}
            </div>
          )}

          {task.expected_outcome && (
            <div className="text-[11px] text-zinc-400">
              <strong className="text-zinc-300">Expected Outcome:</strong> {task.expected_outcome}
            </div>
          )}

          {/* Operational Progress Notes */}
          <div className="space-y-2 pt-1 border-t border-zinc-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                Progress Notes
              </span>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>{showNotes ? 'Hide Notes' : 'Add Progress Note'}</span>
              </button>
            </div>

            {task.task_notes && (
              <pre className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {task.task_notes}
              </pre>
            )}

            {showNotes && (
              <form onSubmit={handleAddNote} className="space-y-2 pt-1">
                <textarea
                  rows="2"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record timestamped execution progress or blocker..."
                  className="w-full p-2 bg-zinc-900 border border-zinc-700/60 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingNote || !newNote.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Append Note</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
