import React, { useState, useEffect } from 'react';
import { Eye, Clock, User, Filter, AlertCircle, HelpCircle } from 'lucide-react';
import api from '../api/axios';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function BoardViews() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [dragOverColumn, setDragOverColumn] = useState(null);
  
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      const projs = projRes.data.projects || [];
      setProjects(projs);

      const allTasksPromises = projs.map(p => api.get(`/projects/${p.id}/tasks`));
      const taskResponses = await Promise.all(allTasksPromises);

      const combinedTasks = [];
      taskResponses.forEach((res, index) => {
        const projectTasks = res.data.tasks || [];
        projectTasks.forEach(t => {
          combinedTasks.push({
            ...t,
            projectName: projs[index].name
          });
        });
      });

      setTasks(combinedTasks);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load board tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCreateOrUpdateTask = async (data, taskId) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;
      await api.put(`/projects/${taskToUpdate.projectId}/tasks/${taskId}`, data);
      toast.success('Task updated successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.status === newStatus) return;

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.put(`/projects/${task.projectId}/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to move task');
      fetchData(); // Revert
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'URGENT':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-700',
          dot: 'bg-rose-500',
          glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.05)]',
          borderClass: 'priority-urgent'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-700',
          dot: 'bg-amber-500',
          glow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.05)]',
          borderClass: 'priority-high'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-700',
          dot: 'bg-blue-500',
          glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.05)]',
          borderClass: 'priority-medium'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700',
          dot: 'bg-emerald-500',
          glow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.05)]',
          borderClass: 'priority-low'
        };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'In Progress';
      case 'DONE': return 'Done';
      case 'TODO':
      default: return 'To Do';
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const projMatch = selectedProjectId === 'ALL' || t.projectId === selectedProjectId;
    const priMatch = selectedPriority === 'ALL' || t.priority === selectedPriority;
    return projMatch && priMatch;
  });

  const getColumnTasks = (status) => filteredTasks.filter(t => t.status === status);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black/10 border-t-accent-secondary" />
        <p className="font-sans text-sm font-medium tracking-wide">Assembling unified workspace board...</p>
      </div>
    );
  }

  const projectOfTask = editingTask ? projects.find(p => p.id === editingTask.projectId) : null;
  const taskMembers = projectOfTask?.members || [];
  const taskUserRole = projectOfTask?.members?.find(m => m.user.id === user?.id)?.role || 'MEMBER';

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <Eye className="text-accent-secondary" /> Workspace Board Views
          </h1>
          <p className="text-sm text-text-secondary mt-1">Cross-project Kanban board tracking tasks across all workspaces</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-bg-surface p-2.5 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-secondary px-2">
            <Filter size={12} /> Filter by:
          </div>
          
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-bg-main border border-black/10 rounded-xl text-text-primary focus-glow cursor-pointer transition-all duration-300"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs bg-bg-main border border-black/10 rounded-xl text-text-primary focus-glow cursor-pointer transition-all duration-300"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {COLUMNS.map((status) => {
          const colTasks = getColumnTasks(status);
          const isOver = dragOverColumn === status;

          return (
            <div
              key={status}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              className={`bg-bg-surface p-5 rounded-[2rem] min-h-[500px] flex flex-col gap-4 border border-black/[0.06] hover:border-accent-primary/25 mac-shadow transition-all duration-300 ${
                isOver ? 'bg-white/60 !border-accent-primary/50 shadow-md shadow-accent-primary/5 scale-[1.01]' : ''
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-secondary ring-4 ring-accent-secondary/15" />
                  <span className="text-xs font-black uppercase text-text-primary tracking-wider">
                    {getStatusLabel(status)}
                  </span>
                </div>
                <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full border border-black/5 bg-bg-main text-accent-secondary">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Items */}
              <div className="flex-1 flex flex-col gap-3.5 max-h-[600px] overflow-y-auto pr-1">
                {colTasks.map(t => {
                  const priConfig = getPriorityConfig(t.priority);
                  const overdue = t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date().setHours(0,0,0,0);
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onClick={() => handleEditTask(t)}
                      className={`group p-4 bg-bg-surface hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] border border-black/5 hover:border-accent-primary/45 transition-all cursor-pointer active:cursor-grabbing mac-shadow rounded-2xl ${priConfig.borderClass} ${priConfig.glow} ${
                        overdue ? 'bg-rose-500/[0.02] border-rose-500/20 hover:border-rose-500/30' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2.5">
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${priConfig.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priConfig.dot}`} />
                          {t.priority}
                        </span>
                        {overdue ? (
                          <span className="flex items-center gap-1 text-[9px] uppercase font-black tracking-wider text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            <AlertCircle size={10} className="stroke-[2.5]" />
                            Overdue
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-text-secondary truncate max-w-[90px]" title={t.projectName}>
                            {t.projectName}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-text-primary group-hover:text-accent-secondary transition-colors leading-snug break-words">
                        {t.title}
                      </h4>
                      {t.description && <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed mt-1.5">{t.description}</p>}

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5">
                        <div className="flex items-center gap-1.5 text-[9px] text-text-secondary font-semibold">
                          <Clock size={10} className={overdue ? 'text-rose-600' : 'text-accent-secondary/70'} />
                          <span className={overdue ? 'text-rose-600 font-black' : ''}>
                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due Date'}
                          </span>
                        </div>

                        {t.assignedTo ? (
                          t.assignedTo.avatar ? (
                            <img
                              src={t.assignedTo.avatar}
                              alt={t.assignedTo.name}
                              className="w-6 h-6 rounded-xl object-cover ring-2 ring-black/5 hover:ring-accent-primary/50 transition-all"
                              title={t.assignedTo.name}
                            />
                          ) : (
                            <div
                              className="w-6 h-6 rounded-xl bg-gradient-to-br from-accent-primary/45 to-accent-primary/10 text-accent-secondary font-black flex items-center justify-center text-[8px] uppercase border border-accent-primary/20 transition-transform group-hover:scale-105 shadow-xs"
                              title={t.assignedTo.name}
                            >
                              {getInitials(t.assignedTo.name)}
                            </div>
                          )
                        ) : (
                          <div className="w-6 h-6 rounded-xl bg-bg-main text-text-secondary flex items-center justify-center border border-black/5 hover:text-text-primary transition-colors" title="Unassigned">
                            <User size={10} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-2xl py-14 px-4 text-center">
                    <HelpCircle size={22} className="text-text-secondary/40 mb-2" />
                    <p className="text-[10px] font-bold text-text-secondary">No tasks matching filters</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        task={editingTask}
        members={taskMembers}
        userRole={taskUserRole}
      />
    </div>
  );
}
