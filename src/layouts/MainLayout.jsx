// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Listen for sidebar collapse state from Sidebar component
  useEffect(() => {
    const handleSidebarCollapse = (event) => {
      if (event.detail?.collapsed !== undefined) {
        setIsSidebarCollapsed(event.detail.collapsed);
      }
    };
    
    window.addEventListener('sidebarCollapse', handleSidebarCollapse);
    return () => window.removeEventListener('sidebarCollapse', handleSidebarCollapse);
  }, []);

  // Calculate sidebar width for desktop
  const sidebarMargin = isSidebarCollapsed ? 'ml-20' : 'ml-64';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      {!isMobile && (
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="fixed left-0 top-0 h-full z-30">
            <Sidebar isMobile={false} closeSidebar={closeSidebar} />
          </div>
          
          {/* Main Content Area */}
          <div className={`flex-1 ${sidebarMargin} flex flex-col min-h-screen transition-all duration-300`}>
            <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
            <main className="flex-1">
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex flex-col min-h-screen">
          <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
          
          <div className="flex flex-1 relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                style={{ backdropFilter: 'blur(2px)' }}
                onClick={closeSidebar}
              />
            )}
            
            {/* Mobile Sidebar */}
            <div className={`
              fixed left-0 z-50 transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{ top: '56px', height: 'calc(100% - 56px)' }}>
              <Sidebar isMobile={true} closeSidebar={closeSidebar} />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full">
              <div className="min-h-[calc(100vh-56px)] flex flex-col">
                <div className="flex-1 px-4 py-4">
                  {children}
                </div>
                <Footer />
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;