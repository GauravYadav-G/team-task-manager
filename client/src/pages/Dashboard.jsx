import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Plus, 
  Check, 
  ExternalLink, 
  Filter, 
  FileSpreadsheet, 
  Info, 
  HelpCircle, 
  Clock, 
  Zap, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  ReferenceArea 
} from 'recharts';
import api from '../api/axios';
import { getInitials } from '../utils/helpers';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Interactive UI state
  const [activeTaskId, setActiveTaskId] = useState('t-2');
  const [isRealistic, setIsRealistic] = useState(false);
  const [sprintFilter, setSprintFilter] = useState('Last Sprint');
  const [teamFilter, setTeamFilter] = useState('All Teams');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, userRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/auth/me')
      ]);
      setData(dashRes.data);
      setUser(userRes.data.user);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      toast.error('Unable to fetch live dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  // Mock data to enrich dashboard visuals where database is empty
  const defaultMilestones = [
    { id: 'm-1', name: 'v2.0 Beta Release', dueDate: 'May 28, 2026', status: 'IN_PROGRESS', members: ['Alice', 'Bob'] },
    { id: 'm-2', name: 'API Integration Sync', dueDate: 'Jun 05, 2026', status: 'TODO', members: ['Charlie'] },
    { id: 'm-3', name: 'Security Audit & Compliance', dueDate: 'Jun 12, 2026', status: 'DONE', members: ['Alice', 'Dave'] }
  ];

  const defaultTeamWorkload = [
    { name: 'Alice Johnson', avatar: 'AJ', role: 'UI/UX Designer', assigned: 8, completed: 6, overdue: 0, hours: 38 },
    { name: 'Bob Smith', avatar: 'BS', role: 'Full Stack Dev', assigned: 12, completed: 8, overdue: 1, hours: 44 },
    { name: 'Charlie Davis', avatar: 'CD', role: 'Backend Engineer', assigned: 6, completed: 5, overdue: 0, hours: 32 },
    { name: 'Dave Miller', avatar: 'DM', role: 'QA Lead', assigned: 4, completed: 4, overdue: 0, hours: 28 }
  ];

  const velocityData = [
    { name: 'Sprint 10', optimistic: 42, realistic: 30, velocity: 35 },
    { name: 'Sprint 11', optimistic: 48, realistic: 34, velocity: 38 },
    { name: 'Sprint 12', optimistic: 55, realistic: 38, velocity: 40 },
    { name: 'Sprint 13', optimistic: 62, realistic: 44, velocity: 45 },
    { name: 'Sprint 14', optimistic: 70, realistic: 48, velocity: 52 },
    { name: 'Sprint 15', optimistic: 75, realistic: 52, velocity: 55 }
  ];

  // Dummy tasks for Widget 1
  const [bentoTasks, setBentoTasks] = useState([
    { id: 't-1', title: 'Design System Bento Layout', completed: false, assignee: 'AJ' },
    { id: 't-2', title: 'Wire up Recharts data feeds', completed: false, assignee: 'BS' },
    { id: 't-3', title: 'Optimize Postgres database indexes', completed: true, assignee: 'CD' },
    { id: 't-4', title: 'Implement JWT Token Auth guards', completed: true, assignee: 'DM' }
  ]);

  const toggleTaskCompletion = (id) => {
    setBentoTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAnnotate = (milestoneName) => {
    toast.success(`Annotating ${milestoneName}...`);
  };

  const handleAnalyze = () => {
    toast.success('Analyzing Sprint Velocity trends...');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Compiling Widgets...</p>
      </div>
    );
  }

  // Calculate live stats
  const totalTasks = data?.totalTasks || 0;
  const doneTasks = data?.tasksByStatus?.DONE || 0;
  const inProgressTasks = data?.tasksByStatus?.IN_PROGRESS || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Dashboard Top welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Welcome back, <span className="text-yellow-400">{user?.name || 'Partner'}</span>
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </h1>
          <p className="text-sm text-gray-400 font-bold mt-1">Here is how your bento workflow stands today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/projects" 
            className="bg-[#262626] border border-white/5 hover:border-orange-500/20 text-[#FDFBF7] py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
          >
            <span>View All Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2x2 Asymmetric Bento-Box Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* WIDGET 1: To-Do & Progress (Top Left) - Spans 7 cols */}
        <section className="lg:col-span-7 bg-[#FDFBF7] text-[#1A1A1A] p-7 rounded-3xl flex flex-col justify-between shadow-xl min-h-[460px]">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500">To-Do & Progress</span>
              <span className="text-sm font-black text-green-600">{completionPercentage}% Completed</span>
            </div>
            
            {/* Progress bar container */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Task Pills */}
          <div className="flex-1 flex flex-col gap-3">
            {bentoTasks.map((t) => {
              const isActive = activeTaskId === t.id;
              
              if (t.completed) {
                // Completed State - Strikethrough, faded background
                return (
                  <div 
                    key={t.id}
                    onClick={() => toggleTaskCompletion(t.id)}
                    className="bg-[#FDFBF7] border border-gray-200/40 opacity-40 hover:opacity-70 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-gray-400 bg-gray-200 flex items-center justify-center text-green-600">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-bold line-through text-gray-500">{t.title}</span>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-black uppercase">
                      {t.assignee}
                    </div>
                  </div>
                );
              }

              // Active / Pending State
              return (
                <div 
                  key={t.id}
                  onClick={() => setActiveTaskId(t.id)}
                  className={`p-4 rounded-2xl flex flex-col cursor-pointer transition-all duration-300 border ${
                    isActive 
                      ? 'bg-yellow-400 border-yellow-500 shadow-md shadow-yellow-500/10' 
                      : 'bg-white hover:bg-gray-50 border-gray-200/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTaskCompletion(t.id)}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-sm font-extrabold tracking-tight">{t.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-[9px] uppercase border ${
                        isActive ? 'bg-[#1A1A1A] text-[#FDFBF7] border-[#1A1A1A]/10' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {t.assignee}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Active View */}
                  {isActive && (
                    <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/10 mt-3 animate-fadeIn">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#1A1A1A]/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        In Review • High Priority
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="bg-[#1A1A1A] hover:bg-[#262626] text-[#FDFBF7] py-1 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all duration-200">
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </section>

        {/* WIDGET 2: Deliverables & Milestones (Top Right) - Spans 5 cols */}
        <section className="lg:col-span-5 bg-orange-500 text-[#FDFBF7] p-7 rounded-3xl flex flex-col justify-between shadow-xl min-h-[460px]">
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest opacity-80">Deliverables & Milestones</span>
              <div className="bg-[#FDFBF7]/10 p-1.5 rounded-lg border border-[#FDFBF7]/10">
                <Zap className="w-4 h-4 text-[#FDFBF7]" />
              </div>
            </div>

            {/* Layered Cards container */}
            <div className="flex flex-col gap-3">
              {defaultMilestones.map((m, idx) => (
                <div 
                  key={m.id}
                  className="bg-white text-[#1A1A1A] p-5 rounded-2xl shadow-lg border border-white/20 relative transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl"
                  style={{
                    transform: `translateY(${idx * 4}px)`,
                    zIndex: 10 + idx
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-extrabold text-sm tracking-tight leading-snug">{m.name}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      m.status === 'DONE' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : m.status === 'IN_PROGRESS' 
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-400 font-bold mb-4">Due on {m.dueDate}</p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex -space-x-1">
                      {m.members.map((mem) => (
                        <div 
                          key={mem} 
                          className="w-6 h-6 rounded-lg bg-orange-500 text-white font-extrabold flex items-center justify-center text-[8px] border-2 border-white uppercase shadow-sm"
                        >
                          {mem[0]}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleAnnotate(m.name)}
                      className="text-[9px] font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 transition-colors duration-200"
                    >
                      + Annotate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WIDGET 3: Team Workload & Stats (Bottom Left) - Spans 7 cols */}
        <section className="lg:col-span-7 bg-[#262626] border border-white/5 p-7 rounded-3xl flex flex-col justify-between shadow-xl min-h-[460px]">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 block mb-6">Team Workload & Stats</span>
            
            {/* Inner top stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-orange-500 tracking-wider">Tasks Done</span>
                <div className="text-2xl font-black text-white mt-1">{doneTasks}</div>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-yellow-500 tracking-wider">In Progress</span>
                <div className="text-2xl font-black text-white mt-1">{inProgressTasks}</div>
              </div>
              <div className="bg-green-600/10 border border-green-600/20 p-4 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-green-500 tracking-wider">Total Tasks</span>
                <div className="text-2xl font-black text-white mt-1">{totalTasks}</div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-extrabold text-gray-400">Filter Overview</span>
              </div>
              <div className="flex gap-2">
                <select 
                  value={sprintFilter} 
                  onChange={(e) => setSprintFilter(e.target.value)}
                  className="bg-[#1A1A1A] text-xs font-bold text-gray-300 border border-white/5 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500/40 cursor-pointer"
                >
                  <option>Last Sprint</option>
                  <option>Active Sprint</option>
                  <option>Overall Board</option>
                </select>
                <select 
                  value={teamFilter} 
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="bg-[#1A1A1A] text-xs font-bold text-gray-300 border border-white/5 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500/40 cursor-pointer"
                >
                  <option>All Teams</option>
                  <option>Engineering</option>
                  <option>Design</option>
                </select>
              </div>
            </div>

            {/* Team Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-2.5">Team Member</th>
                    <th className="py-2.5 text-center">Assigned</th>
                    <th className="py-2.5 text-center">Done</th>
                    <th className="py-2.5 text-center">Overdue</th>
                    <th className="py-2.5 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.tasksPerUser && data.tasksPerUser.length > 0 ? (
                    data.tasksPerUser.map((w) => (
                      <tr key={w.user?.id} className="hover:bg-white/2 transition-colors duration-150 text-xs">
                        <td className="py-3 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-500 font-extrabold flex items-center justify-center text-[10px] uppercase border border-orange-500/10">
                            {getInitials(w.user?.name || 'U')}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#FDFBF7]">{w.user?.name || 'Unknown'}</p>
                            <p className="text-[9px] text-gray-500 font-bold">{w.user?.email || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-3 text-center font-bold text-gray-400">{w.count}</td>
                        <td className="py-3 text-center font-bold text-green-400">-</td>
                        <td className="py-3 text-center font-bold text-red-400">{data?.overdueTasks || 0}</td>
                        <td className="py-3 text-right font-black text-[#FDFBF7]\">-</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-400 text-xs">No team members with assigned tasks</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </section>

        {/* WIDGET 4: Sprint Velocity & Planning (Bottom Right) - Spans 5 cols */}
        <section className="lg:col-span-5 bg-yellow-400 text-[#1A1A1A] p-7 rounded-3xl flex flex-col justify-between shadow-xl min-h-[460px]">
          
          {/* Header layout */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A1A1A]/80">Velocity & Projections</span>
              <button 
                onClick={handleAnalyze}
                className="bg-[#1A1A1A] text-yellow-400 p-2 rounded-xl flex items-center justify-center hover:scale-105 transition-transform duration-200 shadow-md"
                title="Run AI Analysis"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 bg-[#1A1A1A]/10 p-1.5 rounded-2xl w-fit">
              <button 
                onClick={() => setIsRealistic(false)}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                  !isRealistic ? 'bg-[#1A1A1A] text-yellow-400 shadow-sm' : 'text-[#1A1A1A]/70'
                }`}
              >
                Optimistic
              </button>
              <button 
                onClick={() => setIsRealistic(true)}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                  isRealistic ? 'bg-[#1A1A1A] text-yellow-400 shadow-sm' : 'text-[#1A1A1A]/70'
                }`}
              >
                Realistic
              </button>
            </div>
          </div>

          {/* Graph visual content using Recharts */}
          <div className="flex-1 w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={velocityData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#1A1A1A" 
                  fontSize={9} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#1A1A1A" 
                  fontSize={9} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                />
                <RechartsTooltip 
                  contentStyle={{
                    background: '#1A1A1A',
                    color: '#FDFBF7',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'sans-serif'
                  }}
                />
                
                {/* Highlights Sprint 12 & 13 with a dark, pill-shaped overlay */}
                <ReferenceArea 
                  x1="Sprint 12" 
                  x2="Sprint 13" 
                  fill="#1A1A1A" 
                  fillOpacity={0.12} 
                  radius={10}
                />

                {/* Bars - Varying shades of orange and white/transparent */}
                <Bar 
                  dataKey={isRealistic ? 'realistic' : 'optimistic'} 
                  fill="#f97316" 
                  radius={[6, 6, 0, 0]} 
                  barSize={18}
                />
                
                {/* Smooth line */}
                <Line 
                  type="monotone" 
                  dataKey="velocity" 
                  stroke="#1A1A1A" 
                  strokeWidth={2.5} 
                  dot={{ fill: '#1A1A1A', strokeWidth: 1 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Footer note */}
          <div className="border-t border-[#1A1A1A]/10 pt-4 mt-2 flex items-center justify-between text-[10px] font-bold text-[#1A1A1A]/80">
            <span>Sprint 15 is active</span>
            <span className="bg-[#1A1A1A] text-yellow-400 px-2 py-0.5 rounded-full font-black uppercase">Current Week</span>
          </div>

        </section>

      </div>
      
    </div>
  );
}
