"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";

interface CanvasInfoProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  imageLoaded: boolean;
  isResizing: boolean;
}

export default function CanvasInfo({
  canvasWidth,
  canvasHeight,
  zoom,
  imageLoaded,
  isResizing,
}: CanvasInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute right-2 bottom-13 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors ${
          isExpanded ? "w-full justify-between" : "justify-center"
        }`}
      >
        <div className="flex items-center gap-2">
          <InfoCircledIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          {isExpanded && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Canvas Info
            </span>
          )}
        </div>
        {isExpanded && (
          <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>
                Canvas: {canvasWidth} × {canvasHeight} px
              </div>
              <div>Zoom: {zoom}%</div>
              {imageLoaded ? (
                <div className="text-green-600 dark:text-green-400">
                  ✓ Image loaded
                </div>
              ) : (
                <div className="text-gray-500">Ready for editing</div>
              )}
              {isResizing && (
                <div className="text-blue-600 dark:text-blue-400">
                  Resizing canvas...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
