import React from 'react';
import TopHeader from '../Navigation/TopHeader';
import BottomTabs from '../Navigation/BottomTabs';
import TopProgressBar from '../Navigation/TopProgressBar';

/**
 * Global Layout for Naksha Redesign
 * Enforces: max-w-7xl, centered (mx-auto), high-end padding, responsive navigation.
 */
export const Layout = ({ children, hideHeader = false }) => {
  return (
    <div className="min-h-screen bg-black text-gray-100 selection:bg-blue-500/30 selection:text-white">
      <TopProgressBar />
      {!hideHeader && <TopHeader />}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:py-12">
        <div className="flex flex-col gap-6 md:gap-12">
          {children}
        </div>
      </main>

      {!hideHeader && <BottomTabs />}
      
      {/* Decorative background depth */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default Layout;
