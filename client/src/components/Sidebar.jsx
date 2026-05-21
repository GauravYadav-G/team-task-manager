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
    <div className="w-20 bg-[#161920] flex flex-col items-center py-6 shrink-0 h-screen sticky top-0 rounded-r-3xl z-20 border-r border-white/5 overflow-y-auto shadow-2xl transition-all duration-300">
      {/* Premium Gradient Logo */}
      <div 
        className="mb-8 cursor-pointer transform hover:scale-110 transition-transform p-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-lg shadow-yellow-500/10 flex items-center justify-center" 
        onClick={() => navigate('/')}
        title="Crextio Workspace"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12L10 6L14 10L20 4" stroke="black" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20L10 14L14 18L20 12" stroke="black" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Main Navigation Items */}
      <div className="flex flex-col gap-5 flex-1 w-full items-center">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) => `p-3 rounded-2xl transition-all duration-300 relative group flex items-center justify-center ${
                isActive 
                  ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/25 scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.title}
            >
              <Icon size={20} className="stroke-[2.2]" />
              
              {/* Premium Floating Tooltip */}
              <div className="absolute left-20 bg-black/90 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl border border-white/10 z-30">
                {item.title}
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-4 items-center w-full mt-6 pt-6 border-t border-white/5">
        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) => `p-3 rounded-2xl transition-all duration-300 relative group flex items-center justify-center ${
            isActive 
              ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/25 scale-105' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Settings"
        >
          <Settings size={20} className="stroke-[2.2]" />
          <div className="absolute left-20 bg-black/90 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl border border-white/10 z-30">
            Settings
          </div>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-3 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all duration-300 rounded-2xl relative group"
          title="Log Out"
        >
          <LogOut size={20} className="stroke-[2.2]" />
          <div className="absolute left-20 bg-black/90 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl border border-white/10 z-30">
            Log Out
          </div>
        </button>
      </div>
    </div>
  );
}
