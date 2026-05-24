/**
 * NAVBAR COMPONENT - Top Navigation Bar
 * 
 * WHAT IT DOES:
 * =============
 * Shows at the top of the page across all pages.
 * Includes:
 * - Hamburger menu (mobile only)
 * - Dynamic page title based on active route
 * - Fully synchronized global search bar (filters products page)
 * - Real-time React Query fetching sync status (polling indicator)
 * - User profile dropdown with click-outside listener
 */

import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';
import { Bell, Settings, LogOut, Menu, Search, User, RefreshCw } from 'lucide-react';

/**
 * Navbar Component
 * 
 * Props:
 * - onMenuClick: Callback when hamburger menu is clicked
 */
export const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFetching = useIsFetching(); // Active queries indicator

  // Sync state of top-level search bar with URL parameters
  const searchParamVal = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(searchParamVal);

  // Adjust state during render if URL search changes externally (React recommended pattern)
  const [prevSearchParamVal, setPrevSearchParamVal] = useState(searchParamVal);
  if (searchParamVal !== prevSearchParamVal) {
    setSearchValue(searchParamVal);
    setPrevSearchParamVal(searchParamVal);
  }

  // Handle outside click to close user menu dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showUserMenu]);

  // Handle top search submission or changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchValue(query);
    
    // Redirect to products catalog page with the search query prefilled
    if (location.pathname !== '/products') {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      // Update URL parameters directly if already on the products page
      navigate(`/products?search=${encodeURIComponent(query)}`, { replace: true });
    }
  };

  // Determine page title dynamically based on location path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    if (path === '/products') return 'Products Catalog';
    if (path.startsWith('/product/')) return 'Product Details';
    if (path === '/analytics') return 'Business Analytics';
    return 'Dashboard';
  };

  return (
    <nav className="sticky top-0 z-30 bg-dark-900/70 backdrop-blur-xl border-b border-dark-600 h-16">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left section - Hamburger & dynamic page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className={`flex items-center justify-center w-10 h-10 rounded-xl hover:bg-dark-700 border border-transparent active:border-dark-600 transition-colors ${
              isSidebarOpen ? 'md:hidden' : ''
            }`}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-txt-secondary" />
          </button>

          <h2 className="text-lg font-bold text-white tracking-tight font-heading">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right section - Global search, sync indicator, dropdowns */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Global synchronized search bar */}
          <div className="hidden sm:flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-xl px-3.5 py-1.5 focus-within:border-accent-500/40 focus-within:bg-dark-700 transition-all duration-300">
            <Search size={16} className="text-txt-secondary" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchValue}
              onChange={handleSearchChange}
              className="bg-transparent outline-none text-xs text-white placeholder-dark-600 w-32 md:w-56"
              aria-label="Search Catalog"
            />
          </div>

          {/* Pulsing auto-sync active query indicator */}
          {isFetching > 0 ? (
            <div className="flex items-center gap-1.5 bg-accent-500/10 border border-accent-500/20 px-2.5 py-1 rounded-full text-[10px] text-accent-500 font-semibold uppercase tracking-wider animate-pulse select-none">
              <RefreshCw size={10} className="animate-spin text-accent-500" />
              Syncing
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-success/10 border border-success/20 px-2.5 py-1 rounded-full text-[10px] text-success font-semibold uppercase tracking-wider select-none">
              <span className="w-1.5 h-1.5 bg-success rounded-full inline-block shadow-lg shadow-success/50" />
              Live
            </div>
          )}

          {/* Notifications bell dropdown placeholder */}
          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-dark-700 border border-transparent hover:border-dark-600 transition-all duration-200 group"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-txt-secondary group-hover:text-txt-primary transition-colors" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent-500 rounded-full shadow-lg shadow-accent-500/50 animate-pulse" />
          </button>

          {/* Settings button placeholder */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-dark-700 border border-transparent hover:border-dark-600 transition-all duration-200 group"
            aria-label="Settings"
          >
            <Settings size={18} className="text-txt-secondary group-hover:text-txt-primary transition-colors" />
          </button>

          {/* User profile dropdown menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-dark-800 border border-dark-600 hover:bg-dark-700 transition-all duration-200"
              aria-expanded={showUserMenu}
              aria-label="User menu"
            >
              {/* User avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-dark-600 to-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/10 font-bold text-white text-xs select-none">
                T
              </div>

              {/* User info - hide on mobile */}
              <div className="hidden md:block text-left select-none">
                <p className="text-xs font-semibold text-white leading-tight">Tanvi</p>
                <p className="text-[9px] text-accent-500/70 uppercase font-bold leading-none">Admin</p>
              </div>
            </button>

            {/* Dropdown menu modal */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2.5 w-52 bg-dark-800/90 backdrop-blur-xl border border-dark-600 rounded-xl shadow-2xl shadow-black/50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-1">
                {/* User metadata header */}
                <div className="px-4 py-3 border-b border-dark-600 bg-dark-900/20">
                  <p className="text-xs font-bold text-white">Tanvi Agarwal</p>
                  <p className="text-[10px] text-txt-secondary truncate">tanvi@example.com</p>
                </div>

                {/* Dropdown navigation options */}
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2.5 text-xs text-txt-secondary hover:text-white hover:bg-dark-700 transition-colors text-left flex items-center gap-2.5"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={14} className="text-accent-500" />
                    Profile
                  </button>
                  <button
                    className="w-full px-4 py-2.5 text-xs text-txt-secondary hover:text-white hover:bg-dark-700 transition-colors text-left flex items-center gap-2.5"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={14} className="text-accent-500" />
                    Settings
                  </button>
                </div>

                {/* Logout action */}
                <div className="border-t border-dark-600 p-1.5">
                  <button
                    className="w-full px-3 py-2 text-xs text-error hover:text-white hover:bg-error/10 rounded-lg transition-all text-left flex items-center gap-2.5"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <LogOut size={14} />
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
