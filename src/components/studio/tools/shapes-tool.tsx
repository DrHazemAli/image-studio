'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SquareIcon,
  CircleIcon,
  TriangleUpIcon,
  Cross2Icon,
  ColorWheelIcon,
  BorderWidthIcon,
  OpacityIcon,
} from '@radix-ui/react-icons';
import { Button, Slider } from '@radix-ui/themes';

interface Shape {
  type: 'rectangle' | 'circle' | 'triangle';
  name: string;
  icon: React.ReactNode;
}

interface ShapeStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

interface ShapesToolProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShape: (shapeType: string, style: ShapeStyle) => void;
}

const SHAPES: Shape[] = [
  {
    type: 'rectangle',
    name: 'Rectangle',
    icon: <SquareIcon className="w-5 h-5" />,
  },
  {
    type: 'circle',
    name: 'Circle',
    icon: <CircleIcon className="w-5 h-5" />,
  },
  {
    type: 'triangle',
    name: 'Triangle',
    icon: <TriangleUpIcon className="w-5 h-5" />,
  },
];

const PRESET_COLORS = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#008000',
  '#000080',
  '#800000',
  '#808080',
  '#000000',
  '#FFFFFF',
  '#C0C0C0',
  '#FFC0CB',
  '#A52A2A',
  '#FFD700',
];

export default function ShapesTool({
  isOpen,
  onClose,
  onAddShape,
}: ShapesToolProps) {
  const [selectedShape, setSelectedShape] = useState<Shape>(SHAPES[0]);
  const [style, setStyle] = useState<ShapeStyle>({
    fillColor: '#FF0000',
    strokeColor: '#000000',
    strokeWidth: 2,
    opacity: 100,
  });

  const handleShapeSelect = useCallback((shape: Shape) => {
    setSelectedShape(shape);
  }, []);

  const handleColorChange = useCallback(
    (colorType: 'fill' | 'stroke', color: string) => {
      setStyle((prev) => ({
        ...prev,
        [colorType === 'fill' ? 'fillColor' : 'strokeColor']: color,
      }));
    },
    []
  );

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStyle((prev) => ({
      ...prev,
      strokeWidth: width,
    }));
  }, []);

  const handleOpacityChange = useCallback((opacity: number) => {
    setStyle((prev) => ({
      ...prev,
      opacity: opacity,
    }));
  }, []);

  const handleAddShape = useCallback(() => {
    onAddShape(selectedShape.type, style);
    onClose();
  }, [selectedShape.type, style, onAddShape, onClose]);

  const handleReset = useCallback(() => {
    setStyle({
      fillColor: '#FF0000',
      strokeColor: '#000000',
      strokeWidth: 2,
      opacity: 100,
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full h-[60vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <SquareIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Shape
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
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Shape Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Shape
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {SHAPES.map((shape) => (
                    <button
                      key={shape.type}
                      onClick={() => handleShapeSelect(shape)}
                      className={`p-4 border rounded-lg transition-colors ${
                        selectedShape.type === shape.type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {shape.icon}
                        <span className="text-xs font-medium">
                          {shape.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fill Color */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fill Color
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
                    placeholder="#FF0000"
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
                      const color = prompt(
                        'Enter hex color:',
                        style.strokeColor
                      );
                      if (color) handleColorChange('stroke', color);
                    }}
                  />
                  <input
                    type="text"
                    value={style.strokeColor}
                    onChange={(e) =>
                      handleColorChange('stroke', e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                    placeholder="#000000"
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
                  max="20"
                  value={style.strokeWidth}
                  onChange={(e) =>
                    handleStrokeWidthChange(parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0px</span>
                  <span>20px</span>
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
                  onChange={(e) =>
                    handleOpacityChange(parseInt(e.target.value))
                  }
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
                    className="w-16 h-16 border-2"
                    style={{
                      backgroundColor: style.fillColor,
                      borderColor: style.strokeColor,
                      borderWidth: `${style.strokeWidth}px`,
                      opacity: style.opacity / 100,
                      borderRadius:
                        selectedShape.type === 'circle'
                          ? '50%'
                          : selectedShape.type === 'triangle'
                            ? '0'
                            : '0',
                      clipPath:
                        selectedShape.type === 'triangle'
                          ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                          : 'none',
                    }}
                  />
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
                <Button onClick={handleAddShape}>Add Shape</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
