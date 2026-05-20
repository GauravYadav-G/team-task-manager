import { StatusBadge, PriorityBadge } from './StatusBadge';
import {
  formatDate,
  isOverdue,
  getInitials,
  getDaysUntilDue,
} from '../utils/helpers';

export default function TaskCard({ task, onEdit, onStatusChange, userRole }) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';
  const daysLeft = getDaysUntilDue(task.dueDate);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`task-card ${overdue ? 'task-card-overdue' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit?.(task)}
      id={`task-${task.id}`}
    >
      <div className="task-card-header">
        <PriorityBadge priority={task.priority} />
        {overdue && (
          <span className="overdue-badge">Overdue</span>
        )}
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-card-meta">
          {task.dueDate && (
            <span className={`task-card-due ${overdue ? 'text-danger' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {task.assignedTo && (
          <div className="avatar avatar-xs" title={task.assignedTo.name}>
            {getInitials(task.assignedTo.name)}
          </div>
        )}
      </div>
    </div>
  );
}
