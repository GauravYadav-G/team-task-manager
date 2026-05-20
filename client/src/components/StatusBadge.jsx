import {
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
} from '../utils/helpers';

export function StatusBadge({ status }) {
  return (
    <span
      className="badge"
      style={{
        '--badge-color': getStatusColor(status),
      }}
    >
      <span className="badge-dot" />
      {getStatusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className="badge badge-priority"
      style={{
        '--badge-color': getPriorityColor(priority),
      }}
    >
      {getPriorityLabel(priority)}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN';
  return (
    <span
      className="badge"
      style={{
        '--badge-color': isAdmin ? '#7c3aed' : '#06b6d4',
      }}
    >
      {isAdmin ? 'Admin' : 'Member'}
    </span>
  );
}
