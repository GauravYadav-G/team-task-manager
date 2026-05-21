import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  LayoutGrid,
  FolderKanban,
  BarChart3,
  Calendar,
  Eye,
  Settings,
  LogOut,
  ChevronDown,
  FileText,
  Users,
  Zap
} from 'lucide-react';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showWorkspace, setShowWorkspace] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-20 bg-white flex flex-col items-center py-6 shrink-0 h-screen sticky top-0 rounded-r-3xl z-10 shadow-lg overflow-y-auto">
      {/* Logo */}
      <div className="mb-8 group cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate('/')}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12L10 6L14 10L20 4" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20L10 14L14 18L20 12" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-4 flex-1 w-full items-center">
        <NavLink 
          to="/" 
          className={({isActive}) => `p-3 rounded-xl transition-all duration-200 ${
            isActive ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer'
          }`}
          title="Dashboard"
        >
          <LayoutGrid size={22} />
        </NavLink>

        <NavLink 
          to="/projects" 
          className={({isActive}) => `p-3 rounded-xl transition-all duration-200 ${
            isActive ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer'
          }`}
          title="Projects"
        >
          <FolderKanban size={22} />
        </NavLink>

        {/* Analytics */}
        <div className="group relative">
          <button className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer transition-all rounded-xl">
            <BarChart3 size={22} />
          </button>
          <div className="absolute left-20 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Analytics
          </div>
        </div>

        {/* Calendar */}
        <div className="group relative">
          <button className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer transition-all rounded-xl">
            <Calendar size={22} />
          </button>
          <div className="absolute left-20 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Calendar
          </div>
        </div>

        {/* Views */}
        <div className="group relative">
          <button className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer transition-all rounded-xl">
            <Eye size={22} />
          </button>
          <div className="absolute left-20 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Board Views
          </div>
        </div>

        {/* Reports */}
        <div className="group relative">
          <button className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer transition-all rounded-xl">
            <FileText size={22} />
          </button>
          <div className="absolute left-20 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Reports
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-3 items-center w-full mt-6 pt-6 border-t border-gray-200">
        {/* Settings */}
        <div className="group relative">
          <button className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer transition-all rounded-xl">
            <Settings size={22} />
          </button>
          <div className="absolute left-20 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Settings
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-all rounded-xl"
          title="Log Out"
        >
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}
