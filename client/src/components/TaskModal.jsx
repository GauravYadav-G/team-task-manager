import { useState, useEffect } from 'react';
import { X, Calendar, User, Layout, FileText, CheckCircle2 } from 'lucide-react';

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  members,
  userRole,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    assignedToId: '',
  });
  const [loading, setLoading] = useState(false);

  const isEditing = !!task;
  const isMember = userRole === 'MEMBER';

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedToId: task.assignedToId || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: '',
        assignedToId: '',
      });
    }
  }, [task, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData };
      if (!data.dueDate) data.dueDate = null;
      if (!data.assignedToId) data.assignedToId = null;
      await onSubmit(data, task?.id);
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-[#262626] border border-white/5 w-full max-w-lg rounded-3xl p-7 shadow-2xl flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="font-extrabold text-lg text-[#FDFBF7]">{isEditing ? 'Edit Task Settings' : 'Create New Task'}</h2>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-500 mt-1 block">Task Properties</span>
          </div>
          <button 
            className="p-2 bg-[#1A1A1A] hover:bg-[#323232] rounded-xl text-gray-400 hover:text-white transition-all duration-200 border border-white/5" 
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Members can only change status */}
          {isMember && isEditing ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-status" className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-orange-500/40 cursor-pointer"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          ) : (
            <>
              {/* Task Title */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="task-title" className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-orange-500" />
                  Title *
                </label>
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20 transition-all duration-200"
                  placeholder="Enter task title"
                  required
                />
              </div>

              {/* Task Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="task-description" className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Description
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20 transition-all duration-200 resize-none"
                  placeholder="Describe the task details..."
                  rows="3"
                />
              </div>

              {/* Priority & Status Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="task-priority" className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Priority</label>
                  <select
                    id="task-priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-orange-500/40 cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="task-status-admin" className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Status</label>
                  <select
                    id="task-status-admin"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-orange-500/40 cursor-pointer"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Assignee selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="task-due-date" className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Due Date
                  </label>
                  <input
                    id="task-due-date"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500/40 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="task-assignee" className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-orange-500" />
                    Assign To
                  </label>
                  <select
                    id="task-assignee"
                    name="assignedToId"
                    value={formData.assignedToId}
                    onChange={handleChange}
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-orange-500/40 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {members?.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-3">
            <button
              type="button"
              className="bg-transparent border border-white/5 hover:bg-white/5 text-gray-300 py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-orange-500/20 disabled:opacity-50"
              disabled={loading}
              id="btn-save-task"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
