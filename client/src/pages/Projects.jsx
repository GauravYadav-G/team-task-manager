import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, FolderKanban, Users, CheckCircle2, ChevronRight, LayoutGrid } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setCreating(true);
    try {
      await api.post('/projects', formData);
      toast.success('Project created!');
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const getUserRole = (project) => {
    const membership = project.members?.find((m) => m.user.id === user?.id);
    return membership?.role || 'MEMBER';
  };

  // Unify all cards with the premium glassmorphic theme
  const getCardColor = () => {
    return 'bg-bg-surface border-black/5 text-text-primary';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black/10 border-t-accent-primary" />
        <p className="font-sans text-sm font-medium tracking-wide">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight">
            Workspace Projects
          </h1>
          <p className="text-sm text-text-secondary font-medium mt-2">
            {projects.length} active project{projects.length !== 1 ? 's' : ''} • Organize your team's work across multiple streams
          </p>
        </div>
        <button
          className="bg-accent-secondary text-white hover:opacity-90 py-3 px-6 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 shrink-0 cursor-pointer"
          onClick={() => setShowModal(true)}
          id="btn-create-project"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-bg-surface border border-black/5 rounded-[2rem] p-12 flex flex-col items-center text-center shadow-sm animate-fadeIn">
          <FolderKanban className="w-16 h-16 text-text-secondary/40 mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No projects yet</h2>
          <p className="text-text-secondary text-sm mb-6 max-w-md">Create your first project to start managing tasks, team milestones, and sprints.</p>
          <button
            className="bg-accent-secondary text-white py-2.5 px-6 rounded-full font-semibold hover:opacity-90 shadow-md cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 w-full animate-fadeIn">
          {projects.map((project, idx) => {
            const role = getUserRole(project);
            const isDark = false;
            const cardStyle = getCardColor();
            
            return (
              <Link
                to={`/projects/${project.id}`}
                key={project.id}
                id={`project-${project.id}`}
                className={`${cardStyle} rounded-[2rem] p-6 flex flex-col h-72 relative border mac-shadow transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] active:scale-[0.98] group overflow-hidden`}
              >
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs bg-gradient-to-br from-accent-primary/25 to-accent-primary/5 text-accent-secondary border border-accent-primary/20">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                    role === 'ADMIN' 
                      ? (!isDark ? 'bg-indigo-500/10 text-indigo-700 border-indigo-200' : 'bg-white/25 text-white border-white/30')
                      : (!isDark ? 'bg-black/5 text-text-secondary border-black/5' : 'bg-white/10 text-gray-200 border-white/15')
                  }`}>
                    {role}
                  </span>
                </div>

                <div className="flex-1 mt-3 relative z-10">
                  <h3 className={`text-lg font-black mb-2 line-clamp-2 leading-tight ${
                    !isDark ? 'text-text-primary' : 'text-white'
                  }`}>
                    {project.name}
                  </h3>
                  <p className={`text-xs line-clamp-3 leading-relaxed ${
                    !isDark ? 'text-text-secondary' : 'text-white/75'
                  }`}>
                    {project.description || 'No description provided. Add one to help team members understand the project scope.'}
                  </p>
                </div>

                <div className={`mt-auto flex items-center justify-between pt-4 border-t relative z-10 ${
                  !isDark ? 'border-black/5' : 'border-white/15'
                }`}>
                  <div className="flex -space-x-1.5">
                    {project.members?.slice(0, 4).map((m) => (
                      <div
                        key={m.user.id}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold ring-2 transition-transform group-hover:scale-110 ${
                          !isDark ? 'ring-bg-surface bg-bg-main text-text-secondary shadow-xs' : 'ring-accent-secondary bg-white/20 text-white'
                        }`}
                        title={m.user.name}
                      >
                        {getInitials(m.user.name)}
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[8px] font-black ring-2 ${
                        !isDark ? 'ring-bg-surface bg-bg-main text-text-secondary' : 'ring-accent-secondary bg-white/10 text-white'
                      }`}>
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-1 text-xs font-bold ${
                    !isDark ? 'text-text-secondary' : 'text-white/90'
                  } group-hover:gap-1.5 transition-all`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{project._count?.tasks || 0}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn" onClick={() => setShowModal(false)}>
          <div className="bg-bg-surface border border-black/5 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <h2 className="text-xl font-bold text-text-primary">Create Workspace Project</h2>
              <button
                className="text-text-secondary hover:text-text-primary transition-colors bg-black/5 hover:bg-black/10 p-2 rounded-full cursor-pointer shadow-xs"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="project-name" className="text-sm font-medium text-text-secondary">Project Name</label>
                <input
                  id="project-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-bg-main border border-black/5 focus-glow rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary transition-all duration-300"
                  placeholder="e.g. Q3 Marketing Sprint"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="project-desc" className="text-sm font-medium text-text-secondary">Description <span className="text-text-secondary font-normal">(Optional)</span></label>
                <textarea
                  id="project-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-bg-main border border-black/5 focus-glow rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary transition-all duration-300 resize-none"
                  placeholder="What's the scope of this project?"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-2 mt-2">
                <button
                  type="button"
                  className="flex-1 bg-transparent border border-black/10 text-text-secondary py-2.5 rounded-full text-sm font-semibold hover:bg-black/5 transition-colors cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-secondary text-white py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
                  disabled={creating}
                  id="btn-submit-project"
                >
                  {creating ? 'Creating...' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
