import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DarkModeToggle from '../common/DarkModeToggle';
import MobileMenu from '../common/MobileMenu';

const Topbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/inventory')) return 'Inventory Management';
    if (path.startsWith('/sales')) return 'Sales Management';
    if (path.startsWith('/accounts/ledger')) return 'Account Ledger';
    if (path.startsWith('/accounts/trial-balance')) return 'Trial Balance';
    if (path.startsWith('/users')) return 'User Management';
    if (path.startsWith('/vendors')) return 'Vendor Management';
    if (path.startsWith('/products')) return 'Product Management';
    if (path.startsWith('/orders')) return 'Purchase Orders';
    if (path.startsWith('/bills')) return 'Vendor Bills';
    if (path.startsWith('/payments')) return 'Payment Management';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Business Management System';
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileMenu />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{getBreadcrumb()}</h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <DarkModeToggle />
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="px-3 md:px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs md:text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
