'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas as FabricCanvas, FabricObject } from 'fabric';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Button } from '@radix-ui/themes';
import {
  MixerHorizontalIcon,
  SunIcon,
  MoonIcon,
  ColorWheelIcon,
  EyeClosedIcon,
  ShadowIcon,
  ResetIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagicWandIcon,
} from '@radix-ui/react-icons';

// Import our components
import { SlidingPanel } from './sliding-panel';
import { AdjustmentSlider } from '../controls/adjustment-slider';
import { ImagePreview } from '../controls/image-preview';
import {
  useRealTimePreview,
  ImageAdjustments,
  DEFAULT_ADJUSTMENTS,
} from '../hooks/use-real-time-preview';

/**
 * Props interface for the ImageFiltersPanel component
 */
export interface ImageFiltersPanelProps {
  // Panel state
  isOpen: boolean;
  onClose: () => void;

  // Canvas integration
  fabricCanvas: FabricCanvas | null;
  selectedImage: FabricObject | null;

  // Callbacks
  onApplyFilters?: (adjustments: ImageAdjustments) => void;
  onResetFilters?: () => void;
}

/**
 * Filter preset interface
 */
interface FilterPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  adjustments: Partial<ImageAdjustments>;
  color: string;
}

/**
 * Predefined filter presets
 */
const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'original',
    name: 'Original',
    icon: <ColorWheelIcon className="w-4 h-4" />,
    description: 'No filters applied',
    adjustments: DEFAULT_ADJUSTMENTS,
    color: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    id: 'bright',
    name: 'Bright',
    icon: <SunIcon className="w-4 h-4" />,
    description: 'Increase brightness and contrast',
    adjustments: {
      brightness: 20,
      contrast: 15,
      saturation: 10,
    },
    color: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    icon: <MoonIcon className="w-4 h-4" />,
    description: 'High contrast with deep shadows',
    adjustments: {
      brightness: -10,
      contrast: 35,
      saturation: -5,
      clarity: 25,
    },
    color: 'bg-purple-100 dark:bg-purple-900/20',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: <ShadowIcon className="w-4 h-4" />,
    description: 'Warm, nostalgic sepia tones',
    adjustments: {
      sepia: 40,
      contrast: 10,
      brightness: -5,
      saturation: -25,
      temperature: 15,
    },
    color: 'bg-amber-100 dark:bg-amber-900/20',
  },
  {
    id: 'blackwhite',
    name: 'B&W',
    icon: <EyeClosedIcon className="w-4 h-4" />,
    description: 'High contrast black and white',
    adjustments: {
      grayscale: 100,
      contrast: 25,
      brightness: 5,
    },
    color: 'bg-slate-100 dark:bg-slate-800',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: <MagicWandIcon className="w-4 h-4" />,
    description: 'Film-like color grading',
    adjustments: {
      contrast: 20,
      saturation: -10,
      temperature: -10,
      vignette: 25,
      clarity: 15,
    },
    color: 'bg-blue-100 dark:bg-blue-900/20',
  },
];

/**
 * Image Filters Panel Component
 * Provides filter presets and manual adjustments in a Canva-style sliding interface
 */
export const ImageFiltersPanel: React.FC<ImageFiltersPanelProps> = ({
  isOpen,
  onClose,
  fabricCanvas,
  selectedImage,
  onApplyFilters,
  onResetFilters,
}) => {
  // State
  const [selectedPreset, setSelectedPreset] = useState<string>('original');
  const [currentAdjustments, setCurrentAdjustments] =
    useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic'])
  );

  // Real-time preview hook
  const {
    isProcessing,
    applyAdjustments,
    resetAdjustments,
    getCurrentAdjustments,
  } = useRealTimePreview(fabricCanvas, selectedImage, {
    debounceMs: 16, // 60fps
    showProcessingIndicator: true,
    onError: (error) => console.error('Preview error:', error),
  });

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (preset: FilterPreset) => {
      setSelectedPreset(preset.id);
      const newAdjustments = { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments };
      setCurrentAdjustments(newAdjustments);
      applyAdjustments(newAdjustments, false);
    },
    [applyAdjustments]
  );

  // Handle individual adjustment changes
  const handleAdjustmentChange = useCallback(
    (key: keyof ImageAdjustments, value: number | boolean) => {
      const newAdjustments = { ...currentAdjustments, [key]: value };
      setCurrentAdjustments(newAdjustments);
      applyAdjustments(newAdjustments, false);

      // Clear preset selection if manually adjusting
      if (selectedPreset !== 'original') {
        setSelectedPreset('custom');
      }
    },
    [currentAdjustments, applyAdjustments, selectedPreset]
  );

  // Handle section expand/collapse
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Handle reset all
  const handleResetAll = useCallback(() => {
    setSelectedPreset('original');
    setCurrentAdjustments(DEFAULT_ADJUSTMENTS);
    resetAdjustments();
    onResetFilters?.();
  }, [resetAdjustments, onResetFilters]);

  // Handle apply and close
  const handleApply = useCallback(() => {
    onApplyFilters?.(currentAdjustments);
    onClose();
  }, [currentAdjustments, onApplyFilters, onClose]);

  // Handle cancel - reset adjustments and close
  const handleCancel = useCallback(() => {
    resetAdjustments();
    onClose();
  }, [resetAdjustments, onClose]);

  // Don't automatically reset on close - let user decide
  // Reset adjustments when panel closes (but not on initial mount)
  // const hasOpenedRef = useRef(false);
  // useEffect(() => {
  //   if (isOpen) {
  //     hasOpenedRef.current = true;
  //   } else if (hasOpenedRef.current) {
  //     // Only reset if the panel was previously opened and is now closing
  //     resetAdjustments();
  //   }
  // }, [isOpen, resetAdjustments]);

  // Footer actions
  const footerActions = (
    <div className="flex gap-3">
      <Button
        variant="soft"
        color="gray"
        onClick={handleResetAll}
        disabled={isProcessing}
      >
        <ResetIcon className="w-4 h-4 mr-2" />
        Reset All
      </Button>
      <Button
        variant="soft"
        color="gray"
        onClick={handleCancel}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button onClick={handleApply} disabled={isProcessing} className="flex-1">
        Apply Filters
      </Button>
    </div>
  );

  return (
    <SlidingPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Image Filters"
      icon={
        <MixerHorizontalIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      }
      width="xl"
      actions={footerActions}
      className="text-sm"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="col-span-2 space-y-6">
          {/* Filter Presets */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Quick Filters
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FILTER_PRESETS.map((preset) => (
                <motion.button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`
                  p-3 rounded-xl border-2 transition-all text-left
                  ${
                    selectedPreset === preset.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                  ${preset.color}
                `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {preset.icon}
                    <span className="font-medium text-sm">{preset.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {preset.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Manual Adjustments */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Manual Adjustments
            </h3>

            {/* Basic Adjustments Section */}
            <Collapsible.Root
              open={expandedSections.has('basic')}
              onOpenChange={() => toggleSection('basic')}
            >
              <Collapsible.Trigger asChild>
                <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Basic
                  </span>
                  {expandedSections.has('basic') ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </Collapsible.Trigger>
              <AnimatePresence>
                {expandedSections.has('basic') && (
                  <Collapsible.Content asChild forceMount>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        <AdjustmentSlider
                          label="Brightness"
                          value={currentAdjustments.brightness}
                          onChange={(value) =>
                            handleAdjustmentChange('brightness', value)
                          }
                          min={-100}
                          max={100}
                          defaultValue={0}
                          unit="%"
                          color="orange"
                          description="Adjust overall lightness"
                        />
                        <AdjustmentSlider
                          label="Contrast"
                          value={currentAdjustments.contrast}
                          onChange={(value) =>
                            handleAdjustmentChange('contrast', value)
                          }
                          min={-100}
                          max={100}
                          defaultValue={0}
                          unit="%"
                          color="blue"
                          description="Adjust difference between light and dark areas"
                        />
                        <AdjustmentSlider
                          label="Saturation"
                          value={currentAdjustments.saturation}
                          onChange={(value) =>
                            handleAdjustmentChange('saturation', value)
                          }
                          min={-100}
                          max={100}
                          defaultValue={0}
                          unit="%"
                          color="green"
                          description="Adjust color intensity"
                        />
                      </div>
                    </motion.div>
                  </Collapsible.Content>
                )}
              </AnimatePresence>
            </Collapsible.Root>

            {/* Color Section */}
            <Collapsible.Root
              open={expandedSections.has('color')}
              onOpenChange={() => toggleSection('color')}
            >
              <Collapsible.Trigger asChild>
                <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Color
                  </span>
                  {expandedSections.has('color') ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </Collapsible.Trigger>
              <AnimatePresence>
                {expandedSections.has('color') && (
                  <Collapsible.Content asChild forceMount>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        <AdjustmentSlider
                          label="Hue"
                          value={currentAdjustments.hue}
                          onChange={(value) =>
                            handleAdjustmentChange('hue', value)
                          }
                          min={-180}
                          max={180}
                          defaultValue={0}
                          unit="°"
                          color="purple"
                          description="Shift color spectrum"
                        />
                        <AdjustmentSlider
                          label="Temperature"
                          value={currentAdjustments.temperature}
                          onChange={(value) =>
                            handleAdjustmentChange('temperature', value)
                          }
                          min={-100}
                          max={100}
                          defaultValue={0}
                          unit=""
                          color="orange"
                          description="Adjust warm/cool tones"
                          marks={[
                            { value: -100, label: 'Cool' },
                            { value: 0, label: 'Neutral' },
                            { value: 100, label: 'Warm' },
                          ]}
                        />
                        <AdjustmentSlider
                          label="Vibrance"
                          value={currentAdjustments.vibrance}
                          onChange={(value) =>
                            handleAdjustmentChange('vibrance', value)
                          }
                          min={-100}
                          max={100}
                          defaultValue={0}
                          unit="%"
                          color="red"
                          description="Smart saturation that protects skin tones"
                        />
                      </div>
                    </motion.div>
                  </Collapsible.Content>
                )}
              </AnimatePresence>
            </Collapsible.Root>

            {/* Effects Section */}
            <Collapsible.Root
              open={expandedSections.has('effects')}
              onOpenChange={() => toggleSection('effects')}
            >
              <Collapsible.Trigger asChild>
                <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Effects
                  </span>
                  {expandedSections.has('effects') ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </Collapsible.Trigger>
              <AnimatePresence>
                {expandedSections.has('effects') && (
                  <Collapsible.Content asChild forceMount>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        <AdjustmentSlider
                          label="Blur"
                          value={currentAdjustments.blur}
                          onChange={(value) =>
                            handleAdjustmentChange('blur', value)
                          }
                          min={0}
                          max={20}
                          defaultValue={0}
                          unit="px"
                          color="blue"
                          description="Apply blur effect"
                        />
                        <AdjustmentSlider
                          label="Sepia"
                          value={currentAdjustments.sepia}
                          onChange={(value) =>
                            handleAdjustmentChange('sepia', value)
                          }
                          min={0}
                          max={100}
                          defaultValue={0}
                          unit="%"
                          color="orange"
                          description="Apply sepia tone effect"
                        />
                        <AdjustmentSlider
                          label="Grayscale"
                          value={currentAdjustments.grayscale}
                          onChange={(value) =>
                            handleAdjustmentChange('grayscale', value)
                          }
                          min={0}
                          max={100}
                          defaultValue={0}
                          unit="%"
                          color="gray"
                          description="Convert to grayscale"
                        />
                        <AdjustmentSlider
                          label="Vignette"
                          value={currentAdjustments.vignette}
                          onChange={(value) =>
                            handleAdjustmentChange('vignette', value)
                          }
                          min={0}
                          max={100}
                          defaultValue={0}
                          unit="%"
                          color="purple"
                          description="Add dark edges effect"
                        />
                        <AdjustmentSlider
                          label="Opacity"
                          value={currentAdjustments.opacity}
                          onChange={(value) =>
                            handleAdjustmentChange('opacity', value)
                          }
                          min={0}
                          max={100}
                          defaultValue={100}
                          unit="%"
                          color="blue"
                          description="Adjust transparency"
                        />
                      </div>
                    </motion.div>
                  </Collapsible.Content>
                )}
              </AnimatePresence>
            </Collapsible.Root>
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            </div>
          )}
        </div>

        {/* Preview Column */}
        <div className="col-span-1">
          <div className="sticky top-4">
            <ImagePreview
              fabricCanvas={fabricCanvas}
              selectedImage={selectedImage}
              adjustments={currentAdjustments}
              showBeforeAfter={true}
              onToggleBeforeAfter={() => console.log('Toggle before/after')}
            />
          </div>
        </div>
      </div>
    </SlidingPanel>
  );
};
