import { FolderKanban, Users, Calendar, ArrowRight } from 'lucide-react';
import { getInitials } from '../utils/helpers';

export default function ProjectCard({ project, onClick }) {
  const memberCount = project.members?.length || 0;
  const taskCount = project._count?.tasks || 0;

  return (
    <div 
      onClick={onClick}
      className="group bg-[#1F2937] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-indigo-500/5 relative overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="bg-indigo-500/10 text-indigo-500 p-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <FolderKanban className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>

      <h3 className="font-extrabold text-lg text-white mb-2 group-hover:text-indigo-400 transition-colors duration-200 truncate">
        {project.name}
      </h3>
      
      <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-2">
        {project.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-pink-500" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div>
            <span className="text-white font-extrabold">{taskCount}</span> tasks
          </div>
        </div>

        <div className="text-gray-500 group-hover:text-indigo-500 transition-colors duration-200">
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
}
