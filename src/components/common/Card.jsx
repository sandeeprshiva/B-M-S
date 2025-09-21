import React from 'react';

const Card = ({ children, className = '', title, subtitle }) => (
  <div className={`bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
    {(title || subtitle) && (
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default Card;
