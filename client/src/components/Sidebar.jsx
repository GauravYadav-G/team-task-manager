import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  FolderKanban,
  BarChart3,
  Calendar,
  Eye,
  Settings,
  LogOut,
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutGrid, title: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, title: 'Projects' },
    { to: '/analytics', icon: BarChart3, title: 'Analytics' },
    { to: '/calendar', icon: Calendar, title: 'Calendar' },
    { to: '/views', icon: Eye, title: 'Board Views' },
    { to: '/reports', icon: FileText, title: 'Reports' },
  ];

  return (
    <div className="w-full md:w-24 h-16 md:h-[95vh] md:my-[2.5vh] md:ml-4 mac-dock backdrop-blur-xl flex md:flex-col flex-row items-center md:py-8 px-4 md:px-0 shrink-0 fixed bottom-0 md:sticky md:top-[2.5vh] rounded-t-3xl md:rounded-3xl z-20 border border-white/50 transition-all duration-300">
      
      {/* Brand Logo - Hide on mobile */}
      <div 
        className="hidden md:flex mb-8 cursor-pointer transform hover:scale-110 transition-transform p-3 bg-accent-primary rounded-2xl shadow-sm text-accent-secondary items-center justify-center" 
        onClick={() => navigate('/')}
        title="TaskFlow Workspace"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12L10 6L14 10L20 4" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20L10 14L14 18L20 12" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Main Navigation Items - Flex Row on mobile, Flex Col on Desktop */}
      <div className="flex md:flex-col flex-row gap-2 md:gap-5 flex-1 w-full justify-around md:justify-start items-center">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) => `p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 relative group flex items-center justify-center ${
                isActive 
                  ? 'bg-accent-secondary text-white shadow-md shadow-accent-secondary/15 scale-105' 
                  : 'text-text-secondary hover:text-text-primary nav-item-glow hover:scale-108 active:scale-95'
              }`}
              title={item.title}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className="stroke-[2.2] md:w-[20px] md:h-[20px]" />
                  {isActive && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-breath md:block hidden" />
                  )}
                  {/* Premium Floating Tooltip - Hide on mobile */}
                  <div className="hidden md:block absolute left-20 bg-accent-secondary text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-30">
                    {item.title}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Controls - Flex Row on mobile, Flex Col on Desktop */}
      <div className="flex md:flex-col flex-row gap-2 md:gap-4 items-center justify-end md:justify-center md:w-full md:mt-6 md:pt-6 md:border-t border-white/50">
        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) => `p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 relative group flex items-center justify-center ${
            isActive 
              ? 'bg-accent-secondary text-white shadow-md shadow-accent-secondary/15 scale-105' 
              : 'text-text-secondary hover:text-text-primary nav-item-glow hover:scale-108 active:scale-95'
          }`}
          title="Settings"
        >
          {({ isActive }) => (
            <>
              <Settings size={18} className="stroke-[2.2] md:w-[20px] md:h-[20px]" />
              {isActive && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-breath md:block hidden" />
              )}
              <div className="hidden md:block absolute left-20 bg-accent-secondary text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-30">
                Settings
              </div>
            </>
          )}
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2.5 md:p-3 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent cursor-pointer transition-all duration-200 rounded-xl md:rounded-2xl relative group"
          title="Log Out"
        >
          <LogOut size={18} className="stroke-[2.2] md:w-[20px] md:h-[20px]" />
          <div className="hidden md:block absolute left-20 bg-accent-secondary text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl border border-black/5 z-30">
            Log Out
          </div>
        </button>
      </div>
    </div>
  );
}
