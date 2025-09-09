'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CropIcon,
  Cross2Icon,
  FrameIcon,
  AspectRatioIcon,
} from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { FabricImage, Rect } from 'fabric';

interface CropToolProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: FabricImage | null;
  onCrop: (cropArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

interface CropPreset {
  name: string;
  ratio: number;
  width: number;
  height: number;
}

const CROP_PRESETS: CropPreset[] = [
  { name: 'Free', ratio: 0, width: 0, height: 0 },
  { name: 'Square (1:1)', ratio: 1, width: 1, height: 1 },
  { name: 'Portrait (3:4)', ratio: 3 / 4, width: 3, height: 4 },
  { name: 'Landscape (4:3)', ratio: 4 / 3, width: 4, height: 3 },
  { name: 'Wide (16:9)', ratio: 16 / 9, width: 16, height: 9 },
  { name: 'Ultra Wide (21:9)', ratio: 21 / 9, width: 21, height: 9 },
  { name: 'Instagram Square', ratio: 1, width: 1, height: 1 },
  { name: 'Instagram Portrait', ratio: 4 / 5, width: 4, height: 5 },
  { name: 'Instagram Landscape', ratio: 1.91, width: 1.91, height: 1 },
  { name: 'Facebook Cover', ratio: 1.91, width: 1.91, height: 1 },
  { name: 'Twitter Header', ratio: 3, width: 3, height: 1 },
  { name: 'YouTube Thumbnail', ratio: 16 / 9, width: 16, height: 9 },
];

export default function CropTool({
  isOpen,
  onClose,
  selectedImage,
  onCrop,
}: CropToolProps) {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedPreset, setSelectedPreset] = useState<CropPreset>(
    CROP_PRESETS[0]
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    crop: { x: 0, y: 0, width: 0, height: 0 },
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize crop area when image is selected
  useEffect(() => {
    if (selectedImage && isOpen) {
      const imageWidth = selectedImage.width! * selectedImage.scaleX!;
      const imageHeight = selectedImage.height! * selectedImage.scaleY!;

      // Set initial crop area to center of image
      const cropWidth = Math.min(imageWidth * 0.8, imageHeight * 0.8);
      const cropHeight = cropWidth;

      setCropArea({
        x: (imageWidth - cropWidth) / 2,
        y: (imageHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      });
    }
  }, [selectedImage, isOpen]);

  const handlePresetSelect = useCallback(
    (preset: CropPreset) => {
      setSelectedPreset(preset);

      if (selectedImage && preset.ratio > 0) {
        const imageWidth = selectedImage.width! * selectedImage.scaleX!;
        const imageHeight = selectedImage.height! * selectedImage.scaleY!;

        let cropWidth, cropHeight;

        if (imageWidth / imageHeight > preset.ratio) {
          // Image is wider than preset ratio
          cropHeight = imageHeight * 0.8;
          cropWidth = cropHeight * preset.ratio;
        } else {
          // Image is taller than preset ratio
          cropWidth = imageWidth * 0.8;
          cropHeight = cropWidth / preset.ratio;
        }

        setCropArea({
          x: (imageWidth - cropWidth) / 2,
          y: (imageHeight - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        });
      }
    },
    [selectedImage]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      setDragHandle(handle);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        crop: { ...cropArea },
      });
    },
    [cropArea]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragHandle) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const newCrop = { ...dragStart.crop };

      switch (dragHandle) {
        case 'move':
          newCrop.x = Math.max(0, dragStart.crop.x + deltaX);
          newCrop.y = Math.max(0, dragStart.crop.y + deltaY);
          break;
        case 'nw':
          newCrop.x = Math.max(0, dragStart.crop.x + deltaX);
          newCrop.y = Math.max(0, dragStart.crop.y + deltaY);
          newCrop.width = Math.max(20, dragStart.crop.width - deltaX);
          newCrop.height = Math.max(20, dragStart.crop.height - deltaY);
          break;
        case 'ne':
          newCrop.y = Math.max(0, dragStart.crop.y + deltaY);
          newCrop.width = Math.max(20, dragStart.crop.width + deltaX);
          newCrop.height = Math.max(20, dragStart.crop.height - deltaY);
          break;
        case 'sw':
          newCrop.x = Math.max(0, dragStart.crop.x + deltaX);
          newCrop.width = Math.max(20, dragStart.crop.width - deltaX);
          newCrop.height = Math.max(20, dragStart.crop.height + deltaY);
          break;
        case 'se':
          newCrop.width = Math.max(20, dragStart.crop.width + deltaX);
          newCrop.height = Math.max(20, dragStart.crop.height + deltaY);
          break;
      }

      // Maintain aspect ratio if preset is selected
      if (selectedPreset.ratio > 0 && dragHandle !== 'move') {
        if (dragHandle.includes('e') || dragHandle.includes('w')) {
          newCrop.height = newCrop.width / selectedPreset.ratio;
        } else {
          newCrop.width = newCrop.height * selectedPreset.ratio;
        }
      }

      setCropArea(newCrop);
    },
    [isDragging, dragHandle, dragStart, selectedPreset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleApplyCrop = useCallback(() => {
    onCrop(cropArea);
    onClose();
  }, [cropArea, onCrop, onClose]);

  const handleReset = useCallback(() => {
    if (selectedImage) {
      const imageWidth = selectedImage.width! * selectedImage.scaleX!;
      const imageHeight = selectedImage.height! * selectedImage.scaleY!;

      setCropArea({
        x: 0,
        y: 0,
        width: imageWidth,
        height: imageHeight,
      });
    }
  }, [selectedImage]);

  if (!selectedImage) return null;

  const imageWidth = selectedImage.width! * selectedImage.scaleX!;
  const imageHeight = selectedImage.height! * selectedImage.scaleY!;

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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <CropIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Crop Image
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Cross2Icon className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex">
              {/* Crop Presets */}
              <div className="w-64 p-6 border-r border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Aspect Ratios
                </h3>

                <div className="space-y-2">
                  {CROP_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        selectedPreset.name === preset.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm">{preset.name}</div>
                      {preset.ratio > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {preset.width}:{preset.height}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Crop Info */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Crop Area
                  </h4>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>
                      Size: {Math.round(cropArea.width)} ×{' '}
                      {Math.round(cropArea.height)} px
                    </div>
                    <div>
                      Position: {Math.round(cropArea.x)},{' '}
                      {Math.round(cropArea.y)}
                    </div>
                    {selectedPreset.ratio > 0 && (
                      <div>
                        Ratio: {selectedPreset.width}:{selectedPreset.height}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Crop Canvas */}
              <div className="flex-1 p-6">
                <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <div
                    className="relative"
                    style={{
                      width: imageWidth,
                      height: imageHeight,
                      maxWidth: '100%',
                      maxHeight: '60vh',
                    }}
                  >
                    {/* Image Preview */}
                    <div
                      className="absolute inset-0 bg-gray-200 dark:bg-gray-800"
                      style={{
                        backgroundImage: `url(${selectedImage.getSrc()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.5)',
                      }}
                    />

                    {/* Crop Overlay */}
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500/10"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        cursor: isDragging ? 'grabbing' : 'grab',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'move')}
                    >
                      {/* Corner Handles */}
                      <div
                        className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize"
                        style={{ top: -6, left: -6 }}
                        onMouseDown={(e) => handleMouseDown(e, 'nw')}
                      />
                      <div
                        className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize"
                        style={{ top: -6, right: -6 }}
                        onMouseDown={(e) => handleMouseDown(e, 'ne')}
                      />
                      <div
                        className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize"
                        style={{ bottom: -6, left: -6 }}
                        onMouseDown={(e) => handleMouseDown(e, 'sw')}
                      />
                      <div
                        className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize"
                        style={{ bottom: -6, right: -6 }}
                        onMouseDown={(e) => handleMouseDown(e, 'se')}
                      />
                    </div>
                  </div>
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
                <Button onClick={handleApplyCrop}>Apply Crop</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
