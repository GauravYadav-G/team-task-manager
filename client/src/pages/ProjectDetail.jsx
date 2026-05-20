import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import MemberList from '../components/MemberList';
import { getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Plus, Trash2, HelpCircle } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-pink-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Compiling Board...</p>
      </div>
    );
  }

  if (!project) return null;

  const getColumnTasks = (status) =>
    tasks.filter((t) => t.status === status);

  // Column style helpers mapping to status accents
  const getColumnStyles = (status) => {
    switch (status) {
      case 'DONE':
        return {
          border: 'border-t-4 border-t-green-600',
          dot: 'bg-green-600',
          glow: 'shadow-green-500/5'
        };
      case 'IN_PROGRESS':
        return {
          border: 'border-t-4 border-t-indigo-500',
          dot: 'bg-indigo-500',
          glow: 'shadow-indigo-500/5'
        };
      case 'TODO':
      default:
        return {
          border: 'border-t-4 border-t-gray-500',
          dot: 'bg-gray-500',
          glow: 'shadow-gray-500/5'
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Back button and page header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-white transition-colors duration-200 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </button>
          
          <h1 className="text-3xl font-black tracking-tight text-white">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-gray-400 font-bold mt-1.5 max-w-2xl">{project.description}</p>
          )}
        </div>

        {/* Board actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMembers(!showMembers)}
            id="btn-toggle-members"
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all duration-200 ${
              showMembers 
                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-[#1F2937] border-white/5 text-gray-300 hover:border-white/10 hover:text-white'
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
                className="bg-[#FDFBF7] hover:bg-[#eae6db] text-[#111827] py-2.5 px-4.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-200 shadow-md shadow-white/5"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                id="btn-delete-project"
                title="Delete Project"
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/10 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
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
                className={`bg-[#1F2937] p-5 rounded-3xl min-h-[550px] flex flex-col gap-4 border border-white/5 transition-all duration-300 ${
                  styles.border
                } ${
                  isOver ? 'bg-[#2b2b2b] border-indigo-500/30 scale-[1.01]' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                    <span className="font-extrabold text-sm text-[#FDFBF7] tracking-tight uppercase">
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 bg-[#111827] border border-white/5 px-2 py-0.5 rounded-full">
                    {getColumnTasks(status).length}
                  </span>
                </div>

                {/* Column Body Tasks */}
                <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[600px] pr-1">
                  {getColumnTasks(status).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      userRole={userRole}
                    />
                  ))}

                  {getColumnTasks(status).length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/2 rounded-2xl py-12 px-4 text-center">
                      <HelpCircle className="w-6 h-6 text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500 font-bold">No tasks here</p>
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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1F2937] border border-white/5 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white animate-slideUp"
          >
            <div className="border-b border-white/5 pb-3">
              <h2 className="font-extrabold text-base text-[#FDFBF7]">Delete project workflow</h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-bold">
              Are you sure you want to delete <strong className="text-white font-extrabold">{project.name}</strong>?
              This action is permanent and removes all associated task lists.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5 mt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-transparent border border-white/5 hover:bg-white/5 text-gray-300 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                id="btn-confirm-delete"
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-red-500/20"
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
