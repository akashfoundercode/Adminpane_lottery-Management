import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            let bgColor = 'bg-white';
            let iconColor = 'text-gray-500';
            let Icon = Info;
            let borderColor = 'border-gray-200';

            switch (toast.type) {
              case 'success':
                bgColor = 'bg-white';
                iconColor = 'text-success-main';
                borderColor = 'border-success-main/20';
                Icon = CheckCircle;
                break;
              case 'warning':
                bgColor = 'bg-white';
                iconColor = 'text-warning-main';
                borderColor = 'border-warning-main/20';
                Icon = AlertTriangle;
                break;
              case 'error':
                bgColor = 'bg-white';
                iconColor = 'text-danger-main';
                borderColor = 'border-danger-main/20';
                Icon = XCircle;
                break;
              case 'info':
                bgColor = 'bg-white';
                iconColor = 'text-info-main';
                borderColor = 'border-info-main/20';
                Icon = Info;
                break;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border ${borderColor} ${bgColor} shadow-lg`}
              >
                <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
                <span className="text-sm font-medium text-text-primary flex-1">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
