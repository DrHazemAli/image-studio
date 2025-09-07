'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MixerHorizontalIcon, 
  Cross2Icon,
  SunIcon,
  MoonIcon,
  ColorWheelIcon,
  EyeClosedIcon,
  ShadowIcon
} from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  noise: number;
  sepia: number;
  grayscale: number;
  invert: boolean;
  opacity: number;
}

interface FilterPreset {
  name: string;
  icon: React.ReactNode;
  settings: Partial<FilterSettings>;
}

interface FiltersToolProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedImage: any;
  onApplyFilter: (settings: FilterSettings) => void;
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'Original',
    icon: <ColorWheelIcon className="w-4 h-4" />,
    settings: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      noise: 0,
      sepia: 0,
      grayscale: 0,
      invert: false,
      opacity: 100
    }
  },
  {
    name: 'Bright',
    icon: <SunIcon className="w-4 h-4" />,
    settings: {
      brightness: 20,
      contrast: 10,
      saturation: 5
    }
  },
  {
    name: 'Dark',
    icon: <MoonIcon className="w-4 h-4" />,
    settings: {
      brightness: -20,
      contrast: 15,
      saturation: -10
    }
  },
  {
    name: 'Vintage',
    icon: <ShadowIcon className="w-4 h-4" />,
    settings: {
      sepia: 30,
      contrast: 10,
      brightness: -5,
      saturation: -20
    }
  },
  {
    name: 'Black & White',
    icon: <EyeClosedIcon className="w-4 h-4" />,
    settings: {
      grayscale: 100,
      contrast: 20
    }
  },
  {
    name: 'High Contrast',
    icon: <MixerHorizontalIcon className="w-4 h-4" />,
    settings: {
      contrast: 50,
      brightness: 5
    }
  }
];

export default function FiltersTool({
  isOpen,
  onClose,
  selectedImage,
  onApplyFilter
}: FiltersToolProps) {
  const [settings, setSettings] = useState<FilterSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sharpen: 0,
    noise: 0,
    sepia: 0,
    grayscale: 0,
    invert: false,
    opacity: 100
  });

  const [selectedPreset, setSelectedPreset] = useState<FilterPreset>(FILTER_PRESETS[0]);

  const handlePresetSelect = useCallback((preset: FilterPreset) => {
    setSelectedPreset(preset);
    setSettings(prev => ({
      ...prev,
      ...preset.settings
    }));
  }, []);

  const handleSettingChange = useCallback((property: keyof FilterSettings, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [property]: value
    }));
  }, []);

  const handleApplyFilter = useCallback(() => {
    onApplyFilter(settings);
    onClose();
  }, [settings, onApplyFilter, onClose]);

  const handleReset = useCallback(() => {
    setSettings({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      noise: 0,
      sepia: 0,
      grayscale: 0,
      invert: false,
      opacity: 100
    });
    setSelectedPreset(FILTER_PRESETS[0]);
  }, []);

  const generateFilterCSS = useCallback(() => {
    const filters = [];
    
    if (settings.brightness !== 0) filters.push(`brightness(${100 + settings.brightness}%)`);
    if (settings.contrast !== 0) filters.push(`contrast(${100 + settings.contrast}%)`);
    if (settings.saturation !== 0) filters.push(`saturate(${100 + settings.saturation}%)`);
    if (settings.hue !== 0) filters.push(`hue-rotate(${settings.hue}deg)`);
    if (settings.blur !== 0) filters.push(`blur(${settings.blur}px)`);
    if (settings.sepia !== 0) filters.push(`sepia(${settings.sepia}%)`);
    if (settings.grayscale !== 0) filters.push(`grayscale(${settings.grayscale}%)`);
    if (settings.invert) filters.push('invert(100%)');
    
    return filters.join(' ');
  }, [settings]);

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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <MixerHorizontalIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Image Filters
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
              {/* Filter Presets */}
              <div className="w-64 p-6 border-r border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Presets
                </h3>
                
                <div className="space-y-2">
                  {FILTER_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        selectedPreset.name === preset.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {preset.icon}
                        <span className="font-medium text-sm">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex-1 p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Basic Adjustments */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Basic Adjustments
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Brightness: {settings.brightness > 0 ? '+' : ''}{settings.brightness}
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={settings.brightness}
                          onChange={(e) => handleSettingChange('brightness', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Contrast: {settings.contrast > 0 ? '+' : ''}{settings.contrast}
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={settings.contrast}
                          onChange={(e) => handleSettingChange('contrast', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Saturation: {settings.saturation > 0 ? '+' : ''}{settings.saturation}
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={settings.saturation}
                          onChange={(e) => handleSettingChange('saturation', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Hue: {settings.hue}°
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={settings.hue}
                          onChange={(e) => handleSettingChange('hue', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Effects */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Effects
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Blur: {settings.blur}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={settings.blur}
                          onChange={(e) => handleSettingChange('blur', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Sepia: {settings.sepia}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.sepia}
                          onChange={(e) => handleSettingChange('sepia', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Grayscale: {settings.grayscale}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.grayscale}
                          onChange={(e) => handleSettingChange('grayscale', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="invert"
                          checked={settings.invert}
                          onChange={(e) => handleSettingChange('invert', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="invert" className="text-sm text-gray-700 dark:text-gray-300">
                          Invert Colors
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Opacity */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Opacity
                    </h3>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Opacity: {settings.opacity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.opacity}
                        onChange={(e) => handleSettingChange('opacity', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="w-80 p-6 border-l border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Preview
                </h3>
                
                <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div
                    className="w-full h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${selectedImage.getSrc()})`,
                      filter: generateFilterCSS(),
                      opacity: settings.opacity / 100
                    }}
                  />
                  
                  {/* Filter Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3">
                    <div className="text-xs space-y-1">
                      <div>Brightness: {settings.brightness > 0 ? '+' : ''}{settings.brightness}</div>
                      <div>Contrast: {settings.contrast > 0 ? '+' : ''}{settings.contrast}</div>
                      <div>Saturation: {settings.saturation > 0 ? '+' : ''}{settings.saturation}</div>
                      {settings.blur > 0 && <div>Blur: {settings.blur}px</div>}
                      {settings.sepia > 0 && <div>Sepia: {settings.sepia}%</div>}
                      {settings.grayscale > 0 && <div>Grayscale: {settings.grayscale}%</div>}
                      {settings.invert && <div>Inverted</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="soft"
                color="gray"
                onClick={handleReset}
              >
                Reset
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="soft"
                  color="gray"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyFilter}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
