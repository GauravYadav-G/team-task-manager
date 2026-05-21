import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import MemberList from '../components/MemberList';
import { getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Trash2, 
  HelpCircle,
  Search,
  Filter,
  SlidersHorizontal,
  X
} from 'lucide-react';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Search and local filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const userRole = project?.members?.find(
    (m) => m.user.id === user?.id
  )?.role;
  const isAdmin = userRole === 'ADMIN';

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch (err) {
      toast.error('Project not found');
      navigate('/projects');
    }
  }, [id, navigate]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}/tasks`);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [id]);

  useEffect(() => {
    Promise.all([fetchProject(), fetchTasks()]).finally(() =>
      setLoading(false)
    );
  }, [fetchProject, fetchTasks]);

  const handleCreateOrUpdateTask = async (data, taskId) => {
    try {
      if (taskId) {
        await api.put(`/projects/${id}/tasks/${taskId}`, data);
        toast.success('Task updated successfully');
      } else {
        await api.post(`/projects/${id}/tasks`, data);
        toast.success('Task created successfully');
      }
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find((t) => t.id === taskId);

    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task moved to ${getStatusLabel(newStatus)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task status');
      fetchTasks(); // Revert
    }
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  // Filter tasks based on query/filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
      const matchesAssignee = assigneeFilter ? task.assignedToId === assigneeFilter : true;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  const getColumnTasks = (status) =>
    filteredTasks.filter((t) => t.status === status);

  const getColumnStyles = (status) => {
    switch (status) {
      case 'DONE':
        return {
          border: 'border-t-[3px] border-t-emerald-500',
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
          glow: 'shadow-emerald-950/5',
          headerBg: 'bg-emerald-500/10 text-emerald-700'
        };
      case 'IN_PROGRESS':
        return {
          border: 'border-t-[3px] border-t-blue-500',
          dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]',
          glow: 'shadow-blue-950/5',
          headerBg: 'bg-blue-500/10 text-blue-700'
        };
      case 'TODO':
      default:
        return {
          border: 'border-t-[3px] border-t-accent-primary',
          dot: 'bg-accent-primary shadow-[0_0_8px_rgba(230,195,92,0.3)]',
          glow: 'shadow-accent-primary/5',
          headerBg: 'bg-accent-primary/10 text-accent-secondary'
        };
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('');
    setAssigneeFilter('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black/10 border-t-accent-primary" />
        <p className="font-sans text-sm font-medium tracking-wide">Compiling Board...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Back button and page header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors duration-200 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </button>
          
          <h1 className="text-4xl font-black tracking-tight text-text-primary">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-text-secondary font-bold mt-1.5 max-w-2xl">{project.description}</p>
          )}
        </div>

        {/* Board actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMembers(!showMembers)}
            id="btn-toggle-members"
            className={`py-2.5 px-4.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all duration-200 ${
              showMembers 
                ? 'bg-accent-secondary border-accent-secondary text-white shadow-md' 
                : 'bg-bg-surface border-black/5 text-text-secondary hover:bg-black/5 hover:text-text-primary'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team ({project.members?.length || 0})</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                id="btn-create-task"
                className="bg-accent-secondary hover:opacity-90 text-white py-2.5 px-5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-200 shadow-sm border border-transparent"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                id="btn-delete-project"
                title="Delete Project"
                className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 border border-rose-500/10 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Premium Filter Toolbar */}
      <div className="bg-bg-surface border border-black/5 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-1 gap-3 items-center">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-main border border-black/5 focus:border-accent-primary rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary placeholder-text-secondary focus:outline-none transition-all"
              placeholder="Search tasks..."
            />
          </div>

          {/* Priority filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-auto bg-bg-main border border-black/5 rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer appearance-none pr-8"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary pointer-events-none" />
          </div>

          {/* Assignee filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full sm:w-auto bg-bg-main border border-black/5 rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer appearance-none pr-8"
            >
              <option value="">All Assignees</option>
              {project.members?.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary pointer-events-none" />
          </div>

          {/* Clear Filters button */}
          {(searchQuery || priorityFilter || assigneeFilter) && (
            <button
              onClick={clearFilters}
              className="text-[10px] uppercase font-black tracking-wider text-accent-secondary hover:bg-black/5 flex items-center gap-1 bg-bg-main py-1 px-3.5 rounded-lg border border-black/5 transition-colors shrink-0"
            >
              <X size={10} />
              <span>Clear</span>
            </button>
          )}
        </div>
        
        <div className="text-[11px] text-text-secondary font-bold self-end md:self-auto uppercase tracking-wider shrink-0">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Main Board columns + Members slider */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* Kanban Board Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {COLUMNS.map((status) => {
            const styles = getColumnStyles(status);
            const isOver = dragOverColumn === status;
            
            return (
              <div
                key={status}
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                className={`bg-bg-surface p-6 rounded-[2rem] min-h-[550px] flex flex-col gap-4 border border-black/5 transition-all duration-300 ${
                  styles.border
                } ${
                  isOver ? 'bg-bg-main border-accent-primary/20 scale-[1.01]' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-black/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                    <span className="font-black text-xs text-text-primary tracking-wider uppercase">
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full border border-black/5 ${styles.headerBg}`}>
                    {getColumnTasks(status).length}
                  </span>
                </div>

                {/* Column Body Tasks */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-1">
                  {getColumnTasks(status).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      userRole={userRole}
                    />
                  ))}

                  {getColumnTasks(status).length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-2xl py-14 px-4 text-center">
                      <HelpCircle className="w-6 h-6 text-text-secondary mb-2" />
                      <p className="text-xs text-text-secondary font-bold">No matching tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Members panel section */}
        {showMembers && (
          <div className="shrink-0 w-full lg:w-fit animate-fadeIn">
            <MemberList
              projectId={id}
              members={project.members}
              onMembersChange={fetchProject}
              isAdmin={isAdmin}
              currentUserId={user?.id}
            />
          </div>
        )}

      </div>

      {/* Task Creation & Edit properties modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        task={editingTask}
        members={project.members}
        userRole={userRole}
      />

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div 
          onClick={() => setShowDeleteConfirm(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-surface border border-black/5 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 text-text-primary animate-slideUp"
          >
            <div className="border-b border-black/5 pb-3">
              <h2 className="font-black text-base text-text-primary">Delete Project Workflow</h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-bold">
              Are you sure you want to delete <strong className="text-text-primary font-extrabold">{project.name}</strong>?
              This action is permanent and removes all associated task lists.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 mt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-transparent border border-black/5 hover:bg-black/5 text-text-secondary py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                id="btn-confirm-delete"
                className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-md"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
