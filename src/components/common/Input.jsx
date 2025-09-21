import React from 'react';

const Input = ({ label, error, className = '', icon, ...props }) => (
  <label className="block text-sm">
    {label && <div className="mb-2 text-gray-700 dark:text-gray-300 font-medium">{label}</div>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-sm">{icon}</span>
        </div>
      )}
      <input
        className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <div className="mt-2 text-red-500 text-xs font-medium">{error}</div>}
  </label>
);

export default Input;
