import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TopBar() {
  const location = useLocation();
  
  // Basic breadcrumb generation
  const pathnames = location.pathname.split('/').filter(x => x);
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : 'Dashboard';

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
        {pathnames.length > 0 && (
          <div className="hidden md:flex items-center text-xs text-muted">
            <span className="mx-2">/</span>
            <span>Home</span>
            {pathnames.map((name, index) => (
              <React.Fragment key={index}>
                <span className="mx-2">/</span>
                <span className={index === pathnames.length - 1 ? 'text-white' : ''}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search tasks, projects..." 
            className="bg-background-tertiary border border-border rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-brand/50 transition-all"
          />
        </div>
        
        <button className="p-2 rounded-lg hover:bg-background-tertiary text-muted hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border-2 border-background-secondary"></span>
        </button>
      </div>
    </header>
  );
}

// Helper to use React.Fragment inside TopBar
import React from 'react';
