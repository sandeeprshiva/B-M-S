import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItemClass = ({ isActive }) =>
  `block px-4 py-2 rounded-md transition-colors ${
    isActive
      ? 'bg-primary-600 text-white'
      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800'
  }`;

const Sidebar = () => {
  const { user } = useAuth();

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

  return (
    <aside className="hidden md:block w-64 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800 p-6 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-3">
          BMS
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{user?.name}</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 capitalize bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full mt-1 inline-block">
          {user?.role}
        </div>
      </div>
      <nav className="space-y-2">
        {menu
          .filter(item => user?.role === 'admin' || item.roles.includes(user?.role))
          .map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:transform hover:scale-105'
              }`
            } end={item.to === '/'}>
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
