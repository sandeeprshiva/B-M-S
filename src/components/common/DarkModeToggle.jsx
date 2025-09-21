import React, { useEffect, useState } from 'react';

const DarkModeToggle = () => {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [enabled]);

  return (
    <button
      onClick={() => setEnabled((v) => !v)}
      className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
      title="Toggle dark mode"
    >
      {enabled ? 'Dark' : 'Light'}
    </button>
  );
};

export default DarkModeToggle;
