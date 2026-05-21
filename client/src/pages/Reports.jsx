import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Award, Activity, CheckSquare } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    try {
      const projRes = await api.get('/projects');
      const projects = projRes.data.projects || [];
      
      const allTasksPromises = projects.map(p => api.get(`/projects/${p.id}/tasks`));
      const taskResponses = await Promise.all(allTasksPromises);
      
      const details = projects.map((p, idx) => {
        const tasks = taskResponses[idx].data.tasks || [];
        const completed = tasks.filter(t => t.status === 'DONE').length;
        const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
        const todo = tasks.filter(t => t.status === 'TODO').length;
        
        return {
          id: p.id,
          name: p.name,
          total: tasks.length,
          completed,
          inProgress,
          todo,
          rate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
          tasks
        };
      });
      
      setReportData(details);
    } catch (err) {
      console.error(err);
      toast.error('Failed to compile reports');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Project Name,Total Tasks,Completed Tasks,In Progress,Todo,Completion Rate (%)\n';
    
    reportData.forEach(p => {
      csvContent += `"${p.name}",${p.total},${p.completed},${p.inProgress},${p.todo},${p.rate}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Workspace_Sprint_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Compiling sprint reports...</p>
      </div>
    );
  }

  // Summary Metrics
  const grandTotalTasks = reportData.reduce((acc, p) => acc + p.total, 0);
  const grandCompletedTasks = reportData.reduce((acc, p) => acc + p.completed, 0);
  const grandInProgressTasks = reportData.reduce((acc, p) => acc + p.inProgress, 0);
  const averageRate = reportData.length > 0 ? Math.round(reportData.reduce((acc, p) => acc + p.rate, 0) / reportData.length) : 0;

  return (
    <div className="space-y-6 font-sans print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="text-yellow-400" /> Workspace Reports
          </h1>
          <p className="text-sm text-gray-400 mt-1">Generate and export sprint completion statistics</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#1C1F26] border border-white/5 hover:border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Printable Heading (Only visible during print) */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">Workspace Sprint Status Report</h1>
        <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Grid: Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#1C1F26] print:bg-gray-100 print:border p-5 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 print:bg-yellow-400/20 flex items-center justify-center text-yellow-400">
            <CheckSquare size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 print:text-gray-500 uppercase tracking-wider block">Total Workload</span>
            <span className="text-xl font-black text-white print:text-black mt-0.5 block">{grandTotalTasks} Tasks</span>
          </div>
        </div>

        <div className="bg-[#1C1F26] print:bg-gray-100 print:border p-5 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 print:bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 print:text-gray-500 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-black text-white print:text-black mt-0.5 block">{grandCompletedTasks} Tasks</span>
          </div>
        </div>

        <div className="bg-[#1C1F26] print:bg-gray-100 print:border p-5 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 print:bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 print:text-gray-500 uppercase tracking-wider block">Sprint Completion</span>
            <span className="text-xl font-black text-white print:text-black mt-0.5 block">{averageRate}% Average</span>
          </div>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-[#1C1F26] print:bg-white print:border border-white/5 rounded-[2.5rem] p-5 sm:p-6 overflow-hidden">
        <h3 className="text-base font-black text-white print:text-black mb-4">Project Velocity Indexes</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 print:border-gray-300 text-gray-400 print:text-gray-600 uppercase font-black tracking-wider">
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4 text-center">Total Tasks</th>
                <th className="py-3 px-4 text-center font-semibold text-emerald-400 print:text-emerald-600">Completed</th>
                <th className="py-3 px-4 text-center text-indigo-400 print:text-indigo-600">In Progress</th>
                <th className="py-3 px-4 text-center text-gray-400 print:text-gray-600">Todo</th>
                <th className="py-3 px-4 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2 print:divide-gray-200">
              {reportData.map((proj, idx) => (
                <tr key={idx} className="hover:bg-black/10 print:hover:bg-transparent text-gray-300 print:text-black font-semibold">
                  <td className="py-3.5 px-4 font-black">{proj.name}</td>
                  <td className="py-3.5 px-4 text-center">{proj.total}</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 print:text-emerald-600 font-bold">{proj.completed}</td>
                  <td className="py-3.5 px-4 text-center text-indigo-400 print:text-indigo-600">{proj.inProgress}</td>
                  <td className="py-3.5 px-4 text-center">{proj.todo}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span>{proj.rate}%</span>
                      {/* Miniature fill indicator */}
                      <div className="w-12 bg-gray-800 print:bg-gray-200 h-1.5 rounded-full overflow-hidden inline-block print:hidden">
                        <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${proj.rate}%` }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {reportData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No projects or tasks exist inside this workspace.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
