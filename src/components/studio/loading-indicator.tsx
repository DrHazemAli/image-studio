'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UpdateIcon, ImageIcon, FrameIcon } from '@radix-ui/react-icons';

interface LoadingIndicatorProps {
  isVisible: boolean;
  message?: string;
  type?: 'canvas' | 'image' | 'general';
}

export default function LoadingIndicator({
  isVisible,
  message,
  type = 'general',
}: LoadingIndicatorProps) {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'canvas':
        return <FrameIcon className="w-6 h-6" />;
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      default:
        return <UpdateIcon className="w-6 h-6" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'canvas':
        return 'Initializing canvas...';
      case 'image':
        return 'Loading image...';
      default:
        return 'Loading...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4"
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-blue-600 dark:text-blue-400"
          >
            {getIcon()}
          </motion.div>

          {/* Loading Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {message || getDefaultMessage()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we prepare everything for you
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
