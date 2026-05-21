import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Tag } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const projRes = await api.get('/projects');
      const projects = projRes.data.projects || [];
      
      const allTasksPromises = projects.map(p => api.get(`/projects/${p.id}/tasks`));
      const taskResponses = await Promise.all(allTasksPromises);
      
      const combinedTasks = [];
      taskResponses.forEach((res, index) => {
        const projectTasks = res.data.tasks || [];
        projectTasks.forEach(t => {
          combinedTasks.push({
            ...t,
            projectName: projects[index].name
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
    const dayTasks = getTasksForDate(cell.date);
    setSelectedDayTasks(dayTasks);
    setSelectedDateStr(cell.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Drawing workspace timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-yellow-400" /> Workspace Schedule
          </h1>
          <p className="text-sm text-gray-400 mt-1">Calendar roadmap showing task milestones and timelines</p>
        </div>

        {/* Date controllers */}
        <div className="flex items-center gap-2 bg-[#1C1F26] p-1.5 rounded-2xl border border-white/5">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-black text-white px-3 tracking-wide uppercase min-w-32 text-center">
            {monthName} {year}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Month Grid */}
        <div className="lg:col-span-8 bg-[#1C1F26] border border-white/5 p-5 sm:p-6 rounded-[2.5rem] shadow-xl">
          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <span key={i} className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, idx) => {
              const dayTasks = getTasksForDate(cell.date);
              const hasTasks = dayTasks.length > 0;
              const isToday = new Date().toDateString() === cell.date.toDateString();

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDay(cell)}
                  className={`min-h-20 p-2 text-left rounded-2xl flex flex-col justify-between border transition-all ${
                    cell.isCurrentMonth
                      ? 'bg-black/20 hover:bg-black/45 border-white/5 text-white'
                      : 'bg-transparent border-transparent text-gray-600'
                  } ${isToday ? 'ring-2 ring-yellow-400 border-yellow-400' : ''}`}
                >
                  <span className={`text-xs font-black leading-none ${isToday ? 'text-yellow-400' : ''}`}>{cell.day}</span>
                  
                  {/* Miniature task indicators */}
                  {hasTasks && (
                    <div className="flex flex-col gap-1 w-full mt-2">
                      {dayTasks.slice(0, 2).map((t, tIdx) => (
                        <div
                          key={tIdx}
                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded truncate leading-tight ${
                            t.status === 'DONE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                              : t.priority === 'URGENT' || t.priority === 'HIGH'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[7px] text-gray-500 font-bold pl-1">+{dayTasks.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Task Drawer */}
        <div className="lg:col-span-4 bg-[#1C1F26] border border-white/5 p-6 rounded-[2.5rem] min-h-[400px] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-white">Daily Agenda</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedDateStr || 'Select a calendar block to show tasks'}
            </p>

            <div className="space-y-3.5 mt-5">
              {selectedDayTasks.length > 0 ? (
                selectedDayTasks.map((t, idx) => (
                  <div key={idx} className="p-4 bg-black/25 rounded-2xl border border-white/5 hover:border-gray-700 transition-colors text-left space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1">
                        <Tag size={10} /> {t.projectName}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white leading-snug break-words">{t.title}</h4>
                    {t.description && <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">{t.description}</p>}

                    <div className="flex items-center gap-1 text-[9px] text-gray-500 pt-1 border-t border-white/5">
                      <Clock size={10} /> Due {new Date(t.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-xs text-gray-500 border border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="font-bold">No tasks scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
