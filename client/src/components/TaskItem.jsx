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
  AlertCircle,
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
    1: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    2: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    3: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    4: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const statusBadges = {
    pending: 'bg-slate-800 text-slate-300 border-slate-700',
    in_progress: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    blocked: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
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
        body: JSON.stringify({ note: newNote.trim(), author: 'Operations Lead' })
      });
      if (res.ok) {
        setNewNote('');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const notesList = task.task_notes ? task.task_notes.split('\n').filter(Boolean) : [];

  return (
    <div className={`p-4 bg-slate-900/90 rounded-xl border transition shadow-sm ${
      isCompleted 
        ? 'border-slate-800/80 bg-slate-900/40 opacity-75' 
        : 'border-slate-800 hover:border-slate-700/80'
    }`}>
      <div className="flex items-start justify-between gap-3">
        {/* Toggle checkbox & Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggleCompleted}
            className="mt-1 text-slate-500 hover:text-emerald-400 transition shrink-0"
            title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
            ) : (
              <Circle className="w-4 h-4 hover:stroke-emerald-400" />
            )}
          </button>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                {task.title}
              </span>

              {/* Priority Badge */}
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${priorityColors[task.priority] || priorityColors[2]}`}>
                P{task.priority || 2}
              </span>

              {/* Account badge */}
              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <Building2 className="w-2.5 h-2.5 text-slate-400" />
                {task.account_name || `Acc ${task.account_id}`}
              </span>

              {/* Deadline */}
              {task.deadline && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.2 rounded font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  Due: {String(task.deadline).split('T')[0]}
                </span>
              )}

              {/* Status Selector */}
              <select
                value={task.status || 'pending'}
                onChange={handleStatusSelect}
                className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer capitalize ${statusBadges[task.status] || statusBadges.pending}`}
              >
                <option value="pending" className="bg-slate-900 text-slate-300">Pending</option>
                <option value="in_progress" className="bg-slate-900 text-indigo-300">In Progress</option>
                <option value="completed" className="bg-slate-900 text-emerald-300">Completed</option>
                <option value="blocked" className="bg-slate-900 text-rose-300">Blocked</option>
              </select>
            </div>

            {task.description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Expanded Reasoning & Outcome */}
            {expanded && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                {task.reasoning && (
                  <div className="p-2.5 bg-slate-950/60 rounded-lg text-slate-300 border border-slate-800/60">
                    <strong className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">
                      Deterministic Prioritization:
                    </strong>
                    {task.reasoning}
                  </div>
                )}
                {task.expected_outcome && (
                  <p className="text-[11px] text-slate-400">
                    <strong className="text-slate-200">Expected Deliverable:</strong> {task.expected_outcome}
                  </p>
                )}
              </div>
            )}

            {/* Task Progress Notes Log */}
            {showNotes && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Progress Notes & Audit Log ({notesList.length})
                  </span>
                </div>

                {notesList.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-300 pr-1">
                    {notesList.map((n, i) => (
                      <div key={i} className="p-1.5 rounded bg-slate-900 border border-slate-800/80 text-slate-300">
                        {n}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No notes logged yet.</p>
                )}

                {/* Inline Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log a progress note or update..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingNote || !newNote.trim()}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Send className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
            <User className="w-3 h-3 text-slate-500" />
            <span className="font-medium text-slate-300">{task.owner || 'Unassigned'}</span>
          </div>

          {/* Notes Toggle Button */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-1.5 rounded text-xs flex items-center gap-1 border transition ${
              notesList.length > 0
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
                : 'text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="View & Add Task Notes"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">{notesList.length}</span>
          </button>

          {/* Edit Task Modal Trigger */}
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
              title="Edit Task Configuration"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Clickable Evidence Link */}
          {task.evidence_id && (
            <button
              onClick={() => openEvidence(task.evidence_id)}
              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1 transition"
              title="Inspect unedited source evidence"
            >
              <FileText className="w-3 h-3" />
              Source
            </button>
          )}

          {/* Expand Details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
