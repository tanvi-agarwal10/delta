/**
 * SIDEBAR COMPONENT - Main Navigation
 * 
 * WHAT IT DOES:
 * =============
 * This is the vertical navigation menu on the left side of the app.
 * It shows different pages (Dashboard, Products, Analytics) and provides
 * navigation between them.
 * 
 * WHY THIS ARCHITECTURE?
 * ======================
 * Separating layout components makes code:
 * 1. Reusable - same sidebar used on all pages
 * 2. Maintainable - change navigation in one place
 * 3. Testable - can test sidebar independently
 * 4. Flexible - can collapse/expand independently
 * 
 * RESPONSIVE DESIGN STRATEGY:
 * - Desktop: Always visible sidebar
 * - Tablet: Collapsible sidebar (click icon to toggle)
 * - Mobile: Hidden by default, accessible via hamburger menu
 * 
 * INTERVIEW PERSPECTIVE:
 * "I created a responsive sidebar that adapts to different screen sizes.
 *  On mobile, it's hidden by default. On tablet, it can collapse/expand.
 *  On desktop, it's always visible. This improves UX across all devices."
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

/**
 * Navigation menu items
 * Each item has:
 * - label: Display name
 * - path: URL to navigate to
 * - icon: Lucide icon component
 * 
 * WHY SEPARATE THIS?
 * It's data. Separating data from JSX makes it:
 * - Easy to update
 * - Easy to add i18n (internationalization) later
 * - Easy to fetch from config/API if needed
 */
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    path: '/products',
    icon: ShoppingCart,
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
];

/**
 * Sidebar Navigation Component
 * 
 * Props:
 * - isOpen: Controls sidebar visibility on mobile (optional)
 * - onClose: Callback when sidebar should close (optional)
 * 
 * STATE:
 * - isCollapsed: Whether sidebar is in collapsed state on tablet
 *   Desktop: always false (sidebar always visible)
 *   Tablet: can toggle between true/false
 *   Mobile: always true (hidden, but state doesn't matter due to modal overlay)
 */
export const Sidebar = ({ isOpen = true, onClose = () => {} }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  /**
   * RESPONSIVE BEHAVIOR:
   * hidden: On mobile (< 640px), sidebar is hidden by default
   * md:translate-x-0: On tablet+ (640px), sidebar is always visible
   * 
   * WHY THIS APPROACH?
   * CSS-based responsiveness is more performant than JavaScript.
   * We use CSS media queries and Tailwind's responsive prefixes.
   */
  return (
    <>
      {/* Mobile overlay - closes sidebar when clicked */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-dark-800 border-r border-white/10
          transition-all duration-300 ease-in-out
          
          /* Mobile: slide in/out from left */
          w-64 md:w-64 md:translate-x-0 md:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isOpen ? 'z-40 md:z-auto' : 'md:z-auto'}
          
          /* Collapsed state on tablet+ */
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {/* Logo/Brand - hide when collapsed */}
            <div className={`transition-all duration-300 ${isCollapsed ? 'md:hidden' : ''}`}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Nova
              </h1>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>

            {/* Collapse toggle - only show on tablet+ */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronRight
                size={20}
                className={`transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Close button - only show on mobile */}
            <button
              onClick={onClose}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose} // Close sidebar on mobile after navigation
                className={`
                  flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                  transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Icon */}
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />

                {/* Label - hide when collapsed */}
                {!isCollapsed && (
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active indicator dot - show when collapsed */}
                {isCollapsed && isActive && (
                  <div className="absolute left-2 w-1 h-6 bg-indigo-400 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer section */}
        <div
          className="p-4 border-t border-white/10"
          title={isCollapsed ? 'App version 1.0' : ''}
        >
          <p className={`text-xs text-gray-500 ${isCollapsed ? 'hidden' : 'text-center'}`}>
            v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};

/**
 * INTERVIEW QUESTIONS FOR THIS COMPONENT:
 * 
 * Q1: "How do you make navigation responsive?"
 * A: "I use Tailwind's responsive breakpoints (md:, lg:, etc.) to show/hide
 *    elements based on screen size. On mobile, the sidebar is hidden by default
 *    and slides in with a hamburger menu. On desktop, it's always visible."
 * 
 * Q2: "How do you know which nav item is active?"
 * A: "I use React Router's useLocation hook to get the current pathname,
 *    then compare it with each navigation item's path. The active item
 *    gets highlighted styling."
 * 
 * Q3: "Why close the sidebar after navigation on mobile?"
 * A: "UX improvement. After selecting a page, closing the sidebar shows
 *    more content space on small screens. It's the behavior users expect."
 * 
 * Q4: "What about accessibility?"
 * A: "I use semantic HTML (nav, aside), proper labels for buttons,
 *    aria-current for active link, and aria-hidden for decorative elements.
 *    This helps screen readers understand the structure."
 * 
 * TRADEOFFS:
 * - More complex than a simple navbar (worth it for better UX)
 * - More CSS classes (but Tailwind makes it manageable)
 * - Passing callbacks to children (could use Context, but overkill for this)
 */
