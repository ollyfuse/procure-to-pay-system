import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Mobile Full-Screen Sidebar */}
        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <Sidebar onClose={closeSidebar} />
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className={`
          hidden lg:block lg:static
          w-64 xl:w-72 transition-transform duration-300 ease-in-out
        `}>
          <Sidebar onClose={closeSidebar} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile: Minimal padding for better content utilization */}
          <div className="sm:hidden px-2 py-4">
            {children}
          </div>
          {/* Desktop: Full padding and container */}
          <div className="hidden sm:block p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
