import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Compiling workspace metrics...</p>
      </div>
    );
  }

  if (!stats) return null;

  const {
    totalTasks,
    totalProjects,
    totalMembers,
    tasksByStatus,
    overdueTasks,
    tasksPerUser,
    velocityData
  } = stats;

  const doneCount = tasksByStatus?.DONE || 0;
  const inProgressCount = tasksByStatus?.IN_PROGRESS || 0;
  const todoCount = tasksByStatus?.TODO || 0;
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Render SVG Donut Chart for status distribution
  const renderStatusDonut = () => {
    const total = doneCount + inProgressCount + todoCount;
    if (total === 0) return <div className="text-gray-500 text-xs py-8">No tasks distribution data</div>;

    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const todoOffset = circumference;
    const progressOffset = circumference - (todoCount / total) * circumference;
    const doneOffset = progressOffset - (inProgressCount / total) * circumference;

    return (
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="#2D3748" strokeWidth="12" fill="transparent" />
          {todoCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#A0AEC0"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (todoCount / total) * circumference}
              className="transition-all duration-1000"
            />
          )}
          {inProgressCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#6366F1"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - ((todoCount + inProgressCount) / total) * circumference}
              className="transition-all duration-1000"
            />
          )}
          {doneCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#34D399"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - ((todoCount + inProgressCount + doneCount) / total) * circumference}
              className="transition-all duration-1000"
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-white">{total}</span>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Tasks</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="text-yellow-400" /> Workspace Analytics
        </h1>
        <p className="text-sm text-gray-400 mt-1">Real-time productivity insights and sprint performance trackers</p>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-[#1C1F26] p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Completion Rate</span>
            <span className="text-2xl font-black text-white mt-1 block">{completionRate}%</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-[#1C1F26] p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Projects</span>
            <span className="text-2xl font-black text-white mt-1 block">{totalProjects}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-[#1C1F26] p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Team Members</span>
            <span className="text-2xl font-black text-white mt-1 block">{totalMembers}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-[#1C1F26] p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Overdue Backlog</span>
            <span className="text-2xl font-black text-white mt-1 block">{overdueTasks}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left chart panel - Velocity Trends */}
        <div className="lg:col-span-8 bg-[#1C1F26] p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-white">Sprint Velocity Performance</h3>
            <p className="text-xs text-gray-400">Comparing target optimistic versus actual completed velocities</p>
          </div>

          {/* SVG Custom Line Chart */}
          <div className="w-full h-56 mt-6 relative">
            {velocityData && velocityData.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {/* Horizontal Gridlines */}
                <line x1="30" y1="20" x2="380" y2="20" stroke="#2D3748" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="30" y1="65" x2="380" y2="65" stroke="#2D3748" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="30" y1="110" x2="380" y2="110" stroke="#2D3748" strokeWidth="0.5" strokeDasharray="3" />

                {/* Optimistic Trend Line (Grey) */}
                <polyline
                  fill="none"
                  stroke="#4A5568"
                  strokeWidth="2"
                  points="50,110 150,90 250,60 350,30"
                />

                {/* Actual Velocity Trend Line (Yellow) */}
                <polyline
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  points="50,120 150,105 250,75 350,45"
                />

                {/* Interactive points */}
                <circle cx="50" cy="120" r="4.5" fill="#FBBF24" />
                <circle cx="150" cy="105" r="4.5" fill="#FBBF24" />
                <circle cx="250" cy="75" r="4.5" fill="#FBBF24" />
                <circle cx="350" cy="45" r="4.5" fill="#FBBF24" />

                {/* Labels */}
                <text x="50" y="142" fill="#718096" fontSize="8" textAnchor="middle" fontWeight="bold">Sprint 1</text>
                <text x="150" y="142" fill="#718096" fontSize="8" textAnchor="middle" fontWeight="bold">Sprint 2</text>
                <text x="250" y="142" fill="#718096" fontSize="8" textAnchor="middle" fontWeight="bold">Sprint 3</text>
                <text x="350" y="142" fill="#718096" fontSize="8" textAnchor="middle" fontWeight="bold">Sprint 4</text>
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-500">Insufficient velocity data.</div>
            )}
          </div>

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-yellow-400 rounded-full"></span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Actual Velocity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-gray-600 rounded-full"></span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Target Velocity</span>
            </div>
          </div>
        </div>

        {/* Right chart panel - Donut Status Breakdown */}
        <div className="lg:col-span-4 bg-[#1C1F26] p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h3 className="text-base font-black text-white font-sans">Task Distributions</h3>
            <p className="text-xs text-gray-400">Visual progress breakdown by active status</p>
          </div>

          {renderStatusDonut()}

          <div className="w-full space-y-2 mt-4">
            <div className="flex justify-between text-xs font-bold border-b border-white/5 pb-2">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-md bg-emerald-400" /> Done</span>
              <span className="text-white">{doneCount}</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-b border-white/5 pb-2">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-md bg-indigo-500" /> In Progress</span>
              <span className="text-white">{inProgressCount}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-md bg-gray-500" /> Todo</span>
              <span className="text-white">{todoCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Team Member Workload Breakdown */}
      <div className="bg-[#1C1F26] p-6 rounded-[2.5rem] border border-white/5">
        <h3 className="text-base font-black text-white mb-1">Resource Workload Index</h3>
        <p className="text-xs text-gray-400 mb-6">Assigned sprint loads across active team members</p>

        <div className="space-y-4">
          {tasksPerUser && tasksPerUser.length > 0 ? (
            tasksPerUser.map((item, idx) => {
              const count = item.count || 0;
              const barPercent = Math.min(100, (count / (totalTasks || 1)) * 100);
              return (
                <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-black/20 rounded-2xl border border-white/5">
                  <div className="w-1/4">
                    <h4 className="text-xs font-black text-white">{item.user?.name || 'Unassigned'}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{item.user?.email || 'N/A'}</span>
                  </div>

                  <div className="flex-1 bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full transition-all" style={{ width: `${barPercent}%` }}></div>
                  </div>

                  <span className="text-xs font-black text-white w-12 text-right">
                    {count} task{count !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-gray-500">
              No team members have been assigned to sprint tasks yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
