import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  FolderKanban, 
  UserCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { cn } from '../utils/cn';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workspaces', path: '/workspaces', icon: Layers },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-background-secondary border-r border-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Platform Logo / Workspace Switcher */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">D</div>
            <span>DevFlow</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold mx-auto">D</div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-background-tertiary text-muted hover:text-white lg:flex hidden"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => cn(
              "sidebar-link",
              isActive && "active",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? link.name : undefined}
          >
            <link.icon size={20} />
            {!isCollapsed && <span>{link.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-background-tertiary border border-border flex items-center justify-center font-medium text-brand">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          className={cn(
            "sidebar-link w-full text-red-400 hover:bg-red-400/10 hover:text-red-300",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
