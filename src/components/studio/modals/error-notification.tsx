'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, Cross2Icon } from '@radix-ui/react-icons';

interface ErrorNotificationProps {
  error: string | null;
  onDismiss: () => void;
}

export const ErrorNotification = React.memo<ErrorNotificationProps>(
  ({ error, onDismiss }) => {
    const handleDismiss = useCallback(() => {
      onDismiss();
    }, [onDismiss]);

    return (
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-4 right-4 z-60 bg-red-500/90 dark:bg-red-600/90 backdrop-blur-xl text-white p-4 rounded-xl shadow-lg border border-red-400/30 max-w-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-1 bg-red-600 rounded-lg">
                <ExclamationTriangleIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Generation Failed</h4>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-red-600 rounded transition-colors"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

ErrorNotification.displayName = 'ErrorNotification';
