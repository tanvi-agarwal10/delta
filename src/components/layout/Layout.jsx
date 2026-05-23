/**
 * LAYOUT COMPONENT - Main App Layout
 * 
 * WHAT IT DOES:
 * =============
 * Wraps the entire app and provides:
 * 1. Sidebar on the left
 * 2. Navbar on top
 * 3. Main content area
 * 
 * This is called a "Layout Component" or "Shell Component".
 * It ensures consistent layout across all pages.
 * 
 * COMPONENT HIERARCHY:
 * App
 * └── Layout
 *     ├── Sidebar
 *     ├── Navbar
 *     └── {children} (page content)
 * 
 * WHY NOT JUST PUT THIS IN APP.JSX?
 * ==================================
 * Separation of concerns:
 * - App.jsx handles routing
 * - Layout.jsx handles layout structure
 * - Each has one responsibility
 * 
 * This makes testing and reusing easier.
 */

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

/**
 * Layout component that wraps all pages
 * 
 * Props:
 * - children: Page content to display in main area
 * 
 * STATE:
 * - sidebarOpen: Whether sidebar is visible on mobile
 */
export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-dark-900 text-gray-100 overflow-hidden">
      {/* Sidebar - Left navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar - Top bar */}
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content - scrollable area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * DESIGN PATTERN EXPLANATION:
 * 
 * This is the "Container/Presenter" pattern:
 * - Container (Layout): Manages state and layout
 * - Presenter (Sidebar, Navbar): Display components that just render
 * 
 * Benefits:
 * 1. Easy to test - can pass different children
 * 2. Reusable - same layout for all pages
 * 3. Maintainable - layout logic in one place
 * 4. Flexible - can swap components easily
 */
