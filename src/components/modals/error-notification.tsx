"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExclamationTriangleIcon, Cross2Icon } from "@radix-ui/react-icons";

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
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 right-4 z-60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-red-200 dark:border-red-800 rounded-2xl shadow-2xl max-w-md"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Generation Failed
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {error}
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 group"
                  aria-label="Dismiss error"
                >
                  <Cross2Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

ErrorNotification.displayName = "ErrorNotification";
