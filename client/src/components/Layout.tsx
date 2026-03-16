import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useUIStore } from '../stores/uiStore';

export default function Layout() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-zinc-100 selection:bg-violet-500/30">
      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" 
          onClick={toggleSidebar}
        />
      )}

      <Sidebar />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <TopBar />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="max-w-full mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

