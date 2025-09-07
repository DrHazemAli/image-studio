'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TextIcon, 
  Cross2Icon,
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  PaletteIcon
} from '@radix-ui/react-icons';
import { Button, Select } from '@radix-ui/themes';

interface TextStyle {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

interface TextToolProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: (text: string, style: TextStyle) => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Palatino',
  'Garamond',
  'Bookman',
  'Avant Garde',
  'Helvetica Neue',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins'
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96, 120];

const PRESET_COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#008000', '#000080', '#800000', '#808080',
  '#000000', '#FFFFFF', '#C0C0C0', '#FFC0CB', '#A52A2A', '#FFD700'
];

export default function TextTool({
  isOpen,
  onClose,
  onAddText
}: TextToolProps) {
  const [style, setStyle] = useState<TextStyle>({
    text: 'Enter your text here',
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    fillColor: '#000000',
    strokeColor: '#FFFFFF',
    strokeWidth: 0,
    opacity: 100
  });

  const handleTextChange = useCallback((text: string) => {
    setStyle(prev => ({ ...prev, text }));
  }, []);

  const handleStyleChange = useCallback((property: keyof TextStyle, value: any) => {
    setStyle(prev => ({ ...prev, [property]: value }));
  }, []);

  const handleColorChange = useCallback((colorType: 'fill' | 'stroke', color: string) => {
    setStyle(prev => ({
      ...prev,
      [colorType === 'fill' ? 'fillColor' : 'strokeColor']: color
    }));
  }, []);

  const handleAddText = useCallback(() => {
    if (style.text.trim()) {
      onAddText(style.text, style);
      onClose();
    }
  }, [style, onAddText, onClose]);

  const handleReset = useCallback(() => {
    setStyle({
      text: 'Enter your text here',
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      fillColor: '#000000',
      strokeColor: '#FFFFFF',
      strokeWidth: 0,
      opacity: 100
    });
  }, []);

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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <TextIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Text
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
              {/* Text Input */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Text Content
                </h3>
                <textarea
                  value={style.text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                  placeholder="Enter your text here..."
                />
              </div>

              {/* Font Family */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Family
                </h3>
                <select
                  value={style.fontFamily}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Size: {style.fontSize}px
                </h3>
                <div className="grid grid-cols-8 gap-1">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleStyleChange('fontSize', size)}
                      className={`p-2 text-xs border rounded transition-colors ${
                        style.fontSize === size
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Formatting */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Text Formatting
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStyleChange('fontWeight', 
                      style.fontWeight === 'normal' ? 'bold' : 'normal'
                    )}
                    className={`p-2 border rounded transition-colors ${
                      style.fontWeight === 'bold'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="Bold"
                  >
                    <FontBoldIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleStyleChange('fontStyle', 
                      style.fontStyle === 'normal' ? 'italic' : 'normal'
                    )}
                    className={`p-2 border rounded transition-colors ${
                      style.fontStyle === 'italic'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="Italic"
                  >
                    <FontItalicIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleStyleChange('textDecoration', 
                      style.textDecoration === 'none' ? 'underline' : 'none'
                    )}
                    className={`p-2 border rounded transition-colors ${
                      style.textDecoration === 'underline'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="Underline"
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Text Alignment
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStyleChange('textAlign', 'left')}
                    className={`p-2 border rounded transition-colors ${
                      style.textAlign === 'left'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="Align Left"
                  >
                    <TextAlignLeftIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleStyleChange('textAlign', 'center')}
                    className={`p-2 border rounded transition-colors ${
                      style.textAlign === 'center'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="Align Center"
                  >
                    <TextAlignCenterIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleStyleChange('textAlign', 'right')}
                    className={`p-2 border rounded transition-colors ${
                      style.textAlign === 'right'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="Align Right"
                  >
                    <TextAlignRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Fill Color */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Text Color
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    style={{ backgroundColor: style.fillColor }}
                    onClick={() => {
                      const color = prompt('Enter hex color:', style.fillColor);
                      if (color) handleColorChange('fill', color);
                    }}
                  />
                  <input
                    type="text"
                    value={style.fillColor}
                    onChange={(e) => handleColorChange('fill', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
                
                {/* Color Presets */}
                <div className="grid grid-cols-9 gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange('fill', color)}
                      className="w-6 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Color */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stroke Color
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    style={{ backgroundColor: style.strokeColor }}
                    onClick={() => {
                      const color = prompt('Enter hex color:', style.strokeColor);
                      if (color) handleColorChange('stroke', color);
                    }}
                  />
                  <input
                    type="text"
                    value={style.strokeColor}
                    onChange={(e) => handleColorChange('stroke', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              {/* Stroke Width */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stroke Width: {style.strokeWidth}px
                </h3>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={style.strokeWidth}
                  onChange={(e) => handleStyleChange('strokeWidth', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0px</span>
                  <span>10px</span>
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Opacity: {style.opacity}%
                </h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={style.opacity}
                  onChange={(e) => handleStyleChange('opacity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview
                </h3>
                <div className="flex justify-center p-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div
                    className="text-center"
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: `${Math.min(style.fontSize, 32)}px`,
                      fontWeight: style.fontWeight,
                      fontStyle: style.fontStyle,
                      textDecoration: style.textDecoration,
                      textAlign: style.textAlign,
                      color: style.fillColor,
                      WebkitTextStroke: style.strokeWidth > 0 ? `${style.strokeWidth}px ${style.strokeColor}` : 'none',
                      opacity: style.opacity / 100
                    }}
                  >
                    {style.text || 'Preview'}
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
                  onClick={handleAddText}
                  disabled={!style.text.trim()}
                >
                  Add Text
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
