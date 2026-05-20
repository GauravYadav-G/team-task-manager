import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { Search, Bell, Sparkles, CalendarDays } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();

  // Get current date string formatted nicely
  const getFormattedDate = () => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex font-sans">
      {/* Navigation Left Sidebar */}
      <Sidebar />

      {/* Main Right Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Section */}
        <header className="bg-[#1A1A1A]/95 backdrop-blur-md sticky top-0 border-b border-white/5 h-18 px-8 flex items-center justify-between z-40 gap-4">
          
          {/* Header title */}
          <div className="hidden md:flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#FDFBF7] uppercase tracking-wider">Workspace</span>
            <span className="text-gray-600 font-bold">/</span>
            <h2 className="font-extrabold text-sm text-yellow-400 uppercase tracking-wider">Default Board</h2>
          </div>

          {/* Search pill: Wide, rounded, central search bar */}
          <div className="flex-1 max-w-xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search tasks, projects, or ask AI..." 
              className="w-full bg-[#262626] border border-white/5 focus:border-orange-500/40 rounded-full py-2.5 pl-11 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            </div>
          </div>

          {/* Right Header actions (Date selector, notification bell, user avatar) */}
          <div className="flex items-center gap-4">
            
            {/* Date display pill */}
            <div className="hidden lg:flex items-center gap-2 bg-[#262626] border border-white/5 py-1.5 px-3.5 rounded-full text-xs font-bold text-gray-300">
              <CalendarDays className="w-3.5 h-3.5 text-orange-500" />
              <span>{getFormattedDate()}</span>
            </div>

            {/* Notification Bell */}
            <button className="p-2.5 rounded-full bg-[#262626] hover:bg-[#323232] text-gray-400 hover:text-white transition-all duration-200 border border-white/5 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2.5 border-l border-white/10 pl-4">
              <div className="w-8 h-8 rounded-full bg-[#FDFBF7] text-[#1A1A1A] font-extrabold flex items-center justify-center text-xs uppercase shadow-md shadow-white/5">
                {getInitials(user?.name || 'User')}
              </div>
              <span className="hidden xl:inline text-xs font-extrabold text-[#FDFBF7]">{user?.name?.split(' ')[0]}</span>
            </div>

          </div>

        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
