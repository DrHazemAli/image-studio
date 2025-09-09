'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FrameIcon,
  Cross2Icon,
  RotateCounterClockwiseIcon,
  ViewHorizontalIcon,
  ViewVerticalIcon,
} from '@radix-ui/react-icons';
import { Button, Slider } from '@radix-ui/themes';
import { FabricImage } from 'fabric';

interface ImageResizeToolProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: FabricImage | null;
  onImageTransform: (transform: {
    scaleX?: number;
    scaleY?: number;
    angle?: number;
    flipX?: boolean;
    flipY?: boolean;
  }) => void;
}

interface PresetSize {
  name: string;
  width: number;
  height: number;
}

const PRESET_SIZES: PresetSize[] = [
  { name: 'Original', width: 0, height: 0 },
  { name: '50%', width: 0.5, height: 0.5 },
  { name: '75%', width: 0.75, height: 0.75 },
  { name: '100%', width: 1, height: 1 },
  { name: '125%', width: 1.25, height: 1.25 },
  { name: '150%', width: 1.5, height: 1.5 },
  { name: '200%', width: 2, height: 2 },
];

export default function ImageResizeTool({
  isOpen,
  onClose,
  selectedImage,
  onImageTransform,
}: ImageResizeToolProps) {
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [angle, setAngle] = useState(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  const handlePresetSelect = useCallback(
    (preset: PresetSize) => {
      if (preset.name === 'Original' && selectedImage) {
        const originalWidth =
          (selectedImage as any).originalWidth || selectedImage.width;
        const originalHeight =
          (selectedImage as any).originalHeight || selectedImage.height;
        const currentWidth = selectedImage.width! * selectedImage.scaleX!;
        const currentHeight = selectedImage.height! * selectedImage.scaleY!;

        setScaleX(originalWidth / currentWidth);
        setScaleY(originalHeight / currentHeight);
      } else {
        setScaleX(preset.width);
        setScaleY(preset.height);
      }
    },
    [selectedImage]
  );

  const handleScaleXChange = useCallback(
    (value: number) => {
      setScaleX(value);
      if (maintainAspectRatio) {
        setScaleY(value);
      }
    },
    [maintainAspectRatio]
  );

  const handleScaleYChange = useCallback(
    (value: number) => {
      setScaleY(value);
      if (maintainAspectRatio) {
        setScaleX(value);
      }
    },
    [maintainAspectRatio]
  );

  const handleApply = useCallback(() => {
    onImageTransform({
      scaleX,
      scaleY,
      angle,
      flipX,
      flipY,
    });
    onClose();
  }, [scaleX, scaleY, angle, flipX, flipY, onImageTransform, onClose]);

  const handleRotate = useCallback((direction: 'left' | 'right') => {
    const rotationAmount = direction === 'left' ? -90 : 90;
    setAngle((prev) => (prev + rotationAmount) % 360);
  }, []);

  const handleFlip = useCallback((axis: 'horizontal' | 'vertical') => {
    if (axis === 'horizontal') {
      setFlipX((prev) => !prev);
    } else {
      setFlipY((prev) => !prev);
    }
  }, []);

  const handleReset = useCallback(() => {
    setScaleX(1);
    setScaleY(1);
    setAngle(0);
    setFlipX(false);
    setFlipY(false);
  }, []);

  if (!selectedImage) return null;

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
                  Resize & Transform
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
            <div className="p-6 space-y-6">
              {/* Current Image Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Image
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    Size:{' '}
                    {Math.round(selectedImage.width! * selectedImage.scaleX!)} ×{' '}
                    {Math.round(selectedImage.height! * selectedImage.scaleY!)}{' '}
                    px
                  </div>
                  <div>
                    Scale: {Math.round(selectedImage.scaleX! * 100)}% ×{' '}
                    {Math.round(selectedImage.scaleY! * 100)}%
                  </div>
                  <div>Rotation: {Math.round(selectedImage.angle || 0)}°</div>
                </div>
              </div>

              {/* Preset Sizes */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick Presets
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className="p-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale Controls */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Scale
                </h3>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="maintainAspectRatio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="maintainAspectRatio"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Maintain aspect ratio
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Width Scale: {Math.round(scaleX * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.01"
                      value={scaleX}
                      onChange={(e) =>
                        handleScaleXChange(parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Height Scale: {Math.round(scaleY * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.01"
                      value={scaleY}
                      onChange={(e) =>
                        handleScaleYChange(parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      disabled={maintainAspectRatio}
                    />
                  </div>
                </div>
              </div>

              {/* Rotation Controls */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rotation
                </h3>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRotate('left')}
                    className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Rotate Left"
                  >
                    <RotateCounterClockwiseIcon className="w-4 h-4" />
                  </button>

                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Angle: {Math.round(angle)}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={angle}
                      onChange={(e) => setAngle(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => handleRotate('right')}
                    className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Rotate Right"
                  >
                    <RotateCounterClockwiseIcon className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>
              </div>

              {/* Flip Controls */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Flip
                </h3>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleFlip('horizontal')}
                    className={`flex-1 p-3 border rounded-lg transition-colors ${
                      flipX
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ViewHorizontalIcon className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs">Horizontal</div>
                  </button>

                  <button
                    onClick={() => handleFlip('vertical')}
                    className={`flex-1 p-3 border rounded-lg transition-colors ${
                      flipY
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ViewVerticalIcon className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs">Vertical</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="soft" color="gray" onClick={handleReset}>
                Reset
              </Button>

              <div className="flex gap-3">
                <Button variant="soft" color="gray" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleApply}>Apply Transform</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
