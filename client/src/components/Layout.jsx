import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { Search, Bell } from 'lucide-react';

const Header = ({ user }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pt-2 w-full">
    <div className="flex items-center justify-between w-full md:w-auto">
      <h1 className="text-text-primary text-2xl font-black tracking-tight">TaskFlow</h1>
      
      {/* Mobile profile & notifications */}
      <div className="flex md:hidden items-center gap-3">
        <div className="relative cursor-pointer hover:opacity-80 p-1 bg-bg-surface border border-black/5 rounded-xl">
          <Bell className="text-text-secondary h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        </div>
        
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="h-8 w-8 rounded-xl object-cover ring-2 ring-accent-primary/20"
          />
        ) : (
          <div className="h-8 w-8 rounded-xl border border-black/10 flex items-center justify-center bg-accent-primary text-accent-secondary text-xs font-black uppercase shadow-sm">
            {getInitials(user?.name || 'User')}
          </div>
        )}
      </div>
    </div>

    {/* Search Box - Responsive width */}
    <div className="flex-1 w-full md:max-w-md md:mx-8 relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-text-secondary" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-black/5 rounded-full leading-5 bg-bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:bg-white focus:border-accent-primary/50 sm:text-sm transition-all shadow-sm"
        placeholder="Search tasks, projects, or ask AI"
      />
    </div>

    {/* Desktop Notifications and Profile */}
    <div className="hidden md:flex items-center gap-4">
      <div className="relative cursor-pointer hover:opacity-85 p-2 bg-bg-surface border border-black/5 rounded-xl shadow-sm hover:scale-105 transition-all">
        <Bell className="text-text-secondary h-4 w-4" />
        <span className="absolute top-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      </div>

      {user?.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="h-8 w-8 rounded-xl object-cover ring-2 ring-accent-primary/20 hover:scale-105 transition-all shadow-sm"
          title={user.name}
        />
      ) : (
        <div className="h-8 w-8 rounded-xl border border-black/5 flex items-center justify-center bg-accent-primary text-accent-secondary text-xs font-black uppercase shadow-sm hover:scale-105 transition-all cursor-pointer">
          {getInitials(user?.name || 'User')}
        </div>
      )}
    </div>
  </div>
);

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg-main text-text-primary font-sans antialiased selection:bg-accent-primary selection:text-accent-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden p-4 sm:p-6 md:pl-8">
        <Header user={user} />
        <div className="flex-1 overflow-y-auto pb-6 pr-1 custom-scrollbar">
          <Outlet />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.08);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.15);
        }
      `}} />
    </div>
  );
}
