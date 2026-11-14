import React, { useState, useEffect } from 'react';
import TaskItem from '../components/TaskItem';
import { CheckSquare, Filter, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export function PriorityTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update task:', err);
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesAccount = accountFilter === 'ALL' || t.account_id === accountFilter;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'pending' ? t.status !== 'completed' : t.status === 'completed');
    return matchesAccount && matchesStatus;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Priority Operational Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked account moves calculated from deal significance, deadline urgency, and operational impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
            <span className="font-semibold text-slate-900">{pendingCount}</span>
            <span className="text-slate-500">Open Tasks</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-xs flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{completedCount}</span>
            <span>Done</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] font-medium">Account:</span>
          {['ALL', 'A', 'B'].map((acc) => (
            <button
              key={acc}
              onClick={() => setAccountFilter(acc)}
              className={`px-2.5 py-1 rounded-md transition text-xs font-medium ${
                accountFilter === acc
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {acc === 'ALL' ? 'All Accounts' : acc === 'A' ? 'Eastern Counties (A)' : 'Aldermoor (B)'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] font-medium">Status:</span>
          {['ALL', 'pending', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md transition text-xs font-medium capitalize ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'pending' ? 'Pending' : st === 'completed' ? 'Completed' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading priority tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No tasks match the selected filters.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default PriorityTasksPage;
