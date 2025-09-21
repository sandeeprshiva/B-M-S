import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let idSeq = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', timeout = 3000) => {
    const id = idSeq++;
    setToasts((ts) => [...ts, { id, message, type }]);
    if (timeout) setTimeout(() => remove(id), timeout);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded-md shadow border text-sm ${
            t.type === 'error' ? 'bg-red-600 text-white border-red-700' :
            t.type === 'success' ? 'bg-green-600 text-white border-green-700' :
            'bg-gray-800 text-white border-gray-700'
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
