import React, { useState, useEffect } from 'react';
import TaskItem from '../components/TaskItem';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import AccountSelector from '../components/AccountSelector';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  RefreshCw,
  Loader2
} from 'lucide-react';

export function PriorityTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchTasks();
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => {
    const matchesAccount = accountFilter === 'ALL' || t.account_id === accountFilter;
    const matchesStatus = statusFilter === 'ALL' 
      ? true 
      : statusFilter === 'pending' 
      ? t.status === 'pending' || t.status === 'in_progress' 
      : t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || String(t.priority) === String(priorityFilter);
    return matchesAccount && matchesStatus && matchesPriority;
  });

  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const criticalCount = tasks.filter(t => t.priority === 1 && t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold bg-violet-500/10 px-2 py-0.5 rounded">
              Operational Queue
            </span>
            <span className="text-xs text-zinc-600">•</span>
            <span className="text-xs font-mono text-zinc-400">{tasks.length} Total Moves</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Priority Operational Tasks
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ranked deliverables, customer commitments, and field escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            className="p-2 rounded-lg bg-zinc-800/70 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/70 transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-800/40 border border-zinc-800/60 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Tasks</span>
          <div className="text-lg font-bold text-zinc-100 font-mono">{tasks.length}</div>
        </div>

        <div className="bg-zinc-800/40 border border-zinc-800/60 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">Critical P1</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-lg font-bold text-red-400 font-mono">{criticalCount}</div>
        </div>

        <div className="bg-zinc-800/40 border border-zinc-800/60 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400">In Progress</span>
          <div className="text-lg font-bold text-violet-300 font-mono">{pendingCount}</div>
        </div>

        <div className="bg-zinc-800/40 border border-zinc-800/60 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">{completedCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Elegant Account Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <AccountSelector
            value={accountFilter}
            onChange={setAccountFilter}
            allLabel="All Accounts"
          />
        </div>

        {/* Priority & Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-zinc-700/60 rounded-lg px-2.5 py-1.5 bg-zinc-800/70 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          >
            <option value="ALL">All Priorities</option>
            <option value="1">P1 - Critical Priority</option>
            <option value="2">P2 - High Priority</option>
            <option value="3">P3 - Standard Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-zinc-700/60 rounded-lg px-2.5 py-1.5 bg-zinc-800/70 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Open / In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
            <p className="text-xs text-zinc-500">Loading priority task queue...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center bg-zinc-800/30 rounded-xl border border-zinc-800/60 space-y-2">
            <CheckSquare className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">No tasks match your filter criteria.</p>
            <button
              onClick={() => { setAccountFilter('ALL'); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={(t) => setEditingTask(t)}
              onRefresh={fetchTasks}
            />
          ))
        )}
      </div>

      {/* Global Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={handleTaskCreated}
        defaultAccountId={accountFilter !== 'ALL' ? accountFilter : undefined}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
}

export default PriorityTasksPage;
