import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  LayoutGrid,
  List,
  Search,
  Settings,
  Calendar,
  Eye,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-20 bg-white flex flex-col items-center py-6 shrink-0 h-screen sticky top-0 rounded-l-3xl z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
      <div className="mb-8">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12L10 6L14 10L20 4" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20L10 14L14 18L20 12" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col gap-6 flex-1 w-full items-center">
        <NavLink to="/" className={({isActive}) => isActive ? "p-3 bg-black rounded-xl text-white" : "p-3 text-gray-400 hover:text-black cursor-pointer transition-colors"}>
          <LayoutGrid size={20} />
        </NavLink>
        <NavLink to="/projects" className={({isActive}) => isActive ? "p-3 bg-black rounded-xl text-white" : "p-3 text-gray-400 hover:text-black cursor-pointer transition-colors"}>
          <List size={20} />
        </NavLink>
        <div className="p-3 text-gray-400 hover:text-black cursor-pointer transition-colors" title="Activity">
          <Activity size={20} />
        </div>
        <div className="p-3 text-gray-400 hover:text-black cursor-pointer transition-colors" title="Calendar">
          <Calendar size={20} />
        </div>
        <div className="p-3 text-gray-400 hover:text-black cursor-pointer transition-colors" title="Views">
          <Eye size={20} />
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-4 items-center w-full">
        <div className="p-3 text-gray-400 hover:text-black cursor-pointer bg-gray-100 rounded-xl transition-colors">
          <Settings size={20} />
        </div>
        <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
