// Role-based redirect utility
export const getRoleBasedRedirect = (userRole) => {
  const roleRedirects = {
    admin: '/',                    // Admin Dashboard - full overview
    sales: '/sales',               // Sales Dashboard - sales focused
    accounts: '/accounts/ledger',  // Accounts Ledger - financial focus
    purchase: '/orders',           // Purchase Orders - procurement focus
  };

  return roleRedirects[userRole] || '/'; // Default to main dashboard
};

// Role-specific landing pages with descriptions
export const roleDescriptions = {
  admin: {
    title: 'Admin Dashboard',
    description: 'Complete system overview with all modules access',
    primaryActions: ['User Management', 'System Settings', 'All Reports']
  },
  sales: {
    title: 'Sales Dashboard', 
    description: 'Sales performance, inventory, and customer management',
    primaryActions: ['Sales Orders', 'Inventory Management', 'Sales Analytics']
  },
  accounts: {
    title: 'Accounts Dashboard',
    description: 'Financial management, ledgers, and accounting reports', 
    primaryActions: ['Account Ledger', 'Trial Balance', 'Financial Reports']
  },
  purchase: {
    title: 'Purchase Dashboard',
    description: 'Procurement, vendor management, and purchase orders',
    primaryActions: ['Purchase Orders', 'Vendor Management', 'Inventory Tracking']
  }
};

// Check if user has access to a specific route based on role
export const hasRouteAccess = (userRole, route) => {
  const rolePermissions = {
    admin: ['*'], // Admin has access to everything
    sales: [
      '/', '/sales', '/inventory', '/products', '/analytics', '/reports'
    ],
    accounts: [
      '/', '/accounts/ledger', '/accounts/trial-balance', '/bills', '/orders',
      '/payments', '/reports', '/analytics', '/vendors'
    ],
    purchase: [
      '/', '/orders', '/vendors', '/products', '/inventory', '/bills', '/reports'
    ]
  };

  const permissions = rolePermissions[userRole] || [];
  
  // Admin has access to everything
  if (permissions.includes('*')) return true;
  
  // Check if route is in allowed permissions
  return permissions.some(permission => 
    route === permission || route.startsWith(permission + '/')
  );
};
