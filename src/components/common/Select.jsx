import React from 'react';

const Select = ({ label, options = [], className = '', ...props }) => (
  <label className="block text-sm">
    {label && <div className="mb-1 text-gray-700 dark:text-gray-300">{label}</div>}
    <select
      className={`w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </label>
);

export default Select;
