import React, { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { Button } from './ui/Button';

export default function TopBar() {
  const location = useLocation();
  const { toggleSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Generate breadcrumbs
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const getBreadcrumbName = (path: string) => {
    if (path.length > 20 && path.includes('-')) return '...'; 
    return path.charAt(0).toUpperCase() + path.slice(1);
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
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-500 transition-colors" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search..." 
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-full py-1.5 pl-10 pr-4 text-sm w-48 lg:w-64 focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-zinc-600"
          />
        </div>
        
        <button className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-violet-600 rounded-full border-2 border-[#0a0a0a]"></span>
        </button>
      </div>
    </header>
  );
}
