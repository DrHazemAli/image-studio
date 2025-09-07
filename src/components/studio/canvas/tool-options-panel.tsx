'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tool } from '../toolbar';

interface ToolOptionsPanelProps {
  activeTool: Tool;
  brushSize: number;
  brushColor: string;
  onBrushSizeChange: (size: number) => void;
  onBrushColorChange: (color: string) => void;
}

export default function ToolOptionsPanel({
  activeTool,
  brushSize,
  brushColor,
  onBrushSizeChange,
  onBrushColorChange
}: ToolOptionsPanelProps) {
  if (!(activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'text' || activeTool === 'shape')) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800"
    >
      <div className="flex items-center gap-4">
        {activeTool === 'brush' && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-gray-500 w-8">{brushSize}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => onBrushColorChange(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
              />
            </div>
          </>
        )}
        {activeTool === 'eraser' && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</label>
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-gray-500 w-8">{brushSize}</span>
          </div>
        )}
        {activeTool === 'text' && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => onBrushColorChange(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
        )}
        {activeTool === 'shape' && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => onBrushColorChange(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
