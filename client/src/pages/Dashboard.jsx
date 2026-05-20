import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Plus, 
  BarChart2, 
  Calendar
} from 'lucide-react';
import api from '../api/axios';
import { getInitials } from '../utils/helpers';
import { toast } from 'react-hot-toast';

const SubHeader = ({ onRefresh }) => {
  const getMonthYear = () => {
    return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex gap-3">
        <button className="flex items-center gap-2 bg-[#252525] text-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-[#333]">
          <Calendar size={16} />
          {getMonthYear()}
          <ChevronDown size={16} />
        </button>
        <button className="flex items-center gap-2 bg-[#252525] text-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-[#333]">
          <BarChart2 size={16} />
          Edit View
          <ChevronDown size={16} />
        </button>
      </div>
      <button onClick={onRefresh} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm">
        <RefreshCw size={16} className="text-gray-600" />
        Refresh
      </button>
    </div>
  );
};

const CheckCard = ({ bentoTasks, toggleTaskCompletion, completionPercentage }) => {
  const pendingTasks = bentoTasks.filter(t => !t.completed);
  const doneTasksItems = bentoTasks.filter(t => t.completed);

  // We highlight the first pending as "Active Item", rest as regular? 
  // For UI consistency with the design, we'll try to show 1 active, and completed ones below.
  const activeTask = pendingTasks.length > 0 ? pendingTasks[0] : null;

  return (
    <div className="bg-[#F6F4EB] rounded-[2rem] p-6 flex flex-col relative overflow-hidden h-full">
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-800 font-semibold">Check</span>
        <div className="flex items-center gap-4 w-1/2">
          <div className="h-2 w-full bg-green-200/50 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{width: `${completionPercentage}%`}}></div>
          </div>
          <span className="text-gray-500 text-sm whitespace-nowrap">{completionPercentage}% complete</span>
        </div>
      </div>

      <div className="space-y-3 flex-1 relative z-10 overflow-y-auto">
        {activeTask && (
          <div className="bg-[#FDE047] rounded-xl p-3 flex justify-between items-center shadow-sm transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div 
                className="w-6 h-6 bg-white rounded-md flex items-center justify-center cursor-pointer border border-yellow-300"
                onClick={() => toggleTaskCompletion(activeTask.id)}
              >
              </div>
              <span className="text-gray-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{activeTask.title}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="bg-white text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">View</button>
              <div className="w-8 h-8 rounded-full border border-yellow-500/30 flex items-center justify-center text-yellow-800 bg-white/50 text-xs font-bold">
                 {activeTask.assignee}
              </div>
            </div>
          </div>
        )}

        {doneTasksItems.map(t => (
          <div key={t.id} className="bg-black/5 rounded-xl p-3 flex justify-between items-center transition-all hover:bg-black/10 cursor-pointer" onClick={() => toggleTaskCompletion(t.id)}>
            <div className="flex items-center gap-3 opacity-80 min-w-0">
              <div className="w-6 h-6 shrink-0 bg-yellow-400 rounded-md flex items-center justify-center text-white">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-gray-700 line-through decoration-gray-400 truncate">{t.title}</span>
            </div>
            <div className="w-7 h-7 shrink-0 rounded-full opacity-80 bg-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-700">
               {t.assignee}
            </div>
          </div>
        ))}
        
        {/* Placeholder if empty */}
        {!activeTask && doneTasksItems.length === 0 && (
          <div className="bg-black/5 rounded-xl p-3 h-12 opacity-50 flex items-center justify-center text-sm text-gray-500">All caught up!</div>
        )}
      </div>
      
      <div className="absolute bottom-0 right-0 left-0 h-10 bg-gradient-to-t from-[#F6F4EB] to-transparent pointer-events-none rounded-b-3xl"></div>
    </div>
  );
};

const ReportCard = ({ milestones }) => {
  const topReport = milestones[0];
  const bottomReport = milestones.length > 1 ? milestones[1] : null;

  return (
    <div className="bg-[#FF7A50] rounded-[2rem] p-6 flex flex-col h-full relative shadow-lg">
      <span className="text-white font-medium mb-6">Deliverables & Milestones</span>
      
      <div className="space-y-4">
        {topReport ? (
          <div className="bg-white rounded-2xl p-4 shadow-xl z-10 relative">
            <div className="flex justify-between items-start mb-4 gap-2">
              <span className="text-gray-900 font-semibold text-lg leading-tight">{topReport.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex -space-x-2">
                   {topReport.members.map((m, i) => (
                     <div key={i} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ring-2 ring-white text-gray-500 text-[9px] font-bold border border-gray-200">
                        {m.substring(0,2).toUpperCase()}
                     </div>
                   ))}
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 whitespace-nowrap">
                  {topReport.status.replace('_', ' ').toLowerCase()} <ChevronDown size={12}/>
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Target: {topReport.dueDate}</span>
              </div>
              <div className="flex items-center gap-3">
                 <button className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 border border-gray-100 transition-colors">
                   <Plus size={14} /> Annotate
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/20 rounded-2xl p-4 text-white text-sm">No milestones found</div>
        )}

        {bottomReport && (
          <div className="bg-[#D1B153] rounded-2xl p-4 shadow-inner relative -mt-8 pt-8 hover:-translate-y-2 transition-transform cursor-pointer">
            <div className="flex justify-between items-start mb-2 gap-2">
              <span className="text-yellow-900 font-semibold truncate block">{bottomReport.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-yellow-800/60 text-xs font-medium px-2 py-1 bg-white/20 rounded-full hidden sm:inline-block">Upcoming</span>
                <span className="bg-white/40 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                   {bottomReport.status.replace('_', ' ').toLowerCase()} <ChevronDown size={12}/>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {bottomReport.members.map((m, i) => (
                    <div key={i} className="w-6 h-6 border-2 border-[#D1B153] bg-yellow-100 flex items-center justify-center rounded-full text-[8px] font-bold text-yellow-800">
                      {m.substring(0,2).toUpperCase()}
                    </div>
                  ))}
                </div>
              <span className="text-yellow-900/70 text-sm">Due: {bottomReport.dueDate}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UnderstandCard = ({ tasksPerUser }) => {
  return (
    <div className="bg-[#1C1F26] rounded-[2rem] p-6 flex flex-col h-full border border-gray-800/50 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-100 font-medium">Understand</span>
        <span className="text-gray-400 text-xs">Workload Overview</span>
      </div>

      <div className="flex gap-4 mb-4 border-b border-gray-800 pb-2 overflow-x-auto hide-scrollbar">
        <button className="flex items-center gap-1 text-gray-300 text-sm hover:text-white whitespace-nowrap">
          Last 12 week <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-1 text-gray-300 text-sm hover:text-white whitespace-nowrap">
          Specific week <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-1 text-gray-300 text-sm hover:text-white whitespace-nowrap">
          Active employee <ChevronDown size={14} />
        </button>
      </div>

      <div className="overflow-x-auto flex-1 h-[200px] custom-scrollbar pr-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase sticky top-0 bg-[#1C1F26] z-10">
            <tr>
              <th className="font-medium pb-3 w-1/3">Employee</th>
              <th className="font-medium pb-3 text-center">Tasks</th>
              <th className="font-medium pb-3 text-right">Email</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {tasksPerUser && tasksPerUser.length > 0 ? (
              tasksPerUser.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-2.5 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                       {getInitials(row.user?.name || 'U')}
                    </div>
                    <span className="font-medium text-gray-200 truncate">{row.user?.name}</span>
                  </td>
                  <td className="py-2.5 text-center font-bold">{row.count}</td>
                  <td className="py-2.5 text-right text-gray-400 truncate max-w-[100px]">{row.user?.email}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="text-center py-4 text-gray-500">No member data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlanCard = ({ velocityData }) => {
  const [isRealistic, setIsRealistic] = useState(false);
  
  // Transform our 6 sprints or dummy into chartData exactly how the html wants it.
  // We'll scale optimistic/realistic and velocity to percentages or raw values
  // Max value across data for scaling:
  const maxVal = Math.max(...velocityData.map(v => Math.max(v.optimistic, v.realistic, v.velocity, 100)));
  
  const chartData = velocityData.map((d, i) => {
     const posVal = isRealistic ? d.realistic : d.optimistic;
     const negVal = Math.abs(posVal - d.velocity); // dummy logic just to draw two bars
     const posPercent = (posVal / maxVal) * 100;
     const negPercent = (negVal / maxVal) * 50; 
     return {
       month: d.name.replace('Sprint ', 'S'),
       pos: posPercent > 10 ? posPercent : 10,
       neg: negPercent > 5 ? negPercent : 5,
       isHighlight: i === velocityData.length - 1 // highlight latest
     };
  });

  return (
    <div className="bg-[#FDE047] rounded-[2rem] p-6 flex flex-col h-full shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 relative z-10 gap-2">
        <span className="text-gray-900 font-medium">Plan</span>
        <div className="bg-yellow-200/50 p-1 rounded-full flex gap-1 backdrop-blur-sm shrink-0">
          <button 
             onClick={() => setIsRealistic(false)}
             className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors shadow-sm ${!isRealistic ? 'bg-white text-gray-900' : 'text-gray-700 hover:bg-yellow-100/50'}`}>
               Optimistic
          </button>
          <button 
             onClick={() => setIsRealistic(true)}
             className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors shadow-sm ${isRealistic ? 'bg-white text-gray-900' : 'text-gray-700 hover:bg-yellow-100/50'}`}>
               Realistic
          </button>
        </div>
      </div>

      <div className="flex-1 relative mt-4">
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-yellow-800/60 font-medium w-12 z-10">
          <span>{maxVal}pt</span>
          <span>{Math.round(maxVal*0.75)}pt</span>
          <span>{Math.round(maxVal*0.5)}pt</span>
          <span>0pt</span>
          <span>Diff</span>
        </div>

        <div className="ml-12 h-full flex items-end justify-between pb-8 relative">
           <div className="absolute left-0 right-0 border-b border-yellow-800/10 z-0" style={{ bottom: '30%' }}></div>
           
           <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
             <path d="M 0 60 Q 15 50 25 55 T 45 40 T 60 70 T 80 30 T 100 20" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round"/>
           </svg>

          {chartData.map((data, idx) => (
            <div key={idx} className="relative flex flex-col items-center flex-1 h-full z-20">
              {data.isHighlight && (
                <div className="absolute -inset-x-1 -top-6 -bottom-2 bg-black rounded-full shadow-xl pointer-events-none z-0"></div>
              )}
              <div className="w-3 relative h-full flex flex-col justify-end z-10" style={{ paddingBottom: '30%'}}>
                 <div className="absolute bottom-[30%] w-full rounded-t-full bg-white transition-all duration-500 ease-in-out" 
                      style={{ height: `${data.pos}%` }}></div>
                 <div className="absolute top-[70%] w-full rounded-b-full bg-[#FF7A50] transition-all duration-500 ease-in-out" 
                      style={{ height: `${data.neg}%` }}></div>
              </div>
              <span className={`absolute -bottom-6 text-[10px] font-medium ${data.isHighlight ? 'text-black font-bold' : 'text-yellow-800/60'} whitespace-nowrap`}>
                {data.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [bentoTasks, setBentoTasks] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const dashRes = await api.get('/dashboard');
      setData(dashRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      toast.error('Unable to fetch live dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data?.recentTasks) {
      setBentoTasks(data.recentTasks.map(t => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        completed: t.status === 'DONE',
        assignee: t.assignedTo ? getInitials(t.assignedTo.name) : 'UN'
      })));
    }
  }, [data]);

  const toggleTaskCompletion = async (id) => {
    setBentoTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      const taskTarget = bentoTasks.find(t => t.id === id);
      const newStatus = taskTarget.completed ? 'TODO' : 'DONE';
      
      if (taskTarget.projectId) {
        await api.put(`/projects/${taskTarget.projectId}/tasks/${id}`, { status: newStatus });
        fetchDashboard();
      }
    } catch (err) {
      console.error('Failed to update task', err);
      toast.error('Failed to update task status');
      setBentoTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Gathering Finsights...</p>
      </div>
    );
  }

  const totalTasks = data?.totalTasks || 0;
  const doneTasks = data?.tasksByStatus?.DONE || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const defaultMilestones = [
    { id: 'm-1', name: 'v2.0 Beta Release', dueDate: 'May 28', status: 'IN_PROGRESS', members: ['Alice', 'Bob'] },
    { id: 'm-2', name: 'API Integration Sync', dueDate: 'Jun 05', status: 'TODO', members: ['Charlie'] }
  ];

  const milestones = data?.upcomingTasks && data.upcomingTasks.length > 0 
    ? data.upcomingTasks.map(t => ({
        id: t.id,
        name: t.title,
        dueDate: new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        status: t.status,
        members: t.assignedTo ? [t.assignedTo.name] : ['Unassigned']
      }))
    : defaultMilestones;

  const defaultVelocityData = [
    { name: 'Sprint 10', optimistic: 42, realistic: 30, velocity: 35 },
    { name: 'Sprint 11', optimistic: 48, realistic: 34, velocity: 38 },
    { name: 'Sprint 12', optimistic: 55, realistic: 38, velocity: 40 },
    { name: 'Sprint 13', optimistic: 62, realistic: 44, velocity: 45 },
    { name: 'Sprint 14', optimistic: 70, realistic: 48, velocity: 52 },
    { name: 'Sprint 15', optimistic: 75, realistic: 52, velocity: 55 }
  ];

  const velocityDataToUse = data?.velocityData && data.velocityData.length > 0
    ? data.velocityData
    : defaultVelocityData;

  const tasksPerUser = data?.tasksPerUser || [];

  return (
    <>
      <SubHeader onRefresh={fetchDashboard} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl">
        <div className="h-[400px]">
          <CheckCard 
            bentoTasks={bentoTasks} 
            toggleTaskCompletion={toggleTaskCompletion} 
            completionPercentage={completionPercentage} 
          />
        </div>
        <div className="h-[400px]">
          <ReportCard milestones={milestones} />
        </div>
        <div className="h-[420px]">
          <UnderstandCard tasksPerUser={tasksPerUser} />
        </div>
        <div className="h-[420px]">
          <PlanCard velocityData={velocityDataToUse} />
        </div>
      </div>
    </>
  );
}
