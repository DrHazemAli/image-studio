'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cross2Icon, FrameIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';

interface ResizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidth: number;
  currentHeight: number;
  onResize: (width: number, height: number) => void;
}

interface PresetSize {
  name: string;
  width: number;
  height: number;
}

const PRESET_SIZES: PresetSize[] = [
  { name: 'Square (1:1)', width: 512, height: 512 },
  { name: 'Portrait (3:4)', width: 768, height: 1024 },
  { name: 'Landscape (4:3)', width: 1024, height: 768 },
  { name: 'Wide (16:9)', width: 1920, height: 1080 },
  { name: 'Ultra Wide (21:9)', width: 2560, height: 1080 },
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Instagram Portrait', width: 1080, height: 1350 },
  { name: 'Instagram Landscape', width: 1080, height: 608 },
  { name: 'Facebook Cover', width: 1200, height: 630 },
  { name: 'Twitter Header', width: 1500, height: 500 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'LinkedIn Banner', width: 1584, height: 396 },
];

export default function ResizeDialog({
  isOpen,
  onClose,
  currentWidth,
  currentHeight,
  onResize,
}: ResizeDialogProps) {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(currentWidth / currentHeight);

  // Update local state when props change
  useEffect(() => {
    setWidth(currentWidth);
    setHeight(currentHeight);
    setAspectRatio(currentWidth / currentHeight);
  }, [currentWidth, currentHeight]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handlePresetSelect = (preset: PresetSize) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setAspectRatio(preset.width / preset.height);
  };

  const handleResize = () => {
    if (width > 0 && height > 0) {
      onResize(width, height);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleResize();
    } else if (e.key === 'Escape') {
      onClose();
    }
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <FrameIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Resize Canvas
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
            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Current Size Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Canvas Size
                </h3>
                <p className="text-lg font-mono text-gray-900 dark:text-white">
                  {currentWidth} × {currentHeight} pixels
                </p>
              </div>

              {/* Custom Size Inputs */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  New Canvas Size
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) =>
                        handleWidthChange(parseInt(e.target.value) || 0)
                      }
                      onKeyDown={handleKeyDown}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) =>
                        handleHeightChange(parseInt(e.target.value) || 0)
                      }
                      onKeyDown={handleKeyDown}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="10000"
                    />
                  </div>
                </div>

                {/* Aspect Ratio Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="maintainAspectRatio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="maintainAspectRatio"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Maintain aspect ratio
                  </label>
                </div>

                {/* Aspect Ratio Display */}
                {maintainAspectRatio && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Aspect ratio: {aspectRatio.toFixed(3)}:1
                  </div>
                )}
              </div>

              {/* Preset Sizes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Preset Sizes
                </h3>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {preset.width} × {preset.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="soft" color="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleResize}
                disabled={width <= 0 || height <= 0}
              >
                Resize Canvas
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
