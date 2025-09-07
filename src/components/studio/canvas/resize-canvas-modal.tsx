'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FrameIcon, 
  Cross2Icon,
  CheckIcon,
  Cross1Icon
} from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';

interface ResizeCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResize: () => void;
  onKeepCurrent: () => void;
  imageWidth: number;
  imageHeight: number;
  currentCanvasWidth: number;
  currentCanvasHeight: number;
}

export default function ResizeCanvasModal({
  isOpen,
  onClose,
  onResize,
  onKeepCurrent,
  imageWidth,
  imageHeight,
  currentCanvasWidth,
  currentCanvasHeight
}: ResizeCanvasModalProps) {
  const handleResize = () => {
    onResize();
    onClose();
  };

  const handleKeepCurrent = () => {
    onKeepCurrent();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <FrameIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Resize Canvas?
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Cross2Icon className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The image dimensions don't match your current canvas size. Would you like to resize the canvas to fit the image?
              </p>

              {/* Size Comparison */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Image Size</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {imageWidth} × {imageHeight} px
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Canvas</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentCanvasWidth} × {currentCanvasHeight} px
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <FrameIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Benefits of resizing:
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Image will display at full resolution</li>
                  <li>• No scaling or cropping needed</li>
                  <li>• Better editing precision</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="soft"
                color="gray"
                onClick={handleKeepCurrent}
                className="flex items-center gap-2"
              >
                <Cross1Icon className="w-4 h-4" />
                Keep Current Size
              </Button>
              
              <Button
                onClick={handleResize}
                className="flex items-center gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                Resize Canvas
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
