import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { Search, Bell, Trash2, Info } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const Header = () => {
  const { user, searchQuery, setSearchQuery } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Click outside listener to close notification drawer
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop = !desktopDropdownRef.current || !desktopDropdownRef.current.contains(event.target);
      const isOutsideMobile = !mobileDropdownRef.current || !mobileDropdownRef.current.contains(event.target);
      if (isOutsideDesktop && isOutsideMobile) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation(); // prevent triggering mark as read
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification cleared');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const NotificationDropdown = () => (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-black/5">
        <div className="text-left">
          <h3 className="font-extrabold text-sm text-text-primary">Notifications</h3>
          <p className="text-[10px] text-text-secondary font-medium">Workspace alerts & completions</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[10px] text-accent-secondary font-bold hover:underline bg-transparent border-0 cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-text-secondary text-xs italic">
            No alerts inside your stream
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkAsRead(n.id)}
              className={`group flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                n.read 
                  ? 'bg-transparent border-transparent hover:bg-black/5' 
                  : 'bg-bg-main border-black/5 hover:border-accent-primary/20'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${n.read ? 'bg-black/5 text-text-secondary' : 'bg-accent-primary/20 text-accent-secondary'}`}>
                <Info className="w-3.5 h-3.5" />
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start gap-1">
                  <h4 className={`text-xs font-bold leading-tight truncate ${n.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[9px] text-text-secondary font-medium shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-[10px] leading-snug mt-1 text-left ${n.read ? 'text-text-secondary/80' : 'text-text-secondary font-medium'}`}>
                  {n.message}
                </p>
              </div>

              <button
                onClick={(e) => handleDeleteNotification(n.id, e)}
                className="p-1 hover:bg-rose-500/10 hover:text-rose-500 text-text-secondary/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                title="Clear notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pt-2 w-full">
      <div className="flex items-center justify-between w-full md:w-auto">
        <h1 className="text-text-primary text-2xl font-black tracking-tight">TaskFlow</h1>
        
        {/* Mobile profile & notifications */}
        <div className="flex md:hidden items-center gap-3 relative" ref={mobileDropdownRef}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer hover:opacity-80 p-1.5 bg-bg-surface border border-black/5 rounded-xl"
          >
            <Bell className="text-text-secondary h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </div>

          {showNotifications && <NotificationDropdown />}
          
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
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-white/50 rounded-full leading-5 bg-white/45 backdrop-blur-md text-text-primary placeholder-text-secondary focus:outline-none focus:bg-white/75 focus:border-accent-primary/60 sm:text-sm transition-all shadow-sm"
          placeholder="Search tasks, projects, or ask AI"
        />
      </div>

      {/* Desktop Notifications and Profile */}
      <div className="hidden md:flex items-center gap-4 relative" ref={desktopDropdownRef}>
        <div 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative cursor-pointer hover:opacity-85 p-2 bg-bg-surface border border-black/5 rounded-xl shadow-sm hover:scale-105 transition-all"
        >
          <Bell className="text-text-secondary h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>

        {showNotifications && <NotificationDropdown />}

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
};

export default function Layout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg-main text-text-primary font-sans antialiased selection:bg-accent-primary selection:text-accent-secondary relative overflow-hidden">
      {/* Decorative premium ambient glow blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-accent-primary/12 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute top-[35%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-secondary/5 blur-[110px] pointer-events-none z-0"></div>

      <div className="flex flex-col md:flex-row flex-1 z-10 w-full relative">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden p-4 sm:p-6 md:pl-8">
          <Header />
          <div className="flex-1 overflow-y-auto pb-6 pr-1 custom-scrollbar">
            <Outlet />
          </div>
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
