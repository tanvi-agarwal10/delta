/**
 * NAVBAR COMPONENT - Top Navigation Bar
 * 
 * WHAT IT DOES:
 * =============
 * Shows at the top of the page across all pages.
 * Includes:
 * - Hamburger menu (mobile only)
 * - Search functionality (placeholder for now)
 * - User profile menu
 * 
 * WHY SEPARATE NAVBAR AND SIDEBAR?
 * ================================
 * Good separation of concerns:
 * 1. Sidebar = main navigation (which page)
 * 2. Navbar = utilities (search, notifications, user profile)
 * 
 * This makes components simpler and more reusable.
 */

import React, { useState } from 'react';
import { Bell, Settings, LogOut, Menu, Search, User } from 'lucide-react';

/**
 * Navbar Component
 * 
 * Props:
 * - onMenuClick: Callback when hamburger menu is clicked
 */
export const Navbar = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-30 bg-dark-800/80 backdrop-blur-md border-b border-white/10 h-16">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left section - Hamburger on mobile */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu - only show on mobile */}
          <button
            onClick={onMenuClick}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-gray-400" />
          </button>

          {/* Page title - could be dynamic based on current page */}
          <h2 className="text-lg font-semibold text-white hidden sm:block">Dashboard</h2>
        </div>

        {/* Right section - Search, Notifications, Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search bar - hide on small mobile */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 hover:border-white/20 transition-colors">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-white placeholder-gray-500 w-32 md:w-48"
              aria-label="Search"
            />
          </div>

          {/* Notifications bell */}
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors group"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-400 group-hover:text-gray-300" />
            {/* Notification badge */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors group"
            aria-label="Settings"
          >
            <Settings size={20} className="text-gray-400 group-hover:text-gray-300" />
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-expanded={showUserMenu}
              aria-label="User menu"
            >
              {/* User avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                <User size={16} className="text-dark-900" />
              </div>

              {/* User info - hide on small screens */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white">Tanvi</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-700 border border-white/10 rounded-lg shadow-lg overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-medium text-white">Tanvi Agarwal</p>
                  <p className="text-xs text-gray-400">tanvi@example.com</p>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <button
                    className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left flex items-center gap-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left flex items-center gap-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </div>

                {/* Logout button */}
                <div className="border-t border-white/10 p-2">
                  <button
                    className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2"
                    onClick={() => {
                      setShowUserMenu(false);
                      // Add logout logic here
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

/**
 * INTERVIEW QUESTIONS:
 * 
 * Q1: "How do you handle user dropdown state?"
 * A: "I use useState to track whether the dropdown is open.
 *    When user clicks the button, I toggle the state.
 *    This is fine for a single dropdown. For multiple dropdowns,
 *    I'd use a portal library or Context to handle clicks outside."
 * 
 * Q2: "The dropdown closes when clicking outside - how?"
 * A: "Currently it doesn't, but it should! I'd add a useEffect that
 *    listens for clicks outside, or use a library like 'react-use-outside-click'
 *    or 'floating-ui' which handles this automatically."
 * 
 * Q3: "Why hide elements on mobile with CSS instead of removing them?"
 * A: "CSS display: none is better because:
 *    1. Elements remain in DOM, so no layout shift
 *    2. Simpler than conditional rendering
 *    3. Better performance (no remounting)
 *    4. Animations work smoothly"
 * 
 * Q4: "How do you make this responsive?"
 * A: "Tailwind's responsive prefixes. 'hidden sm:flex' means:
 *    - Hidden on mobile (< 640px)
 *    - Flex on small screens and up (640px+)"
 * 
 * TRADEOFFS:
 * - User menu dropdown lacks outside-click handler (to be added)
 * - Search is not functional yet (requires state management)
 * - Settings and Notifications are just placeholders
 * 
 * NEXT IMPROVEMENTS:
 * - Add useEffect with outside-click detection
 * - Connect search to products page
 * - Add actual notifications system
 */
