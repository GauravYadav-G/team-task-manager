import { useMemo } from 'react';
import { Calendar, User, Clock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { getInitials } from '../utils/helpers';

export default function TaskCard({ task, onEdit, userRole }) {
  const overdue = useMemo(() => {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date().setHours(0,0,0,0);
  }, [task.dueDate, task.status]);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const priorityStyle = useMemo(() => {
    switch (task.priority) {
      case 'URGENT':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-700 shadow-sm',
          dot: 'bg-rose-500',
          glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.05)]'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-700 shadow-sm',
          dot: 'bg-amber-500',
          glow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.05)]'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-700 shadow-sm',
          dot: 'bg-blue-500',
          glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.05)]'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 shadow-sm',
          dot: 'bg-emerald-500',
          glow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.05)]'
        };
    }
  }, [task.priority]);

  const formattedDate = useMemo(() => {
    if (!task.dueDate) return '';
    return new Date(task.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [task.dueDate]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit?.(task)}
      id={`task-${task.id}`}
      className={`group bg-bg-surface hover:bg-bg-main border border-black/5 hover:border-accent-primary/20 p-5 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-300 shadow-sm ${
        overdue 
          ? 'bg-rose-500/[0.02] border-rose-500/20 hover:border-rose-500/30' 
          : ''
      } ${priorityStyle.glow}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Priority Badge */}
        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${priorityStyle.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
          {task.priority}
        </span>
        
        {/* Overdue Alert Badge */}
        {overdue && (
          <span className="flex items-center gap-1 text-[9px] uppercase font-black tracking-wider text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            <AlertCircle className="w-3 h-3 stroke-[2.5]" />
            Overdue
          </span>
        )}
      </div>

      {/* Task Title */}
      <h4 className="font-bold text-sm text-text-primary transition-colors duration-200 line-clamp-1 leading-snug">
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-text-secondary font-medium leading-relaxed mt-1.5 mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3.5 border-t border-black/5 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold">
          <Calendar className={`w-3.5 h-3.5 ${overdue ? 'text-rose-600' : 'text-accent-secondary/80'}`} />
          <span className={overdue ? 'text-rose-600 font-black' : 'font-semibold text-text-secondary'}>
            {formattedDate || 'No due date'}
          </span>
        </div>

        {/* Assigned User Avatar/Chip */}
        {task.assignedTo ? (
          <div className="flex items-center gap-2">
            {task.assignedTo.avatar ? (
              <img
                src={task.assignedTo.avatar}
                alt={task.assignedTo.name}
                className="w-7 h-7 rounded-xl object-cover ring-2 ring-black/5 hover:ring-accent-primary/50 transition-all duration-300"
                title={task.assignedTo.name}
              />
            ) : (
              <div 
                className="w-7 h-7 rounded-xl bg-accent-primary text-accent-secondary font-black flex items-center justify-center text-[10px] uppercase border border-black/10 transition-transform group-hover:scale-105"
                title={task.assignedTo.name}
              >
                {getInitials(task.assignedTo.name)}
              </div>
            )}
          </div>
        ) : (
          <div className="w-7 h-7 rounded-xl bg-bg-main text-text-secondary hover:text-text-primary border border-black/5 flex items-center justify-center transition-colors" title="Unassigned">
            <User className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        )}
      </div>
    </div>
  );
}
