import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <TopBar />
        
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Page transition animation can go here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
