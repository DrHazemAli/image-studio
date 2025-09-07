'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeOpenIcon, 
  EyeClosedIcon, 
  LockClosedIcon, 
  LockOpen1Icon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  DragHandleDots2Icon,
  ImageIcon,
  TextIcon,
  SquareIcon,
  CircleIcon,
  TriangleIcon
} from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { FabricObject } from 'fabric';

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'background';
  visible: boolean;
  locked: boolean;
  opacity: number;
  object?: FabricObject;
  thumbnail?: string;
}

interface LayerManagerProps {
  layers: Layer[];
  activeLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerReorder: (fromIndex: number, toIndex: number) => void;
  onAddLayer: (type: 'text' | 'shape') => void;
}

export default function LayerManager({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerOpacityChange,
  onLayerDelete,
  onLayerDuplicate,
  onLayerReorder,
  onAddLayer
}: LayerManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'text':
        return <TextIcon className="w-4 h-4" />;
      case 'shape':
        return <SquareIcon className="w-4 h-4" />;
      case 'background':
        return <SquareIcon className="w-4 h-4" />;
      default:
        return <SquareIcon className="w-4 h-4" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onLayerReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Layers
          </h3>
          <div className="flex gap-1">
            <Button
              size="1"
              variant="soft"
              onClick={() => onAddLayer('text')}
              title="Add Text Layer"
            >
              <TextIcon className="w-3 h-3" />
            </Button>
            <Button
              size="1"
              variant="soft"
              onClick={() => onAddLayer('shape')}
              title="Add Shape Layer"
            >
              <SquareIcon className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {layers.map((layer, index) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                group relative p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer
                transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50
                ${activeLayerId === layer.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''}
                ${draggedIndex === index ? 'opacity-50' : ''}
              `}
              onClick={() => onLayerSelect(layer.id)}
            >
              {/* Drag Handle */}
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DragHandleDots2Icon className="w-3 h-3 text-gray-400" />
              </div>

              <div className="flex items-center gap-3 ml-4">
                {/* Layer Icon */}
                <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                  {getLayerIcon(layer.type)}
                </div>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {layer.name}
                    </span>
                    {layer.type === 'background' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        Background
                      </span>
                    )}
                  </div>
                  
                  {/* Opacity Slider */}
                  <div className="mt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity}
                      onChange={(e) => onLayerOpacityChange(layer.id, parseInt(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {layer.opacity}%
                    </div>
                  </div>
                </div>

                {/* Layer Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleVisibility(layer.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? (
                      <EyeOpenIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <EyeClosedIcon className="w-3 h-3 text-gray-400" />
                    )}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleLock(layer.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {layer.locked ? (
                      <LockClosedIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <LockOpen1Icon className="w-3 h-3 text-gray-400" />
                    )}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDuplicate(layer.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Duplicate Layer"
                  >
                    <CopyIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>

                  {/* Delete */}
                  {layer.type !== 'background' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerDelete(layer.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete Layer"
                    >
                      <TrashIcon className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {layers.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No layers yet</p>
            <p className="text-xs">Add an image or create layers</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
