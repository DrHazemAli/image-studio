'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CanvasInfoProps {
  canvasWidth: number;
  canvasHeight: number;
  containerSize: { width: number; height: number };
  zoom: number;
  imageLoaded: boolean;
  isResizing: boolean;
}

export default function CanvasInfo({
  canvasWidth,
  canvasHeight,
  containerSize,
  zoom,
  imageLoaded,
  isResizing
}: CanvasInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800"
    >
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div className="font-medium text-gray-900 dark:text-white">Canvas Info</div>
        <div>Canvas: {canvasWidth} × {canvasHeight} px</div>
        <div>Zoom: {zoom}%</div>
        {imageLoaded ? (
          <div className="text-green-600 dark:text-green-400">✓ Image loaded</div>
        ) : (
          <div className="text-gray-500">Ready for editing</div>
        )}
        {isResizing && (
          <div className="text-blue-600 dark:text-blue-400">Resizing canvas...</div>
        )}
      </div>
    </motion.div>
  );
}
