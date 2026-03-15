import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronsUpDown,
  Check
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/uiStore';
import { cn } from '../utils/cn';
import { Avatar } from './ui/Avatar';
import { getWorkspaces } from '../api/workspaces';
import { useQuery } from '@tanstack/react-query';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    activeWorkspaceId, 
    setActiveWorkspace 
  } = useUIStore();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const { data: workspacesResponse } = useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces
  });

  const workspaces = (workspacesResponse as any)?.data || [];
  const activeWorkspace = (workspaces as any[]).find((w: any) => w.id === activeWorkspaceId) || workspaces[0];

  useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspace]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workspaces', path: '/workspaces', icon: Building2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside 
      className={cn(
        "relative flex flex-col h-screen bg-[#0a0a0a] border-r border-zinc-800 transition-all duration-300 z-30",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Workspace Switcher */}
      <div className="p-4">
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className={cn(
              "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-900 transition-colors group",
              sidebarCollapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shrink-0 font-bold shadow-lg shadow-violet-500/20">
              {activeWorkspace?.name?.[0] || 'D'}
            </div>
            
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate">
                    {activeWorkspace?.name || 'DevFlow'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate lowercase">
                    {activeWorkspace?.my_role || 'Personal'}
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
              </>
            )}
          </button>

          {showWorkspaceMenu && !sidebarCollapsed && (
            <div className="absolute top-full left-0 w-full mt-2 p-1 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="max-h-60 overflow-y-auto">
                {(workspaces as any[]).map((w: any) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setActiveWorkspace(w.id);
                      setShowWorkspaceMenu(false);
                    }}
                    className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-zinc-900 text-sm text-zinc-300 transition-colors"
                  >
                    <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                      {w.name[0]}
                    </div>
                    <span className="flex-1 text-left truncate">{w.name}</span>
                    {w.id === activeWorkspaceId && <Check className="h-3 w-3 text-violet-500" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-zinc-800 mt-1 pt-1">
                <button 
                  onClick={() => {
                    navigate('/workspaces');
                    setShowWorkspaceMenu(false);
                  }}
                  className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-zinc-900 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-violet-600/10 text-violet-400" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900",
              sidebarCollapsed && "justify-center px-0"
            )}
            title={sidebarCollapsed ? link.name : undefined}
          >
            <link.icon className="h-5 w-5" />
            {!sidebarCollapsed && <span>{link.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-zinc-800">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar name={user?.name} src={user?.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate truncate">{user?.email}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full",
            sidebarCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle (Desktop only) */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-100 shadow-xl hidden lg:flex hover:scale-110 transition-transform"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
