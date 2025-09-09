'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas as FabricCanvas, FabricObject } from 'fabric';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Button } from '@radix-ui/themes';
import {
  ColorWheelIcon,
  SunIcon,
  EyeOpenIcon,
  MixIcon,
  ResetIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagicWandIcon,
  TargetIcon,
  ImageIcon
} from '@radix-ui/react-icons';

// Import our components
import { SlidingPanel } from './sliding-panel';
import { AdjustmentSlider } from '../controls/adjustment-slider';
import { ImagePreview } from '../controls/image-preview';
import { useRealTimePreview, ImageAdjustments, DEFAULT_ADJUSTMENTS } from '../hooks/use-real-time-preview';

/**
 * Props interface for the ColorAdjustmentsPanel component
 */
export interface ColorAdjustmentsPanelProps {
  // Panel state
  isOpen: boolean;
  onClose: () => void;
  
  // Canvas integration
  fabricCanvas: FabricCanvas | null;
  selectedImage: FabricObject | null;
  
  // Callbacks
  onApplyAdjustments?: (adjustments: ImageAdjustments) => void;
  onResetAdjustments?: () => void;
}

/**
 * Adjustment preset interface
 */
interface AdjustmentPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  adjustments: Partial<ImageAdjustments>;
  category: 'enhancement' | 'correction' | 'creative';
}

/**
 * Predefined adjustment presets
 */
const ADJUSTMENT_PRESETS: AdjustmentPreset[] = [
  {
    id: 'auto-enhance',
    name: 'Auto Enhance',
    icon: <MagicWandIcon className="w-4 h-4" />,
    description: 'Automatic color and exposure correction',
    adjustments: {
      brightness: 10,
      contrast: 15,
      saturation: 8,
      vibrance: 12,
      clarity: 10
    },
    category: 'enhancement'
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: <EyeOpenIcon className="w-4 h-4" />,
    description: 'Optimized for skin tones and portraits',
    adjustments: {
      brightness: 5,
      contrast: 8,
      vibrance: -5,
      clarity: 15,
      sharpness: 20,
      temperature: 10
    },
    category: 'enhancement'
  },
  {
    id: 'landscape',
    name: 'Landscape',
    icon: <ImageIcon className="w-4 h-4" />,
    description: 'Enhanced colors and clarity for landscapes',
    adjustments: {
      contrast: 20,
      saturation: 15,
      vibrance: 20,
      clarity: 25,
      sharpness: 15
    },
    category: 'enhancement'
  },
  {
    id: 'fix-exposure',
    name: 'Fix Exposure',
    icon: <SunIcon className="w-4 h-4" />,
    description: 'Correct over/under exposed images',
    adjustments: {
      exposure: 15,
      highlights: -25,
      shadows: 30,
      brightness: 8
    },
    category: 'correction'
  },
  {
    id: 'moody',
    name: 'Moody',
    icon: <TargetIcon className="w-4 h-4" />,
    description: 'Dark, atmospheric look',
    adjustments: {
      brightness: -15,
      contrast: 25,
      saturation: -10,
      temperature: -20,
      vignette: 40,
      clarity: 20
    },
    category: 'creative'
  }
];

/**
 * Color Adjustments Panel Component
 * Professional-grade color adjustment tools with real-time preview
 */
export const ColorAdjustmentsPanel: React.FC<ColorAdjustmentsPanelProps> = ({
  isOpen,
  onClose,
  fabricCanvas,
  selectedImage,
  onApplyAdjustments,
  onResetAdjustments
}) => {
  // State
  const [selectedPreset, setSelectedPreset] = useState<string>('original');
  const [currentAdjustments, setCurrentAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'light']));
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  
  // Real-time preview hook
  const {
    isProcessing,
    applyAdjustments,
    resetAdjustments,
    getCurrentAdjustments
  } = useRealTimePreview(fabricCanvas, selectedImage, {
    debounceMs: 16, // 60fps for smooth real-time editing
    showProcessingIndicator: true,
    onError: (error) => console.error('Preview error:', error)
  });

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: AdjustmentPreset) => {
    setSelectedPreset(preset.id);
    const newAdjustments = { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments };
    setCurrentAdjustments(newAdjustments);
    applyAdjustments(newAdjustments, false);
  }, [applyAdjustments]);

  // Handle individual adjustment changes
  const handleAdjustmentChange = useCallback((key: keyof ImageAdjustments, value: number | boolean) => {
    const newAdjustments = { ...currentAdjustments, [key]: value };
    setCurrentAdjustments(newAdjustments);
    applyAdjustments(newAdjustments, false);
    
    // Clear preset selection if manually adjusting
    if (selectedPreset !== 'custom') {
      setSelectedPreset('custom');
    }
  }, [currentAdjustments, applyAdjustments, selectedPreset]);

  // Handle section expand/collapse
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
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
    onResetAdjustments?.();
  }, [resetAdjustments, onResetAdjustments]);

  // Handle apply and close
  const handleApply = useCallback(() => {
    onApplyAdjustments?.(currentAdjustments);
    onClose();
  }, [currentAdjustments, onApplyAdjustments, onClose]);

  // Toggle before/after preview
  const toggleBeforeAfter = useCallback(() => {
    if (showBeforeAfter) {
      applyAdjustments(currentAdjustments, true);
    } else {
      resetAdjustments();
    }
    setShowBeforeAfter(!showBeforeAfter);
  }, [showBeforeAfter, currentAdjustments, applyAdjustments, resetAdjustments]);

  // Don't automatically reset adjustments when panel closes
  // This was causing filters to be reverted immediately after application
  const hasOpenedRef = useRef(false);
  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      // Reset showBeforeAfter when panel opens
      setShowBeforeAfter(false);
    }
    // Removed automatic resetAdjustments() on close to prevent filter reversion
  }, [isOpen]);

  // Check if any adjustments are applied
  const hasAdjustments = Object.entries(currentAdjustments).some(([key, value]) => {
    const defaultValue = DEFAULT_ADJUSTMENTS[key as keyof ImageAdjustments];
    return value !== defaultValue;
  });

  // Footer actions
  const footerActions = (
    <div className="flex flex-col gap-3">
      {/* Before/After toggle */}
      {hasAdjustments && (
        <Button
          variant="soft"
          color="blue"
          onClick={toggleBeforeAfter}
          disabled={isProcessing}
          className="w-full"
        >
          {showBeforeAfter ? 'Show After' : 'Show Before'}
        </Button>
      )}
      
      <div className="flex gap-3">
        <Button
          variant="soft"
          color="gray"
          onClick={handleResetAll}
          disabled={isProcessing || !hasAdjustments}
        >
          <ResetIcon className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          variant="soft"
          color="gray"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          disabled={isProcessing}
          className="flex-1"
        >
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <SlidingPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Color Adjustments"
      icon={<ColorWheelIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      width="xl"
      actions={footerActions}
      className="text-sm"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="col-span-2 space-y-6">
        {/* Adjustment Presets */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Adjustments</h3>
          <div className="grid grid-cols-1 gap-2">
            {ADJUSTMENT_PRESETS.map((preset) => (
              <motion.button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`
                  p-3 rounded-xl border-2 transition-all text-left
                  ${selectedPreset === preset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                  ${preset.category === 'enhancement' ? 'bg-green-50 dark:bg-green-900/10' :
                    preset.category === 'correction' ? 'bg-orange-50 dark:bg-orange-900/10' :
                    'bg-purple-50 dark:bg-purple-900/10'}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    {preset.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{preset.name}</span>
                      <span className={`
                        px-2 py-0.5 text-xs rounded-full
                        ${preset.category === 'enhancement' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          preset.category === 'correction' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'}
                      `}>
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {preset.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Manual Adjustments */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Manual Adjustments</h3>
          
          {/* Basic Adjustments Section */}
          <Collapsible.Root
            open={expandedSections.has('basic')}
            onOpenChange={() => toggleSection('basic')}
          >
            <Collapsible.Trigger asChild>
              <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-2">
                  <MixIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Basic</span>
                </div>
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
                        label="Exposure"
                        value={currentAdjustments.exposure}
                        onChange={(value) => handleAdjustmentChange('exposure', value)}
                        min={-200}
                        max={200}
                        step={5}
                        defaultValue={0}
                        unit=""
                        color="orange"
                        description="Adjust overall image brightness"
                        formatValue={(value) => `${value > 0 ? '+' : ''}${(value / 100).toFixed(1)} stop`}
                      />
                      <AdjustmentSlider
                        label="Brightness"
                        value={currentAdjustments.brightness}
                        onChange={(value) => handleAdjustmentChange('brightness', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        color="orange"
                        description="Adjust midtone lightness"
                      />
                      <AdjustmentSlider
                        label="Contrast"
                        value={currentAdjustments.contrast}
                        onChange={(value) => handleAdjustmentChange('contrast', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        color="blue"
                        description="Adjust difference between light and dark areas"
                      />
                    </div>
                  </motion.div>
                </Collapsible.Content>
              )}
            </AnimatePresence>
          </Collapsible.Root>

          {/* Light Section */}
          <Collapsible.Root
            open={expandedSections.has('light')}
            onOpenChange={() => toggleSection('light')}
          >
            <Collapsible.Trigger asChild>
              <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-2">
                  <SunIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Light</span>
                </div>
                {expandedSections.has('light') ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </Collapsible.Trigger>
            <AnimatePresence>
              {expandedSections.has('light') && (
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
                        label="Highlights"
                        value={currentAdjustments.highlights}
                        onChange={(value) => handleAdjustmentChange('highlights', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit=""
                        color="orange"
                        description="Recover or enhance bright areas"
                      />
                      <AdjustmentSlider
                        label="Shadows"
                        value={currentAdjustments.shadows}
                        onChange={(value) => handleAdjustmentChange('shadows', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit=""
                        color="blue"
                        description="Lift or darken shadow areas"
                      />
                      <AdjustmentSlider
                        label="Whites"
                        value={currentAdjustments.whites}
                        onChange={(value) => handleAdjustmentChange('whites', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit=""
                        color="gray"
                        description="Adjust the brightest areas"
                      />
                      <AdjustmentSlider
                        label="Blacks"
                        value={currentAdjustments.blacks}
                        onChange={(value) => handleAdjustmentChange('blacks', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit=""
                        color="gray"
                        description="Adjust the darkest areas"
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
                <div className="flex items-center gap-2">
                  <ColorWheelIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Color</span>
                </div>
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
                        label="Temperature"
                        value={currentAdjustments.temperature}
                        onChange={(value) => handleAdjustmentChange('temperature', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit=""
                        color="orange"
                        description="Adjust warm/cool color balance"
                        marks={[
                          { value: -100, label: 'Cool' },
                          { value: 0, label: 'Auto' },
                          { value: 100, label: 'Warm' }
                        ]}
                      />
                      <AdjustmentSlider
                        label="Tint"
                        value={currentAdjustments.tint}
                        onChange={(value) => handleAdjustmentChange('tint', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit=""
                        color="green"
                        description="Adjust green/magenta color balance"
                        marks={[
                          { value: -100, label: 'Green' },
                          { value: 0, label: 'Auto' },
                          { value: 100, label: 'Magenta' }
                        ]}
                      />
                      <AdjustmentSlider
                        label="Saturation"
                        value={currentAdjustments.saturation}
                        onChange={(value) => handleAdjustmentChange('saturation', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        color="red"
                        description="Adjust color intensity for all colors"
                      />
                      <AdjustmentSlider
                        label="Vibrance"
                        value={currentAdjustments.vibrance}
                        onChange={(value) => handleAdjustmentChange('vibrance', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        color="purple"
                        description="Smart saturation that protects skin tones"
                      />
                    </div>
                  </motion.div>
                </Collapsible.Content>
              )}
            </AnimatePresence>
          </Collapsible.Root>

          {/* Detail Section */}
          <Collapsible.Root
            open={expandedSections.has('detail')}
            onOpenChange={() => toggleSection('detail')}
          >
            <Collapsible.Trigger asChild>
              <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-2">
                  <TargetIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Detail</span>
                </div>
                {expandedSections.has('detail') ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </Collapsible.Trigger>
            <AnimatePresence>
              {expandedSections.has('detail') && (
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
                        label="Sharpness"
                        value={currentAdjustments.sharpness}
                        onChange={(value) => handleAdjustmentChange('sharpness', value)}
                        min={0}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        color="blue"
                        description="Enhance edge definition"
                      />
                      <AdjustmentSlider
                        label="Clarity"
                        value={currentAdjustments.clarity}
                        onChange={(value) => handleAdjustmentChange('clarity', value)}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        color="green"
                        description="Enhance midtone contrast and texture"
                      />
                      <AdjustmentSlider
                        label="Denoise"
                        value={currentAdjustments.denoise}
                        onChange={(value) => handleAdjustmentChange('denoise', value)}
                        min={0}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        color="purple"
                        description="Reduce image noise and grain"
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
              Applying adjustments...
            </div>
          </div>
        )}

        {/* Show Before/After indicator */}
        {showBeforeAfter && (
          <div className="flex items-center justify-center py-2">
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
              Showing original image
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
              onToggleBeforeAfter={toggleBeforeAfter}
            />
          </div>
        </div>
      </div>
    </SlidingPanel>
  );
};