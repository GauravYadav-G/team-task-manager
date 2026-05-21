import { useMemo } from 'react';

export function StatusBadge({ status }) {
  const config = useMemo(() => {
    switch (status) {
      case 'DONE':
        return 'bg-green-600/10 text-green-750 border-green-600/20';
      case 'IN_PROGRESS':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
      case 'TODO':
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  }, [status]);

  const label = useMemo(() => {
    switch (status) {
      case 'DONE': return 'Done';
      case 'IN_PROGRESS': return 'In Progress';
      case 'TODO': return 'To Do';
      default: return status || 'To Do';
    }
  }, [status]);

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${config}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const config = useMemo(() => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'MEDIUM':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
      case 'LOW':
      default:
        return 'bg-green-600/10 text-green-750 border-green-600/20';
    }
  }, [priority]);

  const label = useMemo(() => {
    switch (priority) {
      case 'URGENT': return 'Urgent';
      case 'HIGH': return 'High';
      case 'MEDIUM': return 'Medium';
      case 'LOW': return 'Low';
      default: return priority || 'Low';
    }
  }, [priority]);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${config}`}>
      {label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN';
  const config = isAdmin
    ? 'bg-purple-500/10 text-purple-700 border-purple-500/20'
    : 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${config}`}>
      {isAdmin ? 'Admin' : 'Member'}
    </span>
  );
}

// Unified default export to prevent breaking imports in other components
export default function UniversalStatusBadge({ type, value, status, priority, role }) {
  const activeType = type || (status ? 'status' : priority ? 'priority' : role ? 'role' : 'status');
  const activeValue = value || status || priority || role;

  if (activeType === 'priority') {
    return <PriorityBadge priority={activeValue} />;
  }
  if (activeType === 'role') {
    return <RoleBadge role={activeValue} />;
  }
  return <StatusBadge status={activeValue} />;
}
