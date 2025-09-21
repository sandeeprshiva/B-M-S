import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const menu = [
    { to: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'sales', 'accounts', 'purchase'] },
    { to: '/analytics', label: 'Analytics', icon: '📈', roles: ['admin', 'sales', 'accounts'] },
    { to: '/inventory', label: 'Inventory', icon: '📦', roles: ['admin', 'sales', 'purchase'] },
    { to: '/sales', label: 'Sales', icon: '💰', roles: ['admin', 'sales'] },
    { to: '/orders', label: 'Purchase Orders', icon: '📋', roles: ['admin', 'purchase'] },
    { to: '/bills', label: 'Bills', icon: '🧾', roles: ['admin', 'purchase', 'accounts'] },
    { to: '/payments', label: 'Payments', icon: '💳', roles: ['admin', 'accounts'] },
    { to: '/accounts/ledger', label: 'Ledger', icon: '📚', roles: ['admin', 'accounts'] },
    { to: '/accounts/trial-balance', label: 'Trial Balance', icon: '⚖️', roles: ['admin', 'accounts'] },
    { to: '/vendors', label: 'Vendors', icon: '🏢', roles: ['admin', 'purchase', 'accounts'] },
    { to: '/products', label: 'Products', icon: '🏷️', roles: ['admin', 'sales', 'purchase'] },
    { to: '/users', label: 'Users', icon: '👥', roles: ['admin'] },
    { to: '/reports', label: 'Reports', icon: '📄', roles: ['admin', 'accounts', 'sales', 'purchase'] },
    { to: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredMenu = menu.filter(item => user?.role === 'admin' || item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold">
                    BMS
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <nav className="space-y-2">
                {filteredMenu.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                    end={item.to === '/'}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
