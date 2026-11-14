import React, { useState } from 'react';
import { useEvidence } from '../context/EvidenceContext';
import { CheckCircle2, Circle, Clock, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export function TaskItem({ task, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const { openEvidence } = useEvidence();

  const isCompleted = task.status === 'completed';

  const handleToggle = async (e) => {
    e.stopPropagation();
    const newStatus = isCompleted ? 'pending' : 'completed';
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <div className={`p-4 bg-white rounded-xl border transition ${
      isCompleted ? 'border-slate-200 bg-slate-50/60 opacity-75' : 'border-slate-200 hover:border-slate-300 shadow-sm'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={handleToggle}
            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
            ) : (
              <Circle className="w-4 h-4 hover:stroke-emerald-600" />
            )}
          </button>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                {task.title}
              </span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Acc {task.account_id}
              </span>
              {task.deadline && (
                <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-mono">
                  <Clock className="w-2.5 h-2.5" /> Due: {task.deadline}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {task.description}
            </p>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                {task.reasoning && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700">
                    <strong className="block text-[10px] uppercase font-bold text-slate-900 mb-0.5">
                      Deterministic Prioritization:
                    </strong>
                    {task.reasoning}
                  </div>
                )}
                {task.expected_outcome && (
                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-800">Target Deliverable:</strong> {task.expected_outcome}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <User className="w-3 h-3 text-slate-400" />
            <span className="font-medium text-slate-700">{task.owner || 'Unassigned'}</span>
          </div>

          {task.evidence_id && (
            <button
              onClick={() => openEvidence(task.evidence_id)}
              className="text-[11px] font-mono text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1"
              title="Inspect unedited source evidence"
            >
              <FileText className="w-3 h-3" />
              Source
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
