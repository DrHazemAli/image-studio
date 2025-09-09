"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FrameIcon,
  Cross2Icon,
  CheckIcon,
  ImageIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

interface ResizeCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResizeCanvas: () => void;
  onResizeCanvasAndImage: () => void;
  onDiscard: () => void;
  onKeepCurrentCanvas?: () => void;
  imageWidth: number;
  imageHeight: number;
  currentCanvasWidth: number;
  currentCanvasHeight: number;
}

export default function ResizeCanvasModal({
  isOpen,
  onClose,
  onResizeCanvas,
  onResizeCanvasAndImage,
  onDiscard,
  onKeepCurrentCanvas,
  imageWidth,
  imageHeight,
  currentCanvasWidth,
  currentCanvasHeight,
}: ResizeCanvasModalProps) {
  const handleResizeCanvas = useCallback(() => {
    onResizeCanvas();
    onClose();
  }, [onResizeCanvas, onClose]);

  const handleResizeCanvasAndImage = useCallback(() => {
    onResizeCanvasAndImage();
    onClose();
  }, [onResizeCanvasAndImage, onClose]);

  const handleDiscard = useCallback(() => {
    onDiscard();
    onClose();
  }, [onDiscard, onClose]);

  const handleKeepCurrentCanvas = useCallback(() => {
    if (onKeepCurrentCanvas) {
      onKeepCurrentCanvas();
    }
    onClose();
  }, [onKeepCurrentCanvas, onClose]);

  // Only log when modal is actually open to reduce noise
  if (isOpen) {
    console.log("ResizeCanvasModal render:", {
      isOpen,
      imageWidth,
      imageHeight,
      currentCanvasWidth,
      currentCanvasHeight,
    });
  }

  // Don't render anything if modal is closed
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
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
              The image is smaller than your current canvas size. Choose how
              you&apos;d like to proceed:
            </p>

            {/* Size Comparison */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image Size
                  </div>
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
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Canvas
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentCanvasWidth} × {currentCanvasHeight} px
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <FrameIcon className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Options Explanation */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Available options:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FrameIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Resize Canvas
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-200">
                      Canvas will match image size for full resolution
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <ImageIcon className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">
                      Resize Canvas & Image
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-200">
                      Both canvas and image will be resized to fit
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <FrameIcon className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Keep Current Canvas
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-200">
                      Load image at current size without resizing canvas
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <TrashIcon className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-900 dark:text-red-100">
                      Discard
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-200">
                      Cancel loading and keep current canvas
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleResizeCanvas}
                className="flex items-center justify-center gap-2 w-full"
              >
                <FrameIcon className="w-4 h-4" />
                Resize Canvas
              </Button>

              <Button
                variant="soft"
                color="green"
                onClick={handleResizeCanvasAndImage}
                className="flex items-center justify-center gap-2 w-full"
              >
                <ImageIcon className="w-4 h-4" />
                Resize Canvas & Image
              </Button>

              {onKeepCurrentCanvas && (
                <Button
                  variant="soft"
                  color="purple"
                  onClick={handleKeepCurrentCanvas}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <FrameIcon className="w-4 h-4" />
                  Keep Current Canvas
                </Button>
              )}

              <Button
                variant="soft"
                color="red"
                onClick={handleDiscard}
                className="flex items-center justify-center gap-2 w-full"
              >
                <TrashIcon className="w-4 h-4" />
                Discard
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
