'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas as FabricCanvas, FabricObject, FabricImage } from 'fabric';
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';
import { ImageAdjustments } from '../hooks/use-real-time-preview';

/**
 * Props interface for the ImagePreview component
 */
export interface ImagePreviewProps {
  // Canvas and image
  fabricCanvas: FabricCanvas | null;
  selectedImage: FabricObject | null;

  // Current adjustments to preview
  adjustments: ImageAdjustments;

  // Styling
  className?: string;
  showBeforeAfter?: boolean;
  onToggleBeforeAfter?: () => void;
}

/**
 * Real-time image preview component
 * Shows the selected image with current adjustments applied
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  fabricCanvas,
  selectedImage,
  adjustments,
  className = '',
  showBeforeAfter = true,
  onToggleBeforeAfter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isShowingBefore, setIsShowingBefore] = useState(false);
  const [imageData, setImageData] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);

  /**
   * Convert adjustments to CSS filter string
   */
  const adjustmentsToCSSFilter = useCallback(
    (adj: ImageAdjustments): string => {
      const filters = [];

      // Basic CSS filters
      if (adj.brightness !== 0) {
        filters.push(`brightness(${100 + adj.brightness}%)`);
      }
      if (adj.contrast !== 0) {
        filters.push(`contrast(${100 + adj.contrast}%)`);
      }
      if (adj.saturation !== 0) {
        filters.push(`saturate(${100 + adj.saturation}%)`);
      }
      if (adj.hue !== 0) {
        filters.push(`hue-rotate(${adj.hue}deg)`);
      }
      if (adj.blur > 0) {
        filters.push(`blur(${adj.blur}px)`);
      }
      if (adj.sepia > 0) {
        filters.push(`sepia(${adj.sepia}%)`);
      }
      if (adj.grayscale > 0) {
        filters.push(`grayscale(${adj.grayscale}%)`);
      }
      if (adj.invert) {
        filters.push('invert(100%)');
      }

      // Approximate advanced filters using CSS
      if (adj.temperature !== 0) {
        const tempHue = adj.temperature * 0.3;
        filters.push(`hue-rotate(${tempHue}deg)`);
      }

      if (adj.vibrance !== 0) {
        const vibrantSaturation = 100 + adj.vibrance * 0.5;
        filters.push(`saturate(${vibrantSaturation}%)`);
      }

      if (adj.exposure !== 0) {
        const exposureBrightness = 100 + adj.exposure * 0.5;
        filters.push(`brightness(${exposureBrightness}%)`);
      }

      if (adj.clarity !== 0) {
        const clarityContrast = 100 + adj.clarity * 0.3;
        filters.push(`contrast(${clarityContrast}%)`);
      }

      return filters.join(' ');
    },
    []
  );

  /**
   * Extract image data from selected Fabric object
   */
  const extractImageData = useCallback(() => {
    if (!selectedImage || !(selectedImage instanceof FabricImage)) {
      setImageData(null);
      return;
    }

    try {
      const fabricImage = selectedImage as FabricImage;
      const src = fabricImage.getSrc();

      if (src) {
        // Calculate display size (max 200x200 while maintaining aspect ratio)
        const originalWidth = fabricImage.width || 200;
        const originalHeight = fabricImage.height || 200;
        const maxSize = 200;

        let displayWidth = originalWidth;
        let displayHeight = originalHeight;

        if (originalWidth > originalHeight) {
          if (originalWidth > maxSize) {
            displayWidth = maxSize;
            displayHeight = (originalHeight * maxSize) / originalWidth;
          }
        } else {
          if (originalHeight > maxSize) {
            displayHeight = maxSize;
            displayWidth = (originalWidth * maxSize) / originalHeight;
          }
        }

        setImageData({
          src,
          width: Math.round(displayWidth),
          height: Math.round(displayHeight),
        });
      }
    } catch (error) {
      console.error('Error extracting image data:', error);
      setImageData(null);
    }
  }, [selectedImage]);

  // Update image data when selected image changes
  useEffect(() => {
    extractImageData();
  }, [selectedImage, extractImageData]);

  // Handle before/after toggle
  const handleToggleBeforeAfter = () => {
    setIsShowingBefore(!isShowingBefore);
    onToggleBeforeAfter?.();
  };

  // Don't render if no image data
  if (!imageData) {
    return (
      <div
        className={`flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="w-12 h-12 mx-auto mb-2 opacity-50">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm">Select an image to preview</p>
        </div>
      </div>
    );
  }

  const filterString = isShowingBefore
    ? ''
    : adjustmentsToCSSFilter(adjustments);
  const opacity = isShowingBefore ? 1 : adjustments.opacity / 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with before/after toggle */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview
        </h4>
        {showBeforeAfter && (
          <motion.button
            onClick={handleToggleBeforeAfter}
            className="flex items-center gap-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isShowingBefore ? (
              <>
                <EyeClosedIcon className="w-3 h-3" />
                Before
              </>
            ) : (
              <>
                <EyeOpenIcon className="w-3 h-3" />
                After
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Preview container */}
      <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Checkerboard background for transparency */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #ccc 25%, transparent 25%),
              linear-gradient(-45deg, #ccc 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #ccc 75%),
              linear-gradient(-45deg, transparent 75%, #ccc 75%)
            `,
            backgroundSize: '12px 12px',
            backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
          }}
        />

        {/* Image with filters applied */}
        <div
          className="relative flex items-center justify-center p-6"
          style={{ minHeight: `${Math.max(160, imageData.height + 48)}px` }}
        >
          <motion.img
            src={imageData.src}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded shadow-sm"
            style={{
              width: imageData.width,
              height: imageData.height,
              filter: filterString,
              opacity: opacity,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: opacity, scale: 1 }}
            transition={{ duration: 0.2 }}
          />

          {/* Before/After indicator */}
          <AnimatePresence>
            {isShowingBefore && (
              <motion.div
                className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                Original
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Image info */}
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>
              {imageData.width} × {imageData.height}
            </span>
            {!isShowingBefore && (
              <span className="text-blue-600 dark:text-blue-400">
                {adjustments.opacity}% opacity
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
