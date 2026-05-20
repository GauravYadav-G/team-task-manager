import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { Search, Bell } from 'lucide-react';

const Header = ({ user }) => (
  <div className="flex justify-between items-center mb-6 pt-2">
    <h1 className="text-white text-2xl font-bold">TaskFlow</h1>
    <div className="flex-1 max-w-md mx-8 relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border-none rounded-full leading-5 bg-[#252525] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#333] sm:text-sm transition-colors"
        placeholder="Search tasks, projects, or ask AI"
      />
    </div>
    <div className="flex items-center gap-4">
      <div className="relative cursor-pointer hover:opacity-80">
        <Bell className="text-gray-300 h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#111]"></span>
        </span>
      </div>
      <div className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center bg-gray-800 text-white text-xs font-bold uppercase shadow-sm">
        {getInitials(user?.name || 'User')}
      </div>
    </div>
  </div>
);

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#111111] font-sans antialiased selection:bg-yellow-200 selection:text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden p-6 pl-8">
        <Header user={user} />
        <div className="flex-1 overflow-y-auto pb-6 pr-2 custom-scrollbar">
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
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
