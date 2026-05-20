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

  // Fun random colors for the new theme
  const getCardColor = (index) => {
    const colors = [
      'bg-[#1C1F26] border-gray-800',
      'bg-[#FF7A50] border-[#FF7A50]',
      'bg-[#D1B153] border-[#D1B153]',
      'bg-[#FDE047] border-[#FDE047] text-gray-900',
      'bg-[#F6F4EB] border-[#F6F4EB] text-gray-900',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-400" />
        <p className="font-sans text-sm font-medium tracking-wide">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 opacity-80" />
            Workspace Projects
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            {projects.length} active project{projects.length !== 1 ? 's' : ''} in your dashboard.
          </p>
        </div>
        <button
          className="bg-white text-black hover:bg-gray-100 py-2.5 px-5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg"
          onClick={() => setShowModal(true)}
          id="btn-create-project"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#1C1F26] border border-gray-800 rounded-[2rem] p-12 flex flex-col items-center text-center">
          <FolderKanban className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md">Create your first project to start managing tasks, team milestones, and sprints.</p>
          <button
            className="bg-[#FDE047] text-gray-900 py-2 flex gap-2 px-6 rounded-full font-semibold hover:opacity-90"
            onClick={() => setShowModal(true)}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => {
            const role = getUserRole(project);
            const isDark = idx % 5 === 0 || idx % 5 === 1 || idx % 5 === 2; // Roughly map which classes are dark bg
            const cardStyle = getCardColor(idx);
            
            return (
              <Link
                to={`/projects/${project.id}`}
                key={project.id}
                id={`project-${project.id}`}
                className={`${cardStyle} rounded-[2rem] p-6 flex flex-col h-64 relative border shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl group`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
                    !isDark ? 'bg-white text-gray-900 border border-gray-100' : 'bg-white/10 text-white border border-white/10'
                  }`}>
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    role === 'ADMIN' 
                      ? (!isDark ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-white/20 text-white border-white/20')
                      : (!isDark ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-white/10 text-gray-300 border-white/10')
                  }`}>
                    {role}
                  </span>
                </div>

                <div className="flex-1 mt-2">
                  <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${!isDark ? 'text-gray-900' : 'text-white'}`}>
                    {project.name}
                  </h3>
                  <p className={`text-sm line-clamp-2 ${!isDark ? 'text-gray-600' : 'text-white/70'}`}>
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className={`mt-auto flex items-center justify-between pt-4 border-t ${!isDark ? 'border-gray-200/50' : 'border-white/10'}`}>
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 3).map((m) => (
                      <div
                        key={m.user.id}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ${!isDark ? 'ring-white bg-gray-100 text-gray-600' : 'ring-[#1C1F26] bg-white/20 text-white'}`}
                        title={m.user.name}
                      >
                        {getInitials(m.user.name)}
                      </div>
                    ))}
                    {project.members?.length > 3 && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ${!isDark ? 'ring-white bg-gray-200 text-gray-700' : 'ring-[#1C1F26] bg-white/10 text-white'}`}>
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${!isDark ? 'text-gray-600' : 'text-white/80'} group-hover:underline`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{project._count?.tasks || 0} tasks</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowModal(false)}>
          <div className="bg-[#1C1F26] border border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
              <h2 className="text-xl font-bold text-white">Create Workspace Project</h2>
              <button
                className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="project-name" className="text-sm font-medium text-gray-300">Project Name</label>
                <input
                  id="project-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#111111] border border-gray-800 focus:border-[#FDE047] rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  placeholder="e.g. Q3 Marketing Sprint"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="project-desc" className="text-sm font-medium text-gray-300">Description <span className="text-gray-600 font-normal">(Optional)</span></label>
                <textarea
                  id="project-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#111111] border border-gray-800 focus:border-[#FDE047] rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none transition-all resize-none"
                  placeholder="What's the scope of this project?"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-2 mt-2">
                <button
                  type="button"
                  className="flex-1 bg-transparent border border-gray-700 text-gray-300 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FDE047] text-gray-900 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
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
