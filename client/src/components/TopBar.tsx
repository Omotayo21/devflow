import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, X, FolderKanban, CheckSquare, Loader2 } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getWorkspaceActivity } from '../api/activities';
import { searchWorkspace } from '../api/search';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { formatRelativeDate } from '../utils/formatters';
import { Activity } from '../types';
import { PriorityBadge } from './ui/Badge';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, activeWorkspaceId } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { user } = useAuthStore();
  // Search query
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', user?.id, activeWorkspaceId, searchQuery],
    queryFn: () => searchWorkspace(activeWorkspaceId!, searchQuery),
    enabled: !!user?.id && !!activeWorkspaceId && searchQuery.length >= 2,
    staleTime: 1000 * 30,
  });

  // Notifications (recent activity)
  const { data: notifResponse } = useQuery({
    queryKey: ['notifications', user?.id, activeWorkspaceId],
    queryFn: () => getWorkspaceActivity(activeWorkspaceId!, { limit: 10 }),
    enabled: !!user?.id && !!activeWorkspaceId,
  });

  const notifications = (notifResponse as any)?.data?.activities || [];

  // Breadcrumbs
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const getBreadcrumbName = (path: string) => {
    if (path.length > 20 && path.includes('-')) return '...'; 
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length >= 2) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5 text-zinc-400" />
        </Button>

        <nav className="flex items-center text-sm font-medium">
          <Link to="/" className="text-zinc-500 hover:text-zinc-200 transition-colors">
            Home
          </Link>
          {pathnames.map((name, index) => {
            const path = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            
            return (
              <React.Fragment key={path}>
                <span className="mx-2 text-zinc-700">/</span>
                {isLast ? (
                  <span className="text-zinc-100 truncate max-w-[150px]">
                    {getBreadcrumbName(name)}
                  </span>
                ) : (
                  <Link
                    to={path}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors truncate max-w-[150px]"
                  >
                    {getBreadcrumbName(name)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="relative hidden sm:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-500 transition-colors z-10" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => { if (searchQuery.length >= 2) setShowSearch(true); }}
            placeholder={activeWorkspaceId ? "Search tasks & projects..." : "Select a workspace first"} 
            disabled={!activeWorkspaceId}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-full py-1.5 pl-10 pr-4 text-sm w-48 lg:w-64 focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Search Results Dropdown */}
          {showSearch && searchQuery.length >= 2 && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              {searchLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="animate-spin text-violet-500" size={20} />
                </div>
              ) : !searchResults || searchResults.total === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-zinc-500">No results for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.projects.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 border-b border-zinc-800">
                        Projects
                      </div>
                      {searchResults.projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            navigate(`/workspaces/${activeWorkspaceId}`);
                            setShowSearch(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 w-full p-3 hover:bg-zinc-900 text-left transition-colors"
                        >
                          <FolderKanban size={16} className="text-violet-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{p.name}</p>
                            <p className="text-xs text-zinc-600 truncate">{p.description || 'No description'}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 border-b border-zinc-800">
                        Tasks
                      </div>
                      {searchResults.tasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setShowSearch(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 w-full p-3 hover:bg-zinc-900 text-left transition-colors"
                        >
                          <CheckSquare size={16} className="text-blue-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-zinc-200 truncate">{t.title}</p>
                            <p className="text-xs text-zinc-600 truncate">{t.project_name}</p>
                          </div>
                          <PriorityBadge priority={t.priority as any} />
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-all relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-violet-600 rounded-full border-2 border-[#0a0a0a]"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-100">Notifications</h4>
                <button onClick={() => setShowNotifications(false)} className="text-zinc-500 hover:text-zinc-200">
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {!activeWorkspaceId ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-zinc-500 italic">Select a workspace to see notifications.</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-zinc-500 italic">No new notifications.</p>
                  </div>
                ) : (
                  notifications.map((n: Activity) => (
                    <div key={n.id} className="flex items-start gap-3 p-3 hover:bg-zinc-900/50 transition-colors border-b border-zinc-900 last:border-0">
                      <Avatar name={n.user_name} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          <span className="font-semibold text-zinc-100">{n.user_name}</span>{' '}
                          {n.action.replace(/[._]/g, ' ')}
                          {n.metadata?.taskTitle && (
                            <span className="text-violet-400 font-medium"> {n.metadata.taskTitle}</span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-1">{formatRelativeDate(n.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
