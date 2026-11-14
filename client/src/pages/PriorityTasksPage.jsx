import React, { useState, useEffect } from 'react';
import TaskItem from '../components/TaskItem';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { 
  CheckSquare, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Plus, 
  RefreshCw,
  Building2
} from 'lucide-react';

export function PriorityTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [accounts, setAccounts] = useState([]);
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

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchTasks();
    fetchAccounts();
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

  const handleTaskCreated = (newTask) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Action Execution Engine
            </span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">{tasks.length} Total Moves</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Priority Operational Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, configure, and note critical operational commitments and customer escalations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTasks}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-sm transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Tasks</span>
          <div className="text-xl font-bold text-white font-mono">{tasks.length}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">Critical P1</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">{criticalCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">In Progress / Pending</span>
          <div className="text-xl font-bold text-indigo-300 font-mono">{pendingCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{completedCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Account Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-[11px] font-medium">Account:</span>
          <button
            onClick={() => setAccountFilter('ALL')}
            className={`px-2.5 py-1 rounded-md transition text-xs font-medium border ${
              accountFilter === 'ALL'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Accounts
          </button>
          {accounts.map((acc) => {
            const accId = acc.accountId || acc.id;
            return (
              <button
                key={accId}
                onClick={() => setAccountFilter(accId)}
                className={`px-2.5 py-1 rounded-md transition text-xs font-medium border ${
                  accountFilter === accId
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {acc.name.split(' ')[0]} ({accId})
              </button>
            );
          })}
        </div>

        {/* Priority & Status Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono"
            >
              <option value="ALL">All Priorities</option>
              <option value="1">P1 - Critical</option>
              <option value="2">P2 - High</option>
              <option value="3">P3 - Medium</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs capitalize"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending & Active</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading priority task roster...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Matching Tasks</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All filtered operational moves have been completed or match no active records.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded-md transition"
          >
            Create Operational Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={(t) => setEditingTask(t)}
              onRefresh={fetchTasks}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={handleTaskCreated}
        initialAccountId={accountFilter !== 'ALL' ? accountFilter : undefined}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
}

export default PriorityTasksPage;
