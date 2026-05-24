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

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
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
 * - isOpen: Controls sidebar visibility (on mobile and desktop)
 * - onClose: Callback when sidebar should close/hide
 */
export const Sidebar = ({ isOpen = true, onClose = () => {} }) => {
  const location = useLocation();

  /**
   * RESPONSIVE BEHAVIOR:
   * on desktop/laptop: setting md:-ml-64 pulls the static container left by 
   * its entire width, hiding it and allowing flex main content to fill the screen smoothly.
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
          fixed left-0 top-0 h-full bg-dark-800/80 backdrop-blur-xl border-r border-dark-600
          transition-all duration-300 ease-in-out flex flex-col z-40
          
          /* Width & positioning */
          w-64 md:static md:translate-x-0
          
          /* Toggle visibility: slide out and pull margin on desktop */
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-64'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-dark-600">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="transition-all duration-300 opacity-100">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-accent-500 bg-clip-text text-transparent tracking-tight">
                Nova
              </h1>
              <p className="text-[10px] tracking-wider uppercase text-accent-500/60 font-bold">
                Admin Console
              </p>
            </div>

            {/* Collapse toggle - only show on tablet+ */}
            <button
              onClick={onClose}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-dark-700 border border-dark-600 hover:bg-dark-600 text-txt-secondary hover:text-txt-primary transition-all"
              aria-label="Collapse sidebar"
            >
              <ChevronRight
                size={16}
                className="rotate-180"
              />
            </button>

            {/* Close button - only show on mobile */}
            <button
              onClick={onClose}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-dark-700 text-txt-secondary hover:text-txt-primary transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-6 overflow-y-auto space-y-1.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 mx-3.5 rounded-xl
                  transition-all duration-300 group relative border
                  ${
                    isActive
                      ? 'bg-accent-500/10 border-accent-500/20 text-white font-medium shadow-inner shadow-accent-500/5'
                      : 'hover:bg-dark-700/50 text-txt-secondary hover:text-txt-primary border-transparent'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Icon */}
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors duration-300 ${
                    isActive ? 'text-accent-500' : 'text-txt-secondary group-hover:text-accent-500'
                  }`}
                />

                {/* Label */}
                <span
                  className={`transition-colors duration-300 text-sm ${
                    isActive ? 'text-txt-primary font-medium' : 'text-txt-secondary group-hover:text-txt-primary'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer section */}
        <div
          className="p-4 border-t border-dark-600 flex items-center justify-center"
        >
          <p className="text-[10px] text-gray-500 font-medium text-center">
            NOVADMIN V1.0.0
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
