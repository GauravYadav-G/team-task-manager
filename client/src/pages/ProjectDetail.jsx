import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import MemberList from '../components/MemberList';
import { getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

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
        toast.success('Task updated');
      } else {
        await api.post(`/projects/${id}/tasks`, data);
        toast.success('Task created');
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
      toast.success('Task deleted');
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
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
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!project) return null;

  const getColumnTasks = (status) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="page project-detail-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <button
            className="btn btn-ghost btn-sm back-btn"
            onClick={() => navigate('/projects')}
          >
            ← Back
          </button>
          <h1>{project.name}</h1>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-ghost"
            onClick={() => setShowMembers(!showMembers)}
            id="btn-toggle-members"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Team ({project.members?.length || 0})
          </button>

          {isAdmin && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                id="btn-create-task"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Task
              </button>

              <button
                className="btn btn-ghost btn-danger-text"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete project"
                id="btn-delete-project"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="project-detail-layout">
        {/* Kanban Board */}
        <div className="kanban-board">
          {COLUMNS.map((status) => (
            <div
              key={status}
              className={`kanban-column ${dragOverColumn === status ? 'kanban-column-dragover' : ''}`}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
            >
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span
                    className="kanban-column-dot"
                    style={{
                      backgroundColor:
                        status === 'TODO'
                          ? '#94a3b8'
                          : status === 'IN_PROGRESS'
                            ? '#7c3aed'
                            : '#22c55e',
                    }}
                  />
                  <span>{getStatusLabel(status)}</span>
                </div>
                <span className="kanban-column-count">
                  {getColumnTasks(status).length}
                </span>
              </div>

              <div className="kanban-column-body">
                {getColumnTasks(status).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    userRole={userRole}
                  />
                ))}

                {getColumnTasks(status).length === 0 && (
                  <div className="kanban-empty">
                    <p>No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Members Panel */}
        {showMembers && (
          <div className="members-panel">
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

      {/* Task Modal */}
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

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Project</h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>{project.name}</strong>?
                This will permanently delete all tasks and remove all members.
              </p>
              <div className="modal-footer">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteProject}
                  id="btn-confirm-delete"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
