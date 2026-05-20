import { useMemo } from 'react';
import { Calendar, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { getInitials } from '../utils/helpers';
import StatusBadge from './StatusBadge';

export default function TaskCard({ task, onEdit, onStatusChange, userRole }) {
  const overdue = useMemo(() => {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date().setHours(0,0,0,0);
  }, [task.dueDate, task.status]);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const priorityConfig = useMemo(() => {
    switch (task.priority) {
      case 'URGENT':
      case 'HIGH':
        return { border: 'border-l-4 border-l-red-500', text: 'text-red-500', glow: 'shadow-red-500/5' };
      case 'MEDIUM':
        return { border: 'border-l-4 border-l-indigo-500', text: 'text-indigo-500', glow: 'shadow-indigo-500/5' };
      case 'LOW':
      default:
        return { border: 'border-l-4 border-l-green-600', text: 'text-green-600', glow: 'shadow-green-500/5' };
    }
  }, [task.priority]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit?.(task)}
      id={`task-${task.id}`}
      className={`group bg-[#1E1E1E] hover:bg-[#1F2937] border border-white/5 hover:border-white/10 p-5 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-lg ${priorityConfig.border} ${priorityConfig.glow} ${overdue ? 'bg-red-500/5 border-red-500/20' : ''}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <StatusBadge type="priority" value={task.priority} />
        {overdue && (
          <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        )}
      </div>

      <h4 className="font-extrabold text-sm text-[#FDFBF7] group-hover:text-indigo-400 transition-colors duration-200 line-clamp-1 leading-snug">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-gray-400 leading-relaxed mt-1 mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3.5 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span className={overdue ? 'text-red-400' : ''}>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
          </span>
        </div>

        {task.assignedTo ? (
          <div 
            className="w-7 h-7 rounded-xl bg-indigo-500 text-white font-extrabold flex items-center justify-center text-[10px] uppercase border border-white/10"
            title={task.assignedTo.name}
          >
            {getInitials(task.assignedTo.name)}
          </div>
        ) : (
          <div className="w-7 h-7 rounded-xl bg-gray-800 text-gray-500 flex items-center justify-center" title="Unassigned">
            <User className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}
