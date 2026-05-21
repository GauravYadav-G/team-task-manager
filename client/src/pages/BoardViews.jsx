import React, { useState, useEffect } from 'react';
import { Eye, Clock, User, Filter, AlertCircle, HelpCircle } from 'lucide-react';
import api from '../api/axios';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function BoardViews() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [dragOverColumn, setDragOverColumn] = useState(null);

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
      case 'HIGH':
        return { bg: 'bg-red-500/10 text-red-400 border-red-500/20', border: 'border-l-4 border-l-red-500' };
      case 'MEDIUM':
        return { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', border: 'border-l-4 border-l-indigo-500' };
      case 'LOW':
      default:
        return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', border: 'border-l-4 border-l-emerald-500' };
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const projMatch = selectedProjectId === 'ALL' || t.projectId === selectedProjectId;
    const priMatch = selectedPriority === 'ALL' || t.priority === selectedPriority;
    return projMatch && priMatch;
  });

  const getColumnTasks = (status) => filteredTasks.filter(t => t.status === status);

  const getColumnColor = (status) => {
    switch (status) {
      case 'DONE': return 'border-t-green-400';
      case 'IN_PROGRESS': return 'border-t-indigo-400';
      case 'TODO':
      default: return 'border-t-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Assembling unified workspace board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Eye className="text-yellow-400" /> Workspace Board Views
          </h1>
          <p className="text-sm text-gray-400 mt-1">Cross-project Kanban board tracking tasks across all workspaces</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-[#1C1F26] p-2.5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400 px-2">
            <Filter size={12} /> Filter by:
          </div>
          
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-black/40 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs bg-black/40 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
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
              className={`bg-[#1C1F26] p-5 rounded-[2rem] min-h-[500px] border border-white/5 transition-all duration-300 border-t-4 ${getColumnColor(status)} ${
                isOver ? 'bg-black/35 border-yellow-400/25 scale-[1.01]' : ''
              }`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                <span className="text-xs font-black uppercase text-white tracking-widest">{status.replace('_', ' ')}</span>
                <span className="text-[9px] font-black text-gray-400 bg-black/40 border border-white/5 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {colTasks.map(t => {
                  const priConfig = getPriorityConfig(t.priority);
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      className={`group p-4 bg-black/25 hover:bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-grab active:cursor-grabbing ${priConfig.border}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${priConfig.bg}`}>
                          {t.priority}
                        </span>
                        <span className="text-[8px] font-semibold text-gray-500">
                          {t.projectName}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-white group-hover:text-yellow-400 transition-colors leading-snug break-words">
                        {t.title}
                      </h4>
                      {t.description && <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed mt-1">{t.description}</p>}

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-bold">
                          <Clock size={10} />
                          <span>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due Date'}</span>
                        </div>

                        {t.assignedTo ? (
                          <div className="w-6 h-6 rounded-lg bg-indigo-500 text-white font-extrabold flex items-center justify-center text-[8px] uppercase" title={t.assignedTo.name}>
                            {getInitials(t.assignedTo.name)}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-gray-800 text-gray-500 flex items-center justify-center" title="Unassigned">
                            <User size={10} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="py-12 border border-dashed border-gray-800 rounded-2xl text-center text-gray-500 flex flex-col items-center justify-center">
                    <HelpCircle size={20} className="text-gray-600 mb-1.5" />
                    <p className="text-[10px] font-bold">No tasks matching filters</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
