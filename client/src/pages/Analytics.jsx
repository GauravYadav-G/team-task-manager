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
      const localDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
      const res = await api.get(`/dashboard?localDate=${localDate}`);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black/10 border-t-accent-primary" />
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
    if (total === 0) return <div className="text-text-secondary text-xs py-8">No tasks distribution data</div>;

    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const todoOffset = circumference;
    const progressOffset = circumference - (todoCount / total) * circumference;
    const doneOffset = progressOffset - (inProgressCount / total) * circumference;

    return (
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="rgba(0,0,0,0.05)" strokeWidth="12" fill="transparent" />
          {todoCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#737373"
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
              stroke="#3B82F6"
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
              stroke="#10B981"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - ((todoCount + inProgressCount + doneCount) / total) * circumference}
              className="transition-all duration-1000"
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-text-primary">{total}</span>
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold">Tasks</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-2">
          <BarChart3 className="text-accent-secondary" /> Workspace Analytics
        </h1>
        <p className="text-sm text-text-secondary mt-1">Real-time productivity insights and sprint performance trackers</p>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-fadeIn">
        <div className="bg-bg-surface p-5 rounded-3xl border border-black/5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Completion Rate</span>
            <span className="text-2xl font-black text-text-primary mt-1 block">{completionRate}%</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-bg-surface p-5 rounded-3xl border border-black/5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Active Projects</span>
            <span className="text-2xl font-black text-text-primary mt-1 block">{totalProjects}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-secondary">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-bg-surface p-5 rounded-3xl border border-black/5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Team Members</span>
            <span className="text-2xl font-black text-text-primary mt-1 block">{totalMembers}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-bg-surface p-5 rounded-3xl border border-black/5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Overdue Backlog</span>
            <span className="text-2xl font-black text-text-primary mt-1 block">{overdueTasks}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
        
        {/* Left chart panel - Velocity Trends */}
        <div className="lg:col-span-8 bg-bg-surface p-6 rounded-[2.5rem] border border-black/5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-base font-black text-text-primary">Sprint Velocity Performance</h3>
            <p className="text-xs text-text-secondary">Comparing target optimistic versus actual completed velocities</p>
          </div>

          {/* SVG Custom Line Chart */}
          <div className="w-full h-56 mt-6 relative">
            {velocityData && velocityData.length > 0 ? (() => {
              // Chart dimensions
              const W = 400, H = 150;
              const padL = 32, padR = 20, padT = 15, padB = 30;
              const chartW = W - padL - padR;
              const chartH = H - padT - padB;

              // Find max value across all series to scale the chart
              const allVals = velocityData.flatMap(d => [d.optimistic, d.realistic, d.velocity]);
              const maxVal = Math.max(...allVals, 1);

              // Convert a data value to SVG Y coordinate (inverted: higher = lower Y)
              const toY = (v) => padT + chartH - (v / maxVal) * chartH;
              // Convert a data point index to SVG X coordinate
              const toX = (i) => padL + (i / Math.max(velocityData.length - 1, 1)) * chartW;

              const optimisticPoints = velocityData.map((d, i) => `${toX(i)},${toY(d.optimistic)}`).join(' ');
              const realisticPoints = velocityData.map((d, i) => `${toX(i)},${toY(d.realistic)}`).join(' ');
              const velocityPoints = velocityData.map((d, i) => `${toX(i)},${toY(d.velocity)}`).join(' ');

              // Gridline y values (3 horizontal guides)
              const gridYs = [padT, padT + chartH * 0.4, padT + chartH * 0.75];

              return (
                <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`}>
                  {/* Horizontal Gridlines */}
                  {gridYs.map((gy, gi) => (
                    <line
                      key={gi}
                      x1={padL} y1={gy}
                      x2={W - padR} y2={gy}
                      stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" strokeDasharray="3"
                    />
                  ))}

                  {/* Optimistic Target line (dashed/dotted gold) */}
                  <polyline
                    fill="none"
                    stroke="#E6C35C"
                    strokeWidth="1.8"
                    strokeDasharray="2 3"
                    strokeLinecap="round"
                    points={optimisticPoints}
                  />

                  {/* Target / Realistic line (dashed grey) */}
                  <polyline
                    fill="none"
                    stroke="#737373"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    points={realisticPoints}
                  />

                  {/* Actual Velocity line (solid dark) */}
                  <polyline
                    fill="none"
                    stroke="#2D2D2D"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={velocityPoints}
                  />

                  {/* Interactive data point circles */}
                  {velocityData.map((d, i) => (
                    <g key={i}>
                      {/* Optimistic Target point */}
                      <circle
                        cx={toX(i)}
                        cy={toY(d.optimistic)}
                        r="3.5"
                        fill="#E6C35C"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                        className="cursor-pointer hover:r-5 transition-all"
                      >
                        <title>{d.name} Optimistic Target: {d.optimistic} tasks</title>
                      </circle>

                      {/* Realistic Target point */}
                      <circle
                        cx={toX(i)}
                        cy={toY(d.realistic)}
                        r="3.5"
                        fill="#737373"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                        className="cursor-pointer hover:r-5 transition-all"
                      >
                        <title>{d.name} Realistic Target: {d.realistic} tasks</title>
                      </circle>

                      {/* Actual Completed point */}
                      <circle
                        cx={toX(i)}
                        cy={toY(d.velocity)}
                        r="4.5"
                        fill="#2D2D2D"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="cursor-pointer hover:r-6 transition-all"
                      >
                        <title>{d.name} Actual Completed: {d.velocity} tasks</title>
                      </circle>
                    </g>
                  ))}

                  {/* Sprint labels on X axis */}
                  {velocityData.map((d, i) => (
                    <text
                      key={i}
                      x={toX(i)}
                      y={H - 5}
                      fill="#737373"
                      fontSize="8"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {d.name}
                    </text>
                  ))}
                </svg>
              );
            })() : (
              <div className="flex items-center justify-center h-full text-xs text-text-secondary">Insufficient velocity data.</div>
            )}
          </div>

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-black/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-accent-secondary rounded-full"></span>
              <span className="text-[10px] text-text-secondary font-semibold uppercase">Actual Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-text-secondary border-dashed border rounded-full"></span>
              <span className="text-[10px] text-text-secondary font-semibold uppercase">Realistic Target</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-accent-primary border-dotted border rounded-full"></span>
              <span className="text-[10px] text-text-secondary font-semibold uppercase">Optimistic Target</span>
            </div>
          </div>
        </div>

        {/* Right chart panel - Donut Status Breakdown */}
        <div className="lg:col-span-4 bg-bg-surface p-6 rounded-[2.5rem] border border-black/5 flex flex-col justify-between items-center text-center shadow-sm">
          <div className="w-full text-left">
            <h3 className="text-base font-black text-text-primary font-sans">Task Distributions</h3>
            <p className="text-xs text-text-secondary">Visual progress breakdown by active status</p>
          </div>

          {renderStatusDonut()}

          <div className="w-full space-y-2 mt-4">
            <div className="flex justify-between text-xs font-bold border-b border-black/5 pb-2">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-md bg-emerald-500" /> Done</span>
              <span className="text-text-primary">{doneCount}</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-b border-black/5 pb-2">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-md bg-blue-500" /> In Progress</span>
              <span className="text-text-primary">{inProgressCount}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-md bg-text-secondary" /> Todo</span>
              <span className="text-text-primary">{todoCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Team Member Workload Breakdown */}
      <div className="bg-bg-surface p-6 rounded-[2.5rem] border border-black/5 shadow-sm animate-fadeIn">
        <h3 className="text-base font-black text-text-primary mb-1">Resource Workload Index</h3>
        <p className="text-xs text-text-secondary mb-6">Assigned sprint loads across active team members</p>

        <div className="space-y-4">
          {tasksPerUser && tasksPerUser.length > 0 ? (
            tasksPerUser.map((item, idx) => {
              const count = item.count || 0;
              const barPercent = Math.min(100, (count / (totalTasks || 1)) * 100);
              return (
                <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-bg-main rounded-2xl border border-black/5">
                  <div className="w-1/4">
                    <h4 className="text-xs font-black text-text-primary">{item.user?.name || 'Unassigned'}</h4>
                    <span className="text-[10px] text-text-secondary font-semibold">{item.user?.email || 'N/A'}</span>
                  </div>

                  <div className="flex-1 bg-black/5 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-accent-primary h-full rounded-full transition-all" style={{ width: `${barPercent}%` }}></div>
                  </div>

                  <span className="text-xs font-black text-text-primary w-12 text-right">
                    {count} task{count !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-text-secondary">
              No team members have been assigned to sprint tasks yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
