'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BaseModal = React.memo<BaseModalProps>(
  ({ isOpen, onClose, title, children, icon, size = 'md', className = '' }) => {
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
    };

    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <Dialog.Overlay asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                  />
                </Dialog.Overlay>

                {/* Modal Content */}
                <Dialog.Content asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`fixed left-1/2 top-1/2 z-50 w-full ${sizeClasses[size]} -translate-x-1/2 -translate-y-1/2 ${className}`}
                  >
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          {icon && (
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              {icon}
                            </div>
                          )}
                          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                          </Dialog.Title>
                        </div>
                        <Dialog.Close asChild>
                          <button
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                            aria-label="Close"
                          >
                            <Cross2Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
                          </button>
                        </Dialog.Close>
                      </div>

                      {/* Content */}
                      <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {children}
                      </div>
                    </div>
                  </motion.div>
                </Dialog.Content>
              </>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

BaseModal.displayName = 'BaseModal';
