import React from 'react';

const Table = ({ columns = [], data = [], renderActions }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {col.title}
              </th>
            ))}
            {renderActions && <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, index) => (
            <tr key={row.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {renderActions && (
                <td className="px-6 py-4 text-right text-sm">
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-6 py-12 text-center">
                <div className="text-gray-400 dark:text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <div className="text-lg font-medium">No records found</div>
                  <div className="text-sm">Try adjusting your search or add new records</div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
