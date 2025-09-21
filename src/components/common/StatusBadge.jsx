import React from 'react';

const StatusBadge = ({ status, variant = 'default' }) => {
  const variants = {
    default: {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'inactive': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    },
    payment: {
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'unpaid': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'partial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'overdue': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    },
    stock: {
      'in-stock': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'low-stock': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'out-of-stock': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    }
  };

  const statusKey = status?.toLowerCase().replace(/\s+/g, '-') || 'draft';
  const colorClass = variants[variant]?.[statusKey] || variants.default.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
