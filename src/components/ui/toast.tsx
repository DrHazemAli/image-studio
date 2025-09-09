'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';

/**
 * Toast Types and Interfaces
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

/**
 * Toast Context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast Provider Component
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

/**
 * Toast Container Component
 */
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Individual Toast Item Component
 */
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          icon: CheckCircledIcon,
          iconColor: 'text-green-500',
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: CrossCircledIcon,
          iconColor: 'text-red-500',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-amber-500',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: InfoCircledIcon,
          iconColor: 'text-blue-500',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
          icon: InfoCircledIcon,
          iconColor: 'text-gray-500',
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`${styles.bg} border rounded-lg shadow-lg backdrop-blur-sm overflow-hidden max-w-sm`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon
            className={`${styles.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`}
          />

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {toast.title}
            </h4>

            {toast.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {toast.description}
              </p>
            )}

            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 -m-1"
          >
            <Cross2Icon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Convenience hooks for different toast types
 */
export const useSuccessToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (title: string, description?: string) => {
      showToast({ type: 'success', title, description });
    },
    [showToast]
  );
};

export const useErrorToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (title: string, description?: string, action?: Toast['action']) => {
      showToast({ type: 'error', title, description, action, duration: 8000 });
    },
    [showToast]
  );
};

export const useWarningToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (title: string, description?: string) => {
      showToast({ type: 'warning', title, description, duration: 6000 });
    },
    [showToast]
  );
};

export const useInfoToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (title: string, description?: string) => {
      showToast({ type: 'info', title, description });
    },
    [showToast]
  );
};
