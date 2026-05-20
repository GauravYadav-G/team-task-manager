import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Calendar, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard', end: true },
    { to: '/projects', icon: FolderKanban, label: 'Projects', id: 'nav-projects', end: false },
    { to: '/team', icon: Users, label: 'Team', id: 'nav-team', end: false, isDummy: true },
    { to: '/calendar', icon: Calendar, label: 'Calendar', id: 'nav-calendar', end: false, isDummy: true },
    { to: '/settings', icon: Settings, label: 'Settings', id: 'nav-settings', end: false, isDummy: true }
  ];

  return (
    <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col border-r border-white/5 h-screen sticky top-0 font-sans z-50">
      {/* Brand logo section */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="bg-orange-500 text-[#FDFBF7] p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <FolderKanban className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">TaskFlow</h1>
          <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 mt-1 block">Bento Edition</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.isDummy) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-500 font-bold text-sm cursor-not-allowed hover:bg-[#262626]/50 transition-all duration-200"
                title={`${item.label} (Coming Soon)`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.2} />
                <span>{item.label}</span>
                <span className="ml-auto text-[8px] bg-[#262626] text-gray-400 px-1.5 py-0.5 rounded font-black uppercase">Soon</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              id={item.id}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-extrabold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500 text-[#FDFBF7] shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                }`
              }
            >
              <Icon className="w-5 h-5" strokeWidth={2.2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile / LogOut */}
      <div className="p-4 border-t border-white/5 bg-[#262626]/30 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-[#FDFBF7] font-extrabold flex items-center justify-center border-2 border-[#1A1A1A] shadow-md text-sm uppercase">
            {getInitials(user?.name || 'User')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-white truncate leading-tight">{user?.name}</p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          id="btn-logout"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 font-bold text-xs transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
