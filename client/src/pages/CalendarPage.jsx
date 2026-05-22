import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Tag } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchAllTasks();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const updatedDayTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const tDate = new Date(t.dueDate);
        return tDate.getDate() === selectedDate.getDate() &&
               tDate.getMonth() === selectedDate.getMonth() &&
               tDate.getFullYear() === selectedDate.getFullYear();
      });
      setSelectedDayTasks(updatedDayTasks);
    }
  }, [tasks, selectedDate]);

  const fetchAllTasks = async () => {
    try {
      const projRes = await api.get('/projects');
      const projectsData = projRes.data.projects || [];
      setProjects(projectsData);
      
      const allTasksPromises = projectsData.map(p => api.get(`/projects/${p.id}/tasks`));
      const taskResponses = await Promise.all(allTasksPromises);
      
      const combinedTasks = [];
      taskResponses.forEach((res, index) => {
        const projectTasks = res.data.tasks || [];
        projectTasks.forEach(t => {
          combinedTasks.push({
            ...t,
            projectName: projectsData[index].name
          });
        });
      });
      
      setTasks(combinedTasks);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks for calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCreateOrUpdateTask = async (data, taskId) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;
      await api.put(`/projects/${taskToUpdate.projectId}/tasks/${taskId}`, data);
      toast.success('Task updated successfully');
      fetchAllTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  // Date math helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDayTasks([]);
    setSelectedDateStr(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDayTasks([]);
    setSelectedDateStr(null);
  };

  // Calendar rendering math
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate); // 0 = Sun, 1 = Mon ...
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Create grid cells
  const cells = [];
  // Empty slots for previous month's padding
  const tempPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
  const prevMonthDays = tempPrevMonth.getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i)
    });
  }
  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
    });
  }
  // Next month's padding slots to complete full weeks
  const totalSlots = 42; // 6 rows of 7 days
  const remaining = totalSlots - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
    });
  }

  // Filter tasks belonging to a day
  const getTasksForDate = (date) => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const tDate = new Date(t.dueDate);
      return tDate.getDate() === date.getDate() &&
             tDate.getMonth() === date.getMonth() &&
             tDate.getFullYear() === date.getFullYear();
    });
  };

  const handleSelectDay = (cell) => {
    setSelectedDate(cell.date);
    setSelectedDateStr(cell.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black/10 border-t-accent-secondary" />
        <p className="font-sans text-sm font-medium tracking-wide">Drawing workspace timeline...</p>
      </div>
    );
  }

  const projectOfTask = editingTask ? projects.find(p => p.id === editingTask.projectId) : null;
  const taskMembers = projectOfTask?.members || [];
  const taskUserRole = projectOfTask?.members?.find(m => m.user.id === user?.id)?.role || 'MEMBER';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-accent-secondary" /> Workspace Schedule
          </h1>
          <p className="text-sm text-text-secondary mt-1">Calendar roadmap showing task milestones and timelines</p>
        </div>

        {/* Date controllers */}
        <div className="flex items-center gap-2 bg-bg-surface p-1.5 rounded-2xl border border-black/5 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-bg-main text-text-secondary hover:text-text-primary rounded-xl transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-black text-text-primary px-3 tracking-wide uppercase min-w-[130px] text-center">
            {monthName} {year}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-bg-main text-text-secondary hover:text-text-primary rounded-xl transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Month Grid */}
        <div className="lg:col-span-8 bg-bg-surface border border-black/5 p-5 sm:p-6 rounded-[2.5rem] mac-shadow">
          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <span key={i} className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, idx) => {
              const dayTasks = getTasksForDate(cell.date);
              const hasTasks = dayTasks.length > 0;
              const isToday = new Date().toDateString() === cell.date.toDateString();
              const isSelected = selectedDateStr === cell.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDay(cell)}
                  className={`min-h-20 p-2.5 text-left rounded-2xl flex flex-col justify-between border transition-all duration-300 ${
                    isToday
                      ? 'calendar-today text-text-primary'
                      : isSelected
                      ? 'calendar-selected text-text-primary'
                      : cell.isCurrentMonth
                      ? 'bg-bg-surface hover:bg-bg-main border-black/5 text-text-primary shadow-xs hover:scale-[1.02]'
                      : 'bg-bg-main/30 border-transparent text-text-secondary/40 hover:bg-bg-main/50'
                  }`}
                >
                  <span className={`text-xs font-black leading-none ${isToday ? 'text-accent-secondary border-b-2 border-accent-primary pb-0.5 font-extrabold' : ''}`}>{cell.day}</span>
                  
                  {/* Miniature task indicators */}
                  {hasTasks && (
                    <div className="flex flex-col gap-1 w-full mt-2">
                      {dayTasks.slice(0, 2).map((t, tIdx) => (
                        <div
                          key={tIdx}
                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded truncate leading-tight border ${
                            t.status === 'DONE'
                              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20'
                              : t.priority === 'URGENT' || t.priority === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-800 border-rose-500/20'
                              : 'bg-accent-primary/15 text-accent-secondary border-accent-primary/30'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[7px] text-text-secondary/70 font-bold pl-1">+{dayTasks.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Task Drawer */}
        <div className="lg:col-span-4 bg-bg-surface border border-black/5 p-6 rounded-[2.5rem] min-h-[400px] flex flex-col justify-between mac-shadow">
          <div>
            <h3 className="text-base font-black text-text-primary">Daily Agenda</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {selectedDateStr || 'Select a calendar block to show tasks'}
            </p>

            <div className="space-y-3.5 mt-5">
              {selectedDayTasks.length > 0 ? (
                selectedDayTasks.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleEditTask(t)}
                    className="group p-4 bg-bg-main/40 hover:bg-bg-main rounded-2xl border border-black/5 hover:border-accent-primary/25 cursor-pointer active:scale-[0.98] transition-all text-left space-y-2 mac-shadow hover:scale-[1.02] duration-300"
                  >

                    <div className="flex justify-between items-center gap-2">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        t.status === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-accent-primary/10 text-accent-secondary border-accent-primary/20'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-[9px] font-bold text-text-secondary flex items-center gap-1">
                        <Tag size={10} /> {t.projectName}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-text-primary group-hover:text-accent-secondary transition-colors leading-snug break-words">{t.title}</h4>
                    {t.description && <p className="text-[10px] text-text-secondary leading-normal line-clamp-2">{t.description}</p>}

                    <div className="flex items-center gap-1 text-[9px] text-text-secondary pt-1 border-t border-black/5">
                      <Clock size={10} /> Due {new Date(t.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-xs text-text-secondary border border-dashed border-black/10 rounded-2xl flex flex-col items-center justify-center">
                  <Clock className="w-8 h-8 text-text-secondary/50 mb-2" />
                  <p className="font-bold">No tasks scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        task={editingTask}
        members={taskMembers}
        userRole={taskUserRole}
      />
    </div>
  );
}
